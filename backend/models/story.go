package models

import (
	"time"
)

type Story struct {
	ID          string         `json:"id"`
	UserID      string         `json:"user_id"`
	PromptID    *string        `json:"prompt_id,omitempty"`
	PromptTitle *string        `json:"prompt_title,omitempty"`
	InputType   string         `json:"input_type"`
	Content     *string        `json:"content,omitempty"`
	AudioURL    *string        `json:"audio_url,omitempty"`
	Transcript  *string        `json:"transcript,omitempty"`
	Status      string         `json:"status"`
	Feedback    *StoryFeedback `json:"feedback,omitempty"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
}

type StoryFeedback struct {
	ID              string    `json:"id"`
	StoryID         string    `json:"story_id"`
	ClarityScore    int       `json:"clarity_score"`
	StructureScore  int       `json:"structure_score"`
	CreativityScore int       `json:"creativity_score"`
	ExpressionScore int       `json:"expression_score"`
	OverallScore    int       `json:"overall_score"`
	FeedbackText    string    `json:"feedback_text"`
	Strengths       []string  `json:"strengths"`
	Improvements    []string  `json:"improvements"`
	CreatedAt       time.Time `json:"created_at"`
}

type CreateStoryRequest struct {
	PromptID    string `json:"prompt_id,omitempty"`
	PromptTitle string `json:"prompt_title,omitempty"`
	InputType   string `json:"input_type" validate:"required,oneof=audio text"`
	Content     string `json:"content,omitempty" validate:"required_if=InputType text"`
}

type StoryListResponse struct {
	Stories    []Story `json:"stories"`
	TotalCount int     `json:"total_count"`
	Page       int     `json:"page"`
	PageSize   int     `json:"page_size"`
}

type TimelineItem struct {
	ID          string    `json:"id"`
	Type        string    `json:"type"`
	Title       string    `json:"title"`
	Description string    `json:"description"`
	Date        time.Time `json:"date"`
	Status      string    `json:"status,omitempty"`
	Score       *int      `json:"score,omitempty"`
}

type TimelineResponse struct {
	Items      []TimelineItem `json:"items"`
	TotalCount int            `json:"total_count"`
}
