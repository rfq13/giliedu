package main

import (
	"log"
	"os"

	"github.com/gili/backend/config"
	"github.com/gili/backend/database"
	"github.com/gili/backend/middleware"
	"github.com/gili/backend/routes"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/joho/godotenv"
)

func main() {
	// Load .env file
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using environment variables")
	}

	// Initialize config
	cfg := config.Load()

	// Initialize database
	db, err := database.Connect(cfg)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer db.Close()

	// Run migrations
	if err := database.Migrate(db); err != nil {
		log.Fatalf("Failed to run migrations: %v", err)
	}

	// Initialize Redis
	rdb := database.ConnectRedis(cfg)
	defer rdb.Close()

	// Initialize RabbitMQ
	rmq, err := database.ConnectRabbitMQ(cfg)
	if err != nil {
		log.Printf("Warning: RabbitMQ not available: %v", err)
	} else {
		defer rmq.Close()
	}

	// Create Fiber app
	app := fiber.New(fiber.Config{
		AppName:      "Gili API",
		ErrorHandler: middleware.ErrorHandler,
		BodyLimit:    10 * 1024 * 1024, // 10MB limit for audio uploads
	})

	// Global middleware
	app.Use(recover.New())
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowHeaders: "Origin, Content-Type, Accept, Authorization",
		AllowMethods: "GET, POST, PUT, DELETE, OPTIONS",
	}))

	// Rate limiting
	app.Use(middleware.RateLimiter(rdb))

	// Setup routes
	routes.Setup(app, db, rdb, rmq, cfg)

	// Health check
	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"service": "gili-api",
		})
	})

	// Start server
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("🚀 Gili API starting on port %s", port)
	if err := app.Listen(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
