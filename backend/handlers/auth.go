package handlers

import (
	"database/sql"
	"time"

	"github.com/gili/backend/config"
	"github.com/gili/backend/middleware"
	"github.com/gili/backend/models"
	"github.com/gofiber/fiber/v2"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type AuthHandler struct {
	db  *sql.DB
	cfg *config.Config
}

func NewAuthHandler(db *sql.DB, cfg *config.Config) *AuthHandler {
	return &AuthHandler{db: db, cfg: cfg}
}

func (h *AuthHandler) Register(c *fiber.Ctx) error {
	var req models.RegisterRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	// Validate required fields
	if req.Name == "" || req.Email == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Name, email, and password are required",
		})
	}

	if len(req.Password) < 6 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Password must be at least 6 characters",
		})
	}

	// Check if email exists
	var exists bool
	err := h.db.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)", req.Email).Scan(&exists)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Database error",
		})
	}
	if exists {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{
			"error": "Email already registered",
		})
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to hash password",
		})
	}

	// Set default level
	level := req.Level
	if level == "" {
		level = "sd"
	}

	// Create user
	userID := uuid.New().String()
	_, err = h.db.Exec(`
		INSERT INTO users (id, name, email, password_hash, age, level)
		VALUES ($1, $2, $3, $4, $5, $6)
	`, userID, req.Name, req.Email, string(hashedPassword), req.Age, level)

	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to create user",
		})
	}

	// Initialize skill progress for new user
	h.initializeSkillProgress(userID)

	// Generate tokens
	accessToken, refreshToken, err := middleware.GenerateTokens(userID, req.Email, h.cfg)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate tokens",
		})
	}

	// Store refresh token
	h.storeRefreshToken(userID, refreshToken)

	user := &models.User{
		ID:        userID,
		Name:      req.Name,
		Email:     req.Email,
		Age:       req.Age,
		Level:     level,
		Avatar:    "😊",
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	return c.Status(fiber.StatusCreated).JSON(models.AuthResponse{
		User:         user,
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    int64(h.cfg.JWTExpiry.Seconds()),
	})
}

func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var req models.LoginRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	if req.Email == "" || req.Password == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Email and password are required",
		})
	}

	// Get user
	var user models.User
	err := h.db.QueryRow(`
		SELECT id, name, email, password_hash, age, level, avatar, created_at, updated_at
		FROM users WHERE email = $1
	`, req.Email).Scan(
		&user.ID, &user.Name, &user.Email, &user.PasswordHash,
		&user.Age, &user.Level, &user.Avatar, &user.CreatedAt, &user.UpdatedAt,
	)

	if err == sql.ErrNoRows {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid email or password",
		})
	}
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Database error",
		})
	}

	// Check password
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password)); err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid email or password",
		})
	}

	// Generate tokens
	accessToken, refreshToken, err := middleware.GenerateTokens(user.ID, user.Email, h.cfg)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate tokens",
		})
	}

	// Store refresh token
	h.storeRefreshToken(user.ID, refreshToken)

	return c.JSON(models.AuthResponse{
		User:         &user,
		AccessToken:  accessToken,
		RefreshToken: refreshToken,
		ExpiresIn:    int64(h.cfg.JWTExpiry.Seconds()),
	})
}

func (h *AuthHandler) RefreshToken(c *fiber.Ctx) error {
	var req models.RefreshRequest
	if err := c.BodyParser(&req); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{
			"error": "Invalid request body",
		})
	}

	claims, err := middleware.ValidateRefreshToken(req.RefreshToken, h.cfg, h.db)
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{
			"error": "Invalid refresh token",
		})
	}

	// Generate new tokens
	accessToken, refreshToken, err := middleware.GenerateTokens(claims.UserID, claims.Email, h.cfg)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{
			"error": "Failed to generate tokens",
		})
	}

	// Store new refresh token
	h.storeRefreshToken(claims.UserID, refreshToken)

	return c.JSON(fiber.Map{
		"access_token":  accessToken,
		"refresh_token": refreshToken,
		"expires_in":    int64(h.cfg.JWTExpiry.Seconds()),
	})
}

func (h *AuthHandler) Logout(c *fiber.Ctx) error {
	userID := c.Locals("userID").(string)

	// Delete all refresh tokens for user
	h.db.Exec("DELETE FROM refresh_tokens WHERE user_id = $1", userID)

	return c.JSON(fiber.Map{
		"message": "Logged out successfully",
	})
}

func (h *AuthHandler) storeRefreshToken(userID, token string) {
	expiresAt := time.Now().Add(h.cfg.JWTRefreshExpiry)
	h.db.Exec(`
		INSERT INTO refresh_tokens (user_id, token, expires_at)
		VALUES ($1, $2, $3)
	`, userID, token, expiresAt)
}

func (h *AuthHandler) initializeSkillProgress(userID string) {
	// Get all skills and create progress entries
	rows, err := h.db.Query("SELECT id FROM skills")
	if err != nil {
		return
	}
	defer rows.Close()

	for rows.Next() {
		var skillID string
		if err := rows.Scan(&skillID); err != nil {
			continue
		}
		h.db.Exec(`
			INSERT INTO skill_progress (user_id, skill_id, level, progress, total_stories)
			VALUES ($1, $2, 1, 0, 0)
			ON CONFLICT (user_id, skill_id) DO NOTHING
		`, userID, skillID)
	}
}
