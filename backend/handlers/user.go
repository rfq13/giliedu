package handlers

import (
	"database/sql"
	"fmt"

	"github.com/gili/backend/config"
	"github.com/gili/backend/models"
	"github.com/gofiber/fiber/v2"
)

type UserHandler struct {
	db  *sql.DB
	cfg *config.Config
}

func NewUserHandler(db *sql.DB, cfg *config.Config) *UserHandler {
	return &UserHandler{db: db, cfg: cfg}
}

func (h *UserHandler) GetProfile(c *fiber.Ctx) error {
	userID := c.Locals("userID").(string)

	var user models.User
	err := h.db.QueryRow(`
		SELECT id, name, email, age, level, avatar, created_at, updated_at
		FROM users WHERE id = $1
	`, userID).Scan(
		&user.ID, &user.Name, &user.Email, &user.Age,
		&user.Level, &user.Avatar, &user.CreatedAt, &user.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{
			"error": "User not found",
		})
	}
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Database error",
		})
	}

	return c.JSON(user)
}

func (h *UserHandler) UpdateProfile(c *fiber.Ctx) error {
	userID := c.Locals("userID").(string)

	var req models.UpdateProfileRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Build update query dynamically
	query := "UPDATE users SET updated_at = CURRENT_TIMESTAMP"
	args := []interface{}{}
	argCount := 0

	if req.Name != "" {
		argCount++
		query += fmt.Sprintf(", name = $%d", argCount)
		args = append(args, req.Name)
	}
	if req.Age != nil {
		argCount++
		query += fmt.Sprintf(", age = $%d", argCount)
		args = append(args, *req.Age)
	}
	if req.Level != "" {
		argCount++
		query += fmt.Sprintf(", level = $%d", argCount)
		args = append(args, req.Level)
	}
	if req.Avatar != "" {
		argCount++
		query += fmt.Sprintf(", avatar = $%d", argCount)
		args = append(args, req.Avatar)
	}

	argCount++
	query += fmt.Sprintf(" WHERE id = $%d", argCount)
	args = append(args, userID)

	_, err := h.db.Exec(query, args...)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to update profile",
		})
	}

	// Return updated user
	return h.GetProfile(c)
}
