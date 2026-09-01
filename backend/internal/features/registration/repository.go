package projects

import (
	"context"
	"database/sql"
)

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

	query := `
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

	err := repo.db.QueryRowContext(
		ctx,
		query,
		registration.EventID,
		registration.FName,
		registration.LName,
		registration.Phonenumber,
		registration.Email,
		registration.CollageName,
	).Scan(
		&registration.ID,
	)

	return registration, err
}

func (repo *repository) GetRegistrationsByEventId(ctx context.Context, eventId string) ([]Registration, error) {

	query := `
		SELECT
			id,
			event_id,
			fname,
			lname,
			phonenumber,
			email,
			collage_name
		FROM registrations
		WHERE event_id = $1
		ORDER BY created_at DESC
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
