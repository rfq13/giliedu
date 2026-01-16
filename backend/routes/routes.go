package routes

import (
	"database/sql"

	"github.com/gili/backend/config"
	"github.com/gili/backend/database"
	"github.com/gili/backend/handlers"
	"github.com/gili/backend/middleware"
	"github.com/gofiber/fiber/v2"
	"github.com/redis/go-redis/v9"
)

func Setup(app *fiber.App, db *sql.DB, rdb *redis.Client, rmq *database.RabbitMQ, cfg *config.Config) {
	// Initialize handlers
	authHandler := handlers.NewAuthHandler(db, cfg)
	userHandler := handlers.NewUserHandler(db, cfg)
	storyHandler := handlers.NewStoryHandler(db, cfg, rmq)
	skillHandler := handlers.NewSkillHandler(db, cfg)

	// API v1 group
	api := app.Group("/api/v1")

	// Public routes (no auth required)
	auth := api.Group("/auth")
	auth.Post("/register", authHandler.Register)
	auth.Post("/login", authHandler.Login)
	auth.Post("/refresh", authHandler.RefreshToken)

	// Protected routes (auth required)
	protected := api.Group("", middleware.AuthMiddleware(cfg))

	// Auth
	protected.Post("/auth/logout", authHandler.Logout)

	// User
	protected.Get("/user/profile", userHandler.GetProfile)
	protected.Put("/user/profile", userHandler.UpdateProfile)

	// Stories
	protected.Post("/stories", storyHandler.CreateStory)
	protected.Get("/stories", storyHandler.GetStories)
	protected.Get("/stories/:id", storyHandler.GetStory)

	// Timeline
	protected.Get("/timeline", storyHandler.GetTimeline)

	// Skills & Progress
	protected.Get("/skills", skillHandler.GetSkills)
	protected.Get("/progress", skillHandler.GetProgress)
	protected.Get("/portfolio", skillHandler.GetPortfolio)
}
