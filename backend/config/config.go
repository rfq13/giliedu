package config

import (
	"os"
	"strconv"
	"time"
)

type Config struct {
	// Server
	Port string

	// Database
	DBHost     string
	DBPort     string
	DBUser     string
	DBPassword string
	DBName     string
	DBSSLMode  string

	// Redis
	RedisHost     string
	RedisPort     string
	RedisPassword string

	// RabbitMQ
	RabbitMQURL string

	// JWT
	JWTSecret          string
	JWTExpiry          time.Duration
	JWTRefreshExpiry   time.Duration

	// Rate Limiting
	RateLimitRequests int
	RateLimitWindow   time.Duration
}

func Load() *Config {
	return &Config{
		// Server
		Port: getEnv("PORT", "8080"),

		// Database
		DBHost:     getEnv("DB_HOST", "localhost"),
		DBPort:     getEnv("DB_PORT", "5432"),
		DBUser:     getEnv("DB_USER", "gili"),
		DBPassword: getEnv("DB_PASSWORD", "gili_secret"),
		DBName:     getEnv("DB_NAME", "gili_db"),
		DBSSLMode:  getEnv("DB_SSLMODE", "disable"),

		// Redis
		RedisHost:     getEnv("REDIS_HOST", "localhost"),
		RedisPort:     getEnv("REDIS_PORT", "6379"),
		RedisPassword: getEnv("REDIS_PASSWORD", ""),

		// RabbitMQ
		RabbitMQURL: getEnv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672/"),

		// JWT
		JWTSecret:        getEnv("JWT_SECRET", "gili-super-secret-key-change-in-production"),
		JWTExpiry:        getDurationEnv("JWT_EXPIRY", 15*time.Minute),
		JWTRefreshExpiry: getDurationEnv("JWT_REFRESH_EXPIRY", 7*24*time.Hour),

		// Rate Limiting
		RateLimitRequests: getIntEnv("RATE_LIMIT_REQUESTS", 100),
		RateLimitWindow:   getDurationEnv("RATE_LIMIT_WINDOW", 1*time.Minute),
	}
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}

func getIntEnv(key string, defaultValue int) int {
	if value := os.Getenv(key); value != "" {
		if intValue, err := strconv.Atoi(value); err == nil {
			return intValue
		}
	}
	return defaultValue
}

func getDurationEnv(key string, defaultValue time.Duration) time.Duration {
	if value := os.Getenv(key); value != "" {
		if duration, err := time.ParseDuration(value); err == nil {
			return duration
		}
	}
	return defaultValue
}
