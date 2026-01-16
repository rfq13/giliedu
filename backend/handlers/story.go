package handlers

import (
	"database/sql"
	"strconv"

	"github.com/gili/backend/config"
	"github.com/gili/backend/database"
	"github.com/gili/backend/models"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
)

type StoryHandler struct {
	db  *sql.DB
	cfg *config.Config
	rmq *database.RabbitMQ
}

func NewStoryHandler(db *sql.DB, cfg *config.Config, rmq *database.RabbitMQ) *StoryHandler {
	return &StoryHandler{db: db, cfg: cfg, rmq: rmq}
}

func (h *StoryHandler) CreateStory(c *fiber.Ctx) error {
	userID := c.Locals("userID").(string)

	var req models.CreateStoryRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate input type
	if req.InputType != "audio" && req.InputType != "text" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Input type must be 'audio' or 'text'",
		})
	}

	// For text input, content is required
	if req.InputType == "text" && req.Content == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Content is required for text input",
		})
	}

	storyID := uuid.New().String()

	// Insert story
	_, err := h.db.Exec(`
		INSERT INTO stories (id, user_id, prompt_id, prompt_title, input_type, content, status)
		VALUES ($1, $2, $3, $4, $5, $6, 'pending')
	`, storyID, userID, nullString(req.PromptID), nullString(req.PromptTitle), req.InputType, nullString(req.Content))

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create story",
		})
	}

	// Publish to RabbitMQ for AI evaluation (ADR-002: async processing)
	if h.rmq != nil {
		if err := h.rmq.PublishStoryEvaluation(storyID); err != nil {
			// Log error but don't fail the request
			// Story will be processed later
		}
	}

	// Return created story
	var story models.Story
	h.db.QueryRow(`
		SELECT id, user_id, prompt_id, prompt_title, input_type, content, status, created_at, updated_at
		FROM stories WHERE id = $1
	`, storyID).Scan(
		&story.ID, &story.UserID, &story.PromptID, &story.PromptTitle,
		&story.InputType, &story.Content, &story.Status, &story.CreatedAt, &story.UpdatedAt,
	)

	return c.Status(fiber.StatusCreated).JSON(story)
}

func (h *StoryHandler) GetStories(c *fiber.Ctx) error {
	userID := c.Locals("userID").(string)

	// Pagination
	page, _ := strconv.Atoi(c.Query("page", "1"))
	pageSize, _ := strconv.Atoi(c.Query("page_size", "20"))
	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 50 {
		pageSize = 20
	}
	offset := (page - 1) * pageSize

	// Get total count
	var totalCount int
	h.db.QueryRow("SELECT COUNT(*) FROM stories WHERE user_id = $1", userID).Scan(&totalCount)

	// Get stories
	rows, err := h.db.Query(`
		SELECT s.id, s.user_id, s.prompt_id, s.prompt_title, s.input_type, s.content, 
		       s.audio_url, s.transcript, s.status, s.created_at, s.updated_at,
		       f.id, f.clarity_score, f.structure_score, f.creativity_score, 
		       f.expression_score, f.overall_score, f.feedback_text
		FROM stories s
		LEFT JOIN story_feedback f ON s.id = f.story_id
		WHERE s.user_id = $1
		ORDER BY s.created_at DESC
		LIMIT $2 OFFSET $3
	`, userID, pageSize, offset)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch stories",
		})
	}
	defer rows.Close()

	stories := []models.Story{}
	for rows.Next() {
		var story models.Story
		var feedbackID, feedbackText sql.NullString
		var clarityScore, structureScore, creativityScore, expressionScore, overallScore sql.NullInt64

		err := rows.Scan(
			&story.ID, &story.UserID, &story.PromptID, &story.PromptTitle,
			&story.InputType, &story.Content, &story.AudioURL, &story.Transcript,
			&story.Status, &story.CreatedAt, &story.UpdatedAt,
			&feedbackID, &clarityScore, &structureScore, &creativityScore,
			&expressionScore, &overallScore, &feedbackText,
		)
		if err != nil {
			continue
		}

		if feedbackID.Valid {
			story.Feedback = &models.StoryFeedback{
				ID:              feedbackID.String,
				StoryID:         story.ID,
				ClarityScore:    int(clarityScore.Int64),
				StructureScore:  int(structureScore.Int64),
				CreativityScore: int(creativityScore.Int64),
				ExpressionScore: int(expressionScore.Int64),
				OverallScore:    int(overallScore.Int64),
				FeedbackText:    feedbackText.String,
			}
		}

		stories = append(stories, story)
	}

	return c.JSON(models.StoryListResponse{
		Stories:    stories,
		TotalCount: totalCount,
		Page:       page,
		PageSize:   pageSize,
	})
}

