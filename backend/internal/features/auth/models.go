package auth

import "time"

type UserModel struct {
	ID          string `json:"id" db:"id"`
	Name        string `json:"name" db:"name"`
	Email       string `json:"email" db:"email"`
	Password    string `json:"password" db:"password"`
	RegistionID string `json:"reg_id" db:"reg_id"`
}

type LoginUserModel struct {
	Email    string `json:"email" db:"email"`
	Password string `json:"password" db:"password"`
}

type User struct {
	ID          string `json:"id" db:"id"`
	Name        string `json:"name" db:"name"`
	Email       string `json:"email" db:"email"`
	RegistionID string `json:"reg_id" db:"reg_id"`
	Password    string `json:"password" db:"password"`
	EventID     string `json:"event_id" db:"event_id"`
	EventName   string `json:"event_name"`
	EventSlug   string `json:"event_slug"`
}

type SessionModel struct {
	ID        string    `json:"id" db:"id"`
	UserID    string    `json:"user_id" db:"user_id"`
	TokenHash string    `json:"token_hash" db:"token_hash"`
	ExpiredAt time.Time `json:"expires_at" db:"expires_at"`
}

type SessionExpireModel struct {
	ExpiresAt time.Time `json:"expires_at" db:"expires_at"`
}

type SessionResponse struct {
	Authenticated bool               `json:"authenticated"`
	User          User               `json:"user"`
	Session       SessionExpireModel `json:"session"`
}

type BlackoutLoginRequest struct {
	Email    string `json:"email" binding:"required"`
	Password string `json:"password" binding:"required"`
}

type BlackoutLoginResponse struct {
	UserID       string `json:"user_id"`
	Name         string `json:"name"`
	Email        string `json:"email"`
	SessionToken string `json:"session_token"`
	Message      string `json:"message"`
}
