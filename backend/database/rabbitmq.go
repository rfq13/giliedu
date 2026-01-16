package database

import (
	"log"

	"github.com/gili/backend/config"
	amqp "github.com/rabbitmq/amqp091-go"
)

type RabbitMQ struct {
	Conn    *amqp.Connection
	Channel *amqp.Channel
}

func ConnectRabbitMQ(cfg *config.Config) (*RabbitMQ, error) {
	conn, err := amqp.Dial(cfg.RabbitMQURL)
	if err != nil {
		return nil, err
	}

	ch, err := conn.Channel()
	if err != nil {
		conn.Close()
		return nil, err
	}

	// Declare queues
	queues := []string{"story_evaluation", "story_evaluation_dlq"}
	for _, q := range queues {
		_, err := ch.QueueDeclare(
			q,     // name
			true,  // durable
			false, // delete when unused
			false, // exclusive
			false, // no-wait
			nil,   // arguments
		)
		if err != nil {
			log.Printf("Warning: Failed to declare queue %s: %v", q, err)
		}
	}

	log.Println("✅ Connected to RabbitMQ")

	return &RabbitMQ{
		Conn:    conn,
		Channel: ch,
	}, nil
}

func (r *RabbitMQ) Close() {
	if r.Channel != nil {
		r.Channel.Close()
	}
	if r.Conn != nil {
		r.Conn.Close()
	}
}

func (r *RabbitMQ) PublishStoryEvaluation(storyID string) error {
	if r == nil || r.Channel == nil {
		log.Println("Warning: RabbitMQ not available, skipping publish")
		return nil
	}

	return r.Channel.Publish(
		"",                 // exchange
		"story_evaluation", // routing key
		false,              // mandatory
		false,              // immediate
		amqp.Publishing{
			ContentType: "text/plain",
			Body:        []byte(storyID),
		},
	)
}
