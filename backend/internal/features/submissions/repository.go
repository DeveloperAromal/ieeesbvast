package submissions

import (
	"context"
	"database/sql"
	"errors"
)

var ErrAlreadySubmitted = errors.New("submission has already been submitted")

type Repository interface {
	Get(ctx context.Context, userID, eventID string) (Submission, error)
	CreateDraft(ctx context.Context, userID, eventID string) (Submission, error)
	AddFile(ctx context.Context, file SubmissionFile) error
	Submit(ctx context.Context, userID, eventID string) (Submission, error)
}

type repository struct{ db *sql.DB }

func NewRepository(db *sql.DB) Repository { return &repository{db: db} }

func (repo *repository) Get(ctx context.Context, userID, eventID string) (Submission, error) {
	var submission Submission
	err := repo.db.QueryRowContext(ctx, `
		SELECT id, user_id, event_id, status, submitted_at, created_at, updated_at
		FROM submissions WHERE user_id = $1 AND event_id = $2
	`, userID, eventID).Scan(
		&submission.ID, &submission.UserID, &submission.EventID, &submission.Status,
		&submission.SubmittedAt, &submission.CreatedAt, &submission.UpdatedAt,
	)
	if err != nil {
		return submission, err
	}

	rows, err := repo.db.QueryContext(ctx, `
		SELECT id, submission_id, file_name, file_key, mime_type, file_size, created_at
		FROM submission_files WHERE submission_id = $1 ORDER BY created_at ASC
	`, submission.ID)
	if err != nil {
		return Submission{}, err
	}
	defer rows.Close()

	submission.Files = make([]SubmissionFile, 0)
	for rows.Next() {
		var file SubmissionFile
		if err := rows.Scan(&file.ID, &file.SubmissionID, &file.FileName, &file.FileKey, &file.MimeType, &file.FileSize, &file.CreatedAt); err != nil {
			return Submission{}, err
		}
		submission.Files = append(submission.Files, file)
	}
	if err := rows.Err(); err != nil {
		return Submission{}, err
	}

	return submission, nil
}

func (repo *repository) CreateDraft(ctx context.Context, userID, eventID string) (Submission, error) {
	var submission Submission
	err := repo.db.QueryRowContext(ctx, `
		INSERT INTO submissions (user_id, event_id, status)
		SELECT $1, $2, 'draft'
		WHERE EXISTS (
			SELECT 1 FROM users u
			JOIN registrations r ON r.id = u.reg_id
			WHERE u.id = $1 AND r.event_id = $2
		)
		ON CONFLICT (user_id, event_id) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
		RETURNING id, user_id, event_id, status, submitted_at, created_at, updated_at
	`, userID, eventID).Scan(
		&submission.ID, &submission.UserID, &submission.EventID, &submission.Status,
		&submission.SubmittedAt, &submission.CreatedAt, &submission.UpdatedAt,
	)
	return submission, err
}

func (repo *repository) AddFile(ctx context.Context, file SubmissionFile) error {
	_, err := repo.db.ExecContext(ctx, `
		INSERT INTO submission_files (submission_id, file_name, file_key, mime_type, file_size)
		VALUES ($1, $2, $3, $4, $5)
	`, file.SubmissionID, file.FileName, file.FileKey, file.MimeType, file.FileSize)
	return err
}

func (repo *repository) Submit(ctx context.Context, userID, eventID string) (Submission, error) {
	var submission Submission
	err := repo.db.QueryRowContext(ctx, `
		UPDATE submissions
		SET status = 'submitted', submitted_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
		WHERE user_id = $1 AND event_id = $2 AND status <> 'submitted'
		AND EXISTS (SELECT 1 FROM submission_files WHERE submission_id = submissions.id)
		RETURNING id, user_id, event_id, status, submitted_at, created_at, updated_at
	`, userID, eventID).Scan(
		&submission.ID, &submission.UserID, &submission.EventID, &submission.Status,
		&submission.SubmittedAt, &submission.CreatedAt, &submission.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		var status string
		checkErr := repo.db.QueryRowContext(ctx, `SELECT status FROM submissions WHERE user_id = $1 AND event_id = $2`, userID, eventID).Scan(&status)
		if checkErr == nil && status == "submitted" {
			return Submission{}, ErrAlreadySubmitted
		}
	}
	return submission, err
}
