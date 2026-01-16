"""
LangGraph pipeline untuk evaluasi cerita.
Sesuai PRD: Semua AI call WAJIB lewat LangGraph.

Alur:
1. Rule-based Validation
2. LangGraph
3. LLM (Optional)
4. Post-validation (Schema & Tone)
"""

import json
from typing import TypedDict
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage

from config import Config
from models import StoryInput, StoryEvaluation, EvaluationState
from prompts import SYSTEM_PROMPT, AGE_PROMPTS, EVALUATION_PROMPT


class GraphState(TypedDict):
    story: StoryInput
    is_valid: bool
    validation_errors: list
    evaluation: StoryEvaluation | None
    error: str | None


def validate_input(state: GraphState) -> GraphState:
    """Rule-based pre-validation sebelum LLM."""
    story = state["story"]
    errors = []
    
    # Check content length
    if not story.content or len(story.content.strip()) < 10:
        errors.append("Cerita terlalu pendek. Minimal 10 karakter.")
    
    if len(story.content) > 10000:
        errors.append("Cerita terlalu panjang. Maksimal 10000 karakter.")
    
    # Check for inappropriate content (basic filter)
    inappropriate_words = ["bodoh", "goblok", "anjing", "babi"]
    content_lower = story.content.lower()
    for word in inappropriate_words:
        if word in content_lower:
            errors.append("Cerita mengandung kata yang tidak pantas.")
            break
    
    state["is_valid"] = len(errors) == 0
    state["validation_errors"] = errors
    
    return state


def should_evaluate(state: GraphState) -> str:
    """Decide whether to proceed with LLM evaluation."""
    if state["is_valid"]:
        return "evaluate"
    return "skip"


def evaluate_with_llm(state: GraphState) -> GraphState:
    """Evaluate story using LLM via LangGraph."""
    story = state["story"]
    
    try:
        # Initialize LLM
        llm = ChatOpenAI(
            model=Config.OPENAI_MODEL,
            api_key=Config.OPENAI_API_KEY,
            temperature=0.7,
        )
        
        # Get age-specific context
        age_context = AGE_PROMPTS.get(story.age_level, AGE_PROMPTS["sd"])
        
        # Build prompt
        prompt = EVALUATION_PROMPT.format(
            prompt_title=story.prompt_title or "Cerita Bebas",
            content=story.content,
            age_context=age_context,
        )
        
        # Call LLM
        messages = [
            SystemMessage(content=SYSTEM_PROMPT),
            HumanMessage(content=prompt),
        ]
        
        response = llm.invoke(messages)
        
        # Parse response
        content = response.content
        
        # Extract JSON from response
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0]
        elif "```" in content:
            content = content.split("```")[1].split("```")[0]
        
        evaluation_data = json.loads(content.strip())
        
        # Create evaluation object
        evaluation = StoryEvaluation(**evaluation_data)
        state["evaluation"] = evaluation
        
    except Exception as e:
        state["error"] = str(e)
        # Fallback evaluation jika LLM gagal
        state["evaluation"] = create_fallback_evaluation(story)
    
    return state


def create_fallback_evaluation(story: StoryInput) -> StoryEvaluation:
    """Fallback evaluation jika LLM tidak tersedia."""
    content_length = len(story.content)
    
    # Simple heuristic-based scoring
    base_score = 60
    if content_length > 100:
        base_score += 10
    if content_length > 300:
        base_score += 10
    
    return StoryEvaluation(
        clarity_score=base_score,
        structure_score=base_score - 5,
        creativity_score=base_score,
        expression_score=base_score - 5,
        overall_score=base_score,
        feedback_text="Terima kasih sudah berbagi ceritamu! Kamu sudah berani bercerita dan itu sangat bagus. Terus berlatih ya! 😊",
        strengths=["Berani bercerita", "Sudah berusaha menyampaikan ide"],
        improvements=["Coba tambahkan lebih banyak detail", "Ceritakan perasaanmu dalam cerita"],
    )


def post_validate(state: GraphState) -> GraphState:
    """Post-validation untuk memastikan output sesuai schema dan tone."""
    evaluation = state["evaluation"]
    
    if evaluation:
        # Ensure minimum scores (AI sebagai coach, bukan hakim)
        if evaluation.clarity_score < 40:
            evaluation.clarity_score = 40
        if evaluation.structure_score < 40:
            evaluation.structure_score = 40
        if evaluation.creativity_score < 40:
            evaluation.creativity_score = 40
        if evaluation.expression_score < 40:
            evaluation.expression_score = 40
        if evaluation.overall_score < 40:
            evaluation.overall_score = 40
        
        # Ensure positive tone in feedback
        negative_words = ["buruk", "jelek", "gagal", "salah"]
        feedback = evaluation.feedback_text
        for word in negative_words:
            feedback = feedback.replace(word, "perlu ditingkatkan")
        evaluation.feedback_text = feedback
        
        # Ensure at least 2 strengths
        if len(evaluation.strengths) < 2:
            evaluation.strengths.append("Sudah berani bercerita")
        
        # Limit improvements to 3
        evaluation.improvements = evaluation.improvements[:3]
        
        state["evaluation"] = evaluation
    
    return state


def create_skip_result(state: GraphState) -> GraphState:
    """Create result for skipped evaluation."""
    state["evaluation"] = StoryEvaluation(
        clarity_score=0,
        structure_score=0,
        creativity_score=0,
        expression_score=0,
        overall_score=0,
        feedback_text="Cerita tidak dapat dievaluasi: " + ", ".join(state["validation_errors"]),
        strengths=[],
        improvements=state["validation_errors"],
    )
    return state


def create_evaluation_graph() -> StateGraph:
    """Create the LangGraph evaluation pipeline."""
    
    # Define the graph
    workflow = StateGraph(GraphState)
    
    # Add nodes
    workflow.add_node("validate", validate_input)
    workflow.add_node("evaluate", evaluate_with_llm)
    workflow.add_node("post_validate", post_validate)
    workflow.add_node("skip", create_skip_result)
    
    # Add edges
    workflow.set_entry_point("validate")
    
    workflow.add_conditional_edges(
        "validate",
        should_evaluate,
        {
            "evaluate": "evaluate",
            "skip": "skip",
        }
    )
    
    workflow.add_edge("evaluate", "post_validate")
    workflow.add_edge("post_validate", END)
    workflow.add_edge("skip", END)
    
    return workflow.compile()


# Create the graph instance
evaluation_graph = create_evaluation_graph()


def evaluate_story(story: StoryInput) -> EvaluationState:
    """Main function to evaluate a story."""
    initial_state = GraphState(
        story=story,
        is_valid=False,
        validation_errors=[],
        evaluation=None,
        error=None,
    )
    
    result = evaluation_graph.invoke(initial_state)
    
    return EvaluationState(
        story=story,
        is_valid=result["is_valid"],
        validation_errors=result["validation_errors"],
        evaluation=result["evaluation"],
        error=result["error"],
    )
