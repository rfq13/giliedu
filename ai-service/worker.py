"""
RabbitMQ Worker untuk evaluasi cerita.
Sesuai ADR-002: Semua heavy process WAJIB async via RabbitMQ.
"""

import pika
import psycopg2
import logging
from typing import Optional

from config import Config
from models import StoryInput, AgeLevel
from graph import evaluate_story

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class StoryEvaluationWorker:
    def __init__(self):
        self.connection: Optional[pika.BlockingConnection] = None
        self.channel = None
        self.db_conn = None
    
    def connect_rabbitmq(self):
        """Connect to RabbitMQ."""
        params = pika.URLParameters(Config.RABBITMQ_URL)
        self.connection = pika.BlockingConnection(params)
        self.channel = self.connection.channel()
        
        # Declare queues
        self.channel.queue_declare(queue=Config.QUEUE_NAME, durable=True)
        self.channel.queue_declare(queue=Config.DLQ_NAME, durable=True)
        
        # Set prefetch count for fair dispatch
        self.channel.basic_qos(prefetch_count=1)
        
        logger.info(f"Connected to RabbitMQ, listening on {Config.QUEUE_NAME}")
    
    def connect_db(self):
        """Connect to PostgreSQL."""
        self.db_conn = psycopg2.connect(
            host=Config.DB_HOST,
            port=Config.DB_PORT,
            user=Config.DB_USER,
            password=Config.DB_PASSWORD,
            database=Config.DB_NAME,
        )
        logger.info("Connected to PostgreSQL")
    
    def get_story(self, story_id: str) -> Optional[dict]:
        """Fetch story from database."""
        cursor = self.db_conn.cursor()
        cursor.execute("""
            SELECT s.id, s.user_id, s.content, s.input_type, s.prompt_title, u.level
            FROM stories s
            JOIN users u ON s.user_id = u.id
            WHERE s.id = %s
        """, (story_id,))
        
        row = cursor.fetchone()
        cursor.close()
        
        if row:
            return {
                "story_id": row[0],
                "user_id": row[1],
                "content": row[2] or "",
                "input_type": row[3],
                "prompt_title": row[4],
                "age_level": row[5] or "sd",
            }
        return None
    
    def update_story_status(self, story_id: str, status: str):
        """Update story status in database."""
        cursor = self.db_conn.cursor()
        cursor.execute("""
            UPDATE stories SET status = %s, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        """, (status, story_id))
        self.db_conn.commit()
        cursor.close()
    
    def save_feedback(self, story_id: str, evaluation):
        """Save evaluation feedback to database."""
        cursor = self.db_conn.cursor()
        
        # Convert lists to PostgreSQL array format
        strengths = evaluation.strengths if evaluation.strengths else []
        improvements = evaluation.improvements if evaluation.improvements else []
        
        cursor.execute("""
            INSERT INTO story_feedback (
                story_id, clarity_score, structure_score, creativity_score,
                expression_score, overall_score, feedback_text, strengths, improvements
            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            ON CONFLICT (story_id) DO UPDATE SET
                clarity_score = EXCLUDED.clarity_score,
                structure_score = EXCLUDED.structure_score,
                creativity_score = EXCLUDED.creativity_score,
                expression_score = EXCLUDED.expression_score,
                overall_score = EXCLUDED.overall_score,
                feedback_text = EXCLUDED.feedback_text,
                strengths = EXCLUDED.strengths,
                improvements = EXCLUDED.improvements
        """, (
            story_id,
            evaluation.clarity_score,
            evaluation.structure_score,
            evaluation.creativity_score,
            evaluation.expression_score,
            evaluation.overall_score,
            evaluation.feedback_text,
            strengths,
            improvements,
        ))
        self.db_conn.commit()
        cursor.close()
    
    def update_skill_progress(self, user_id: str, evaluation):
        """Update user's skill progress based on evaluation."""
        cursor = self.db_conn.cursor()
        
        # Map scores to skills
        skill_scores = {
            "Kejelasan Bertutur": evaluation.clarity_score,
            "Alur Cerita": evaluation.structure_score,
            "Ekspresi Perasaan": evaluation.expression_score,
            "Kreativitas": evaluation.creativity_score,
        }
        
        for skill_name, score in skill_scores.items():
            # Get skill ID
            cursor.execute("SELECT id FROM skills WHERE name = %s", (skill_name,))
            skill_row = cursor.fetchone()
            if not skill_row:
                continue
            
            skill_id = skill_row[0]
            
            # Update progress
            # Progress increases based on score, level up every 100 progress points
            progress_gain = score // 10  # 0-10 points per story
            
            cursor.execute("""
                INSERT INTO skill_progress (user_id, skill_id, level, progress, total_stories)
                VALUES (%s, %s, 1, %s, 1)
                ON CONFLICT (user_id, skill_id) DO UPDATE SET
                    progress = CASE 
                        WHEN skill_progress.progress + %s >= 100 
                        THEN (skill_progress.progress + %s) %% 100
                        ELSE skill_progress.progress + %s
                    END,
                    level = CASE 
                        WHEN skill_progress.progress + %s >= 100 
                        THEN skill_progress.level + 1
                        ELSE skill_progress.level
                    END,
                    total_stories = skill_progress.total_stories + 1,
                    updated_at = CURRENT_TIMESTAMP
            """, (user_id, skill_id, progress_gain, progress_gain, progress_gain, progress_gain, progress_gain))
        
        self.db_conn.commit()
        cursor.close()
    
    def process_message(self, ch, method, properties, body):
        """Process a story evaluation message."""
        story_id = body.decode()
        logger.info(f"Processing story: {story_id}")
        
        try:
            # Update status to processing
            self.update_story_status(story_id, "processing")
            
            # Get story from database
            story_data = self.get_story(story_id)
            if not story_data:
                logger.error(f"Story not found: {story_id}")
                ch.basic_ack(delivery_tag=method.delivery_tag)
                return
            
            # Create story input
            story_input = StoryInput(
                story_id=story_data["story_id"],
                user_id=story_data["user_id"],
                content=story_data["content"],
                input_type=story_data["input_type"],
                age_level=AgeLevel(story_data["age_level"]),
                prompt_title=story_data["prompt_title"],
            )
            
            # Evaluate story using LangGraph
            result = evaluate_story(story_input)
            
            if result.evaluation:
                # Save feedback
                self.save_feedback(story_id, result.evaluation)
                
                # Update skill progress
                self.update_skill_progress(story_data["user_id"], result.evaluation)
                
                # Update status to completed
                self.update_story_status(story_id, "completed")
                logger.info(f"Story evaluated successfully: {story_id}")
            else:
                # Update status to failed
                self.update_story_status(story_id, "failed")
                logger.error(f"Evaluation failed for story: {story_id}")
            
            # Acknowledge message
            ch.basic_ack(delivery_tag=method.delivery_tag)
            
        except Exception as e:
            logger.error(f"Error processing story {story_id}: {e}")
            
            # Update status to failed
            try:
                self.update_story_status(story_id, "failed")
            except Exception:
                pass
            
            # Send to DLQ for retry
            try:
                ch.basic_publish(
                    exchange="",
                    routing_key=Config.DLQ_NAME,
                    body=body,
                )
            except Exception:
                pass
            
            # Acknowledge original message
            ch.basic_ack(delivery_tag=method.delivery_tag)
    
    def start(self):
        """Start the worker."""
        self.connect_db()
        self.connect_rabbitmq()
        
        self.channel.basic_consume(
            queue=Config.QUEUE_NAME,
            on_message_callback=self.process_message,
        )
        
        logger.info("Worker started, waiting for messages...")
        self.channel.start_consuming()
    
    def stop(self):
        """Stop the worker."""
        if self.channel:
            self.channel.stop_consuming()
        if self.connection:
            self.connection.close()
        if self.db_conn:
            self.db_conn.close()


if __name__ == "__main__":
    worker = StoryEvaluationWorker()
    try:
        worker.start()
    except KeyboardInterrupt:
        logger.info("Shutting down worker...")
        worker.stop()
