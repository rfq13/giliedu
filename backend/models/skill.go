package models

import (
	"time"
)

type Skill struct {
	ID          string    `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description"`
	Icon        string    `json:"icon"`
	Color       string    `json:"color"`
	CreatedAt   time.Time `json:"created_at"`
}

type SkillProgress struct {
	ID           string    `json:"id"`
	UserID       string    `json:"user_id"`
	SkillID      string    `json:"skill_id"`
	SkillName    string    `json:"skill_name"`
	Description  string    `json:"description"`
	Icon         string    `json:"icon"`
	Color        string    `json:"color"`
	Level        int       `json:"level"`
	Progress     int       `json:"progress"`
	TotalStories int       `json:"total_stories"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type ProgressResponse struct {
	OverallLevel int             `json:"overall_level"`
	TotalStories int             `json:"total_stories"`
	Skills       []SkillProgress `json:"skills"`
}

type PortfolioItem struct {
	ID        string    `json:"id"`
	Title     string    `json:"title"`
	Type      string    `json:"type"`
	Date      time.Time `json:"date"`
	Score     *int      `json:"score,omitempty"`
}

type PortfolioResponse struct {
	Items      []PortfolioItem `json:"items"`
	TotalCount int             `json:"total_count"`
}
