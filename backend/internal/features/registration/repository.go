package projects

import (
	"context"
	"database/sql"
	"errors"
	"strings"
)

var ErrRegistrationClosed = errors.New("registration is closed for this event")
var ErrInvalidTeamSize = errors.New("team size must be between 1 and 4")
var ErrInvalidTeamMembers = errors.New("add details for every team member")
var ErrTeamNameRequired = errors.New("team name is required")
var ErrInvalidEventID = errors.New("event ID is required")

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
	if strings.TrimSpace(registration.EventID) == "" {
		return registration, ErrInvalidEventID
	}
	if registration.TeamSize == 0 {
		registration.TeamSize = 1
	}
	if registration.TeamSize < 1 || registration.TeamSize > 4 {
		return registration, ErrInvalidTeamSize
	}
	if strings.TrimSpace(registration.TeamName) == "" {
		return registration, ErrTeamNameRequired
	}
	if len(registration.TeamMembers) != registration.TeamSize-1 {
		return registration, ErrInvalidTeamMembers
	}
	for _, member := range registration.TeamMembers {
		if member.Name == "" || member.Email == "" {
			return registration, ErrInvalidTeamMembers
		}
	}

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

	// Insert registration first and get the ID
	insertQuery := `
		INSERT INTO registrations
			(
				event_id,
				fname,
				lname,
				phonenumber,
				email,
				collage_name,
				semester,
				branch,
				team_name,
				team_size
			)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
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
		registration.Semester,
		registration.Branch,
		registration.TeamName,
		registration.TeamSize,
	).Scan(&registration.ID)
	if err != nil {
		return registration, err
	}

	// Now insert team members with the correct registration ID
	for i := range registration.TeamMembers {
		member := &registration.TeamMembers[i]
		err = tx.QueryRowContext(ctx, `
			INSERT INTO registration_team_members (registration_id, name, email)
			VALUES ($1, $2, $3)
			RETURNING id`, registration.ID, member.Name, member.Email).Scan(&member.ID)
		if err != nil {
			return registration, err
		}
		member.RegistrationID = registration.ID
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
			r.collage_name,
			r.semester,
			r.branch,
			r.team_name,
			r.team_size
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
			&registration.Semester,
			&registration.Branch,
			&registration.TeamName,
			&registration.TeamSize,
		)

		if err != nil {
			return nil, err
		}

		memberRows, err := repo.db.QueryContext(ctx, `SELECT id, registration_id, name, email FROM registration_team_members WHERE registration_id = $1 ORDER BY created_at`, registration.ID)
		if err != nil {
			return nil, err
		}
		for memberRows.Next() {
			var member TeamMember
			if err := memberRows.Scan(&member.ID, &member.RegistrationID, &member.Name, &member.Email); err != nil {
				memberRows.Close()
				return nil, err
			}
			registration.TeamMembers = append(registration.TeamMembers, member)
		}
		if err := memberRows.Err(); err != nil {
			memberRows.Close()
			return nil, err
		}
		memberRows.Close()

		registrations = append(registrations, registration)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return registrations, nil
}
