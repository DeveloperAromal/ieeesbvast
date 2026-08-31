package projects

import (
	"context"
	"database/sql"
)

type Repository interface {
	CreateRegistration(ctx context.Context, registration Registration) (Registration, error)
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
