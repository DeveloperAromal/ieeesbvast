package submissions

import "time"

type Submission struct {
	ID          string           `json:"id" db:"id"`
	UserID      string           `json:"user_id" db:"user_id"`
	EventID     string           `json:"event_id" db:"event_id"`
	Status      string           `json:"status" db:"status"`
	SubmittedAt *time.Time       `json:"submitted_at,omitempty" db:"submitted_at"`
	CreatedAt   time.Time        `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time        `json:"updated_at" db:"updated_at"`
	Files       []SubmissionFile `json:"files"`
}

type SubmissionFile struct {
	ID           string    `json:"id" db:"id"`
	SubmissionID string    `json:"submission_id" db:"submission_id"`
	FileName     string    `json:"file_name" db:"file_name"`
	FileKey      string    `json:"file_key" db:"file_key"`
	MimeType     string    `json:"mime_type" db:"mime_type"`
	FileSize     int64     `json:"file_size" db:"file_size"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	URL          string    `json:"url,omitempty"`
}
