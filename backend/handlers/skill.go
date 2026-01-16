package handlers

import (
	"database/sql"

	"github.com/gili/backend/config"
	"github.com/gili/backend/models"
	"github.com/gofiber/fiber/v2"
)

type SkillHandler struct {
	db  *sql.DB
	cfg *config.Config
}

func NewSkillHandler(db *sql.DB, cfg *config.Config) *SkillHandler {
	return &SkillHandler{db: db, cfg: cfg}
}

func (h *SkillHandler) GetProgress(c *fiber.Ctx) error {
	userID := c.Locals("userID").(string)

	// Get skill progress
	rows, err := h.db.Query(`
		SELECT sp.id, sp.user_id, sp.skill_id, s.name, s.description, s.icon, s.color,
		       sp.level, sp.progress, sp.total_stories, sp.updated_at
		FROM skill_progress sp
		JOIN skills s ON sp.skill_id = s.id
		WHERE sp.user_id = $1
		ORDER BY s.name
	`, userID)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch skill progress",
		})
	}
	defer rows.Close()

	skills := []models.SkillProgress{}
	totalStories := 0
	totalLevel := 0

	for rows.Next() {
		var sp models.SkillProgress
		err := rows.Scan(
			&sp.ID, &sp.UserID, &sp.SkillID, &sp.SkillName, &sp.Description,
			&sp.Icon, &sp.Color, &sp.Level, &sp.Progress, &sp.TotalStories, &sp.UpdatedAt,
		)
		if err != nil {
			continue
		}
		skills = append(skills, sp)
		totalStories += sp.TotalStories
		totalLevel += sp.Level
	}

	// Calculate overall level (average of all skill levels)
	overallLevel := 1
	if len(skills) > 0 {
		overallLevel = totalLevel / len(skills)
	}

	return c.JSON(models.ProgressResponse{
		OverallLevel: overallLevel,
		TotalStories: totalStories,
		Skills:       skills,
	})
}

func (h *SkillHandler) GetPortfolio(c *fiber.Ctx) error {
	userID := c.Locals("userID").(string)

	// Get completed stories as portfolio items
	rows, err := h.db.Query(`
		SELECT s.id, s.prompt_title, s.created_at, f.overall_score
		FROM stories s
		LEFT JOIN story_feedback f ON s.id = f.story_id
		WHERE s.user_id = $1 AND s.status = 'completed'
		ORDER BY s.created_at DESC
		LIMIT 50
	`, userID)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch portfolio",
		})
	}
	defer rows.Close()

	items := []models.PortfolioItem{}
	for rows.Next() {
		var id string
		var promptTitle sql.NullString
		var createdAt sql.NullTime
		var overallScore sql.NullInt64

		if err := rows.Scan(&id, &promptTitle, &createdAt, &overallScore); err != nil {
			continue
		}

		title := "Cerita"
		if promptTitle.Valid {
			title = "Cerita: " + promptTitle.String
		}

		item := models.PortfolioItem{
			ID:    id,
			Title: title,
			Type:  "story",
		}

		if createdAt.Valid {
			item.Date = createdAt.Time
		}

		if overallScore.Valid {
			score := int(overallScore.Int64)
			item.Score = &score
		}

		items = append(items, item)
	}

	// Add achievements based on story count
	var storyCount int
	h.db.QueryRow("SELECT COUNT(*) FROM stories WHERE user_id = $1 AND status = 'completed'", userID).Scan(&storyCount)

	if storyCount >= 1 {
		items = append(items, models.PortfolioItem{
			ID:    "achievement-1",
			Title: "Pencerita Pemula",
			Type:  "achievement",
		})
	}
	if storyCount >= 5 {
		items = append(items, models.PortfolioItem{
			ID:    "achievement-5",
			Title: "5 Cerita Selesai!",
			Type:  "achievement",
		})
	}
	if storyCount >= 10 {
		items = append(items, models.PortfolioItem{
			ID:    "achievement-10",
			Title: "Pencerita Handal",
			Type:  "achievement",
		})
	}

	return c.JSON(models.PortfolioResponse{
		Items:      items,
		TotalCount: len(items),
	})
}

func (h *SkillHandler) GetSkills(c *fiber.Ctx) error {
	rows, err := h.db.Query(`
		SELECT id, name, description, icon, color, created_at
		FROM skills
		ORDER BY name
	`)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to fetch skills",
		})
	}
	defer rows.Close()

	skills := []models.Skill{}
	for rows.Next() {
		var skill models.Skill
		if err := rows.Scan(&skill.ID, &skill.Name, &skill.Description, &skill.Icon, &skill.Color, &skill.CreatedAt); err != nil {
			continue
		}
		skills = append(skills, skill)
	}

	return c.JSON(skills)
}
