package models

import (
	"time"
)

type User struct {
	ID           string    `json:"id"`
	Name         string    `json:"name"`
	Email        string    `json:"email"`
	PasswordHash string    `json:"-"`
	Age          *int      `json:"age,omitempty"`
	Level        string    `json:"level"`
	Avatar       string    `json:"avatar"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

type RegisterRequest struct {
	Name     string `json:"name" validate:"required,min=2,max=100"`
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required,min=6"`
	Age      *int   `json:"age,omitempty" validate:"omitempty,min=5,max=100"`
	Level    string `json:"level,omitempty" validate:"omitempty,oneof=sd smp sma kuliah"`
}

type LoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type AuthResponse struct {
	User         *User  `json:"user"`
	AccessToken  string `json:"access_token"`
	RefreshToken string `json:"refresh_token"`
	ExpiresIn    int64  `json:"expires_in"`
}

type RefreshRequest struct {
	RefreshToken string `json:"refresh_token" validate:"required"`
}

type UpdateProfileRequest struct {
	Name   string `json:"name,omitempty" validate:"omitempty,min=2,max=100"`
	Age    *int   `json:"age,omitempty" validate:"omitempty,min=5,max=100"`
	Level  string `json:"level,omitempty" validate:"omitempty,oneof=sd smp sma kuliah"`
	Avatar string `json:"avatar,omitempty"`
}