func (h *StoryHandler) GetStory(c *fiber.Ctx) error {
	userID := c.Locals("userID").(string)
	storyID := c.Params("id")

	var story models.Story
	err := h.db.QueryRow(`
		SELECT id, user_id, prompt_id, prompt_title, input_type, content, 
		       audio_url, transcript, status, created_at, updated_at
		FROM stories WHERE id = $1 AND user_id = $2
	`, storyID, userID).Scan(
		&story.ID, &story.UserID, &story.PromptID, &story.PromptTitle,
		&story.InputType, &story.Content, &story.AudioURL, &story.Transcript,
		&story.Status, &story.CreatedAt, &story.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "Story not found",
		})
	}
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Database error",
		})
	}

	// Get feedback if exists
	var feedback models.StoryFeedback
	err = h.db.QueryRow(`
		SELECT id, story_id, clarity_score, structure_score, creativity_score,
		       expression_score, overall_score, feedback_text, created_at
		FROM story_feedback WHERE story_id = $1
	`, storyID).Scan(
		&feedback.ID, &feedback.StoryID, &feedback.ClarityScore, &feedback.StructureScore,
		&feedback.CreativityScore, &feedback.ExpressionScore, &feedback.OverallScore,
		&feedback.FeedbackText, &feedback.CreatedAt,
	)
	if err == nil {
		story.Feedback = &feedback
	}

	return c.JSON(story)
}

func (h *StoryHandler) GetTimeline(c *fiber.Ctx) error {
	userID := c.Locals("userID").(string)

	rows, err := h.db.Query(`
		SELECT s.id, s.prompt_title, s.status, s.created_at, f.overall_score
		FROM stories s
		LEFT JOIN story_feedback f ON s.id = f.story_id
		WHERE s.user_id = $1
		ORDER BY s.created_at DESC
		LIMIT 50
	`, userID)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch timeline",
		})
	}
	defer rows.Close()

	items := []models.TimelineItem{}
	for rows.Next() {
		var id, status string
		var promptTitle sql.NullString
		var createdAt sql.NullTime
		var overallScore sql.NullInt64

		if err := rows.Scan(&id, &promptTitle, &status, &createdAt, &overallScore); err != nil {
			continue
		}

		title := "Cerita"
		if promptTitle.Valid {
			title = "Cerita: " + promptTitle.String
		}

		item := models.TimelineItem{
			ID:          id,
			Type:        "story",
			Title:       title,
			Description: getStatusDescription(status),
			Status:      status,
		}

		if createdAt.Valid {
			item.Date = createdAt.Time
		}

		if overallScore.Valid {
			score := int(overallScore.Int64)
			item.Score = &score
		}

		items = append(items, item)

		// Add feedback item if story is completed
		if status == "completed" && overallScore.Valid {
			feedbackItem := models.TimelineItem{
				ID:          id + "-feedback",
				Type:        "feedback",
				Title:       "Feedback AI",
				Description: "Evaluasi cerita telah selesai",
			}
			if createdAt.Valid {
				feedbackItem.Date = createdAt.Time
			}
			items = append(items, feedbackItem)
		}
	}

	return c.JSON(models.TimelineResponse{
		Items:      items,
		TotalCount: len(items),
	})
}

func nullString(s string) sql.NullString {
	if s == "" {
		return sql.NullString{}
	}
	return sql.NullString{String: s, Valid: true}
}

func getStatusDescription(status string) string {
	switch status {
	case "pending":
		return "Menunggu evaluasi AI"
	case "processing":
		return "Sedang dievaluasi"
	case "completed":
		return "Evaluasi selesai"
	case "failed":
		return "Evaluasi gagal, akan dicoba lagi"
	default:
		return ""
	}
}
