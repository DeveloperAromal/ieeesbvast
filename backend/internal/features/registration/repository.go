package projects

import (
	"context"
	"database/sql"
	"errors"
)

var ErrRegistrationClosed = errors.New("registration is closed for this event")

type Repository interface {
	CreateRegistration(ctx context.Context, registration Registration) (Registration, error)
	GetRegistrationsByEventId(ctx context.Context, eventId string) ([]Registration, error)
}

type repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *repository {
	return &repository{
		db: db,
	}
}

func (repo *repository) CreateRegistration(ctx context.Context, registration Registration) (Registration, error) {

	tx, err := repo.db.BeginTx(ctx, nil)
	if err != nil {
		return registration, err
	}
	defer tx.Rollback()

	var isRegClosed bool

	checkQuery := `
		SELECT is_reg_closed
		FROM events
		WHERE id = $1
		FOR UPDATE
	`

	err = tx.QueryRowContext(ctx, checkQuery, registration.EventID).Scan(&isRegClosed)
	if err != nil {
		if err == sql.ErrNoRows {
			return registration, errors.New("event not found")
		}
		return registration, err
	}

	if isRegClosed {
		return registration, ErrRegistrationClosed
	}

	insertQuery := `
		INSERT INTO registrations
			(
				event_id,
				fname,
				lname,
				phonenumber,
				email,
				collage_name
			)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id
	`

	err = tx.QueryRowContext(
		ctx,
		insertQuery,
		registration.EventID,
		registration.FName,
		registration.LName,
		registration.Phonenumber,
		registration.Email,
		registration.CollageName,
	).Scan(&registration.ID)
	if err != nil {
		return registration, err
	}

	if err := tx.Commit(); err != nil {
		return registration, err
	}

	return registration, nil
}

func (repo *repository) GetRegistrationsByEventId(ctx context.Context, eventId string) ([]Registration, error) {

	query := `
		SELECT
			r.id,
			r.event_id,
			e.event_name,
			r.fname,
			r.lname,
			r.phonenumber,
			r.email,
			r.collage_name
		FROM registrations r
		JOIN events e ON e.id = r.event_id
		WHERE r.event_id = $1
		ORDER BY r.created_at DESC
	`

	rows, err := repo.db.QueryContext(ctx, query, eventId)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var registrations []Registration

	for rows.Next() {
		var registration Registration

		err := rows.Scan(
			&registration.ID,
			&registration.EventID,
			&registration.EventName,
			&registration.FName,
			&registration.LName,
			&registration.Phonenumber,
			&registration.Email,
			&registration.CollageName,
		)

		if err != nil {
			return nil, err
		}

		registrations = append(registrations, registration)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return registrations, nil
}
