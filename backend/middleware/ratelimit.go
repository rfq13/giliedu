package middleware

import (
	"context"
	"fmt"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/redis/go-redis/v9"
)

func RateLimiter(rdb *redis.Client) fiber.Handler {
	return func(c *fiber.Ctx) error {
		if rdb == nil {
			return c.Next()
		}

		ctx := context.Background()
		ip := c.IP()
		key := fmt.Sprintf("ratelimit:%s", ip)

		// Get current count
		count, err := rdb.Get(ctx, key).Int()
		if err != nil && err != redis.Nil {
			// Redis error, allow request
			return c.Next()
		}

		// Check limit (100 requests per minute)
		if count >= 100 {
			return c.Status(fiber.StatusTooManyRequests).JSON(fiber.Map{
				"error": "Rate limit exceeded. Please try again later.",
			})
		}

		// Increment counter
		pipe := rdb.Pipeline()
		pipe.Incr(ctx, key)
		pipe.Expire(ctx, key, time.Minute)
		pipe.Exec(ctx)

		return c.Next()
	}
}
