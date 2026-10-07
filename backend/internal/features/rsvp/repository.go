package rsvp

import (
	"context"
	"database/sql"
	"errors"
	"strings"
)

var ErrRSVPClosed = errors.New("RSVP is closed for this event")
var ErrInvalidEventID = errors.New("event ID is required")

type Repository interface {
	CreateRSVP(ctx context.Context, rsvp RSVP) (RSVP, error)
	GetRSVPsByEventId(ctx context.Context, eventId string) ([]RSVP, error)
	GetRSVPByID(ctx context.Context, id string) (RSVP, error)
	DeleteRSVP(ctx context.Context, id string) error
}

type repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *repository {
	return &repository{
		db: db,
	}
}

func (repo *repository) CreateRSVP(ctx context.Context, rsvp RSVP) (RSVP, error) {
	if strings.TrimSpace(rsvp.EventID) == "" {
		return rsvp, ErrInvalidEventID
	}

	tx, err := repo.db.BeginTx(ctx, nil)
	if err != nil {
		return rsvp, err
	}
	defer tx.Rollback()

	var isRegClosed bool

	checkQuery := `
		SELECT is_reg_closed
		FROM events
		WHERE id = $1
		FOR UPDATE
	`

	err = tx.QueryRowContext(ctx, checkQuery, rsvp.EventID).Scan(&isRegClosed)
	if err != nil {
		if err == sql.ErrNoRows {
			return rsvp, errors.New("event not found")
		}
		return rsvp, err
	}

	if isRegClosed {
		return rsvp, ErrRSVPClosed
	}

	// Insert RSVP and get the ID.
	insertQuery := `
		INSERT INTO rsvps
			(
				event_id,
				name,
				phonenumber,
				semester,
				branch
			)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id, created_at
	`

	err = tx.QueryRowContext(
		ctx,
		insertQuery,
		rsvp.EventID,
		rsvp.Name,
		rsvp.Phonenumber,
		rsvp.Semester,
		rsvp.Branch,
	).Scan(&rsvp.ID, &rsvp.CreatedAt)
	if err != nil {
		return rsvp, err
	}

	if err := tx.Commit(); err != nil {
		return rsvp, err
	}

	return rsvp, nil
}

func (repo *repository) GetRSVPsByEventId(ctx context.Context, eventId string) ([]RSVP, error) {

	query := `
		SELECT
			r.id,
			r.event_id,
			e.event_name,
			r.name,
			r.phonenumber,
			r.semester,
			r.branch,
			r.created_at
		FROM rsvps r
		JOIN events e ON e.id = r.event_id
		WHERE r.event_id = $1
		ORDER BY r.created_at DESC
	`

	rows, err := repo.db.QueryContext(ctx, query, eventId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var rsvps []RSVP

	for rows.Next() {
		var rsvp RSVP

		err := rows.Scan(
			&rsvp.ID,
			&rsvp.EventID,
			&rsvp.EventName,
			&rsvp.Name,
			&rsvp.Phonenumber,
			&rsvp.Semester,
			&rsvp.Branch,
			&rsvp.CreatedAt,
		)

		if err != nil {
			return nil, err
		}

		rsvps = append(rsvps, rsvp)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return rsvps, nil
}

func (repo *repository) GetRSVPByID(ctx context.Context, id string) (RSVP, error) {
	query := `
		SELECT
			r.id,
			r.event_id,
			e.event_name,
			r.name,
			r.phonenumber,
			r.semester,
			r.branch,
			r.created_at
		FROM rsvps r
		JOIN events e ON e.id = r.event_id
		WHERE r.id = $1
	`

	var rsvp RSVP

	err := repo.db.QueryRowContext(ctx, query, id).Scan(
		&rsvp.ID,
		&rsvp.EventID,
		&rsvp.EventName,
		&rsvp.Name,
		&rsvp.Phonenumber,
		&rsvp.Semester,
		&rsvp.Branch,
		&rsvp.CreatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return rsvp, errors.New("RSVP not found")
		}
		return rsvp, err
	}

	return rsvp, nil
}

func (repo *repository) DeleteRSVP(ctx context.Context, id string) error {
	query := `DELETE FROM rsvps WHERE id = $1`

	result, err := repo.db.ExecContext(ctx, query, id)
	if err != nil {
		return err
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		return err
	}

	if rowsAffected == 0 {
		return errors.New("RSVP not found")
	}

	return nil
}
