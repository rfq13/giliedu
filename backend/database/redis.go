package database

import (
	"context"
	"fmt"
	"log"

	"github.com/gili/backend/config"
	"github.com/redis/go-redis/v9"
)

func ConnectRedis(cfg *config.Config) *redis.Client {
	rdb := redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%s", cfg.RedisHost, cfg.RedisPort),
		Password: cfg.RedisPassword,
		DB:       0,
	})

	ctx := context.Background()
	if err := rdb.Ping(ctx).Err(); err != nil {
		log.Printf("Warning: Redis not available: %v", err)
	} else {
		log.Println("✅ Connected to Redis")
	}

	return rdb
}
