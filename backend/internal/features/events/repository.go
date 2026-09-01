package events

import (
	"context"
	"database/sql"
	"encoding/json"
)

type Repository interface {
	CreateEvent(ctx context.Context, event Event) (Event, error)
	CreateSchedule(ctx context.Context, schedule Schedule) (Schedule, error)
	CreateSpeaker(ctx context.Context, speaker Speaker) (Speaker, error)
	GetAllEvents(ctx context.Context) ([]Event, error)
	GetEventBySlug(ctx context.Context, slug string) (Event, error)
	GetEventNameByID(ctx context.Context, id string) (string, error)
}

type repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *repository {
	return &repository{
		db: db,
	}
}

func (repo *repository) CreateEvent(ctx context.Context, event Event) (Event, error) {

	query := `
		INSERT INTO events 
			(
				event_name,
				event_slug,
				description,
				banner_image,
				poster_image
			)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`

	err := repo.db.QueryRowContext(
		ctx,
		query,
		event.EventName,
		event.EventSlug,
		event.Description,
		event.BannerImage,
		event.PosterImage,
	).Scan(&event.ID)

	return event, err
}

func (repo *repository) CreateSchedule(ctx context.Context, schedule Schedule) (Schedule, error) {

	query := `
		INSERT INTO schedules 
			(
				event_id,
				title,
				date_time
			)
		VALUES ($1, $2, $3)
		RETURNING id
	`

	err := repo.db.QueryRowContext(
		ctx,
		query,
		schedule.EventID,
		schedule.Title,
		schedule.DateTime,
	).Scan(&schedule.ID)

	return schedule, err
}

func (repo *repository) CreateSpeaker(ctx context.Context, speaker Speaker) (Speaker, error) {

	query := `
		INSERT INTO speakers 
			(
				event_id,
				name,
				designation,
				company,
				image
			)
		VALUES ($1, $2, $3, $4, $5)
		RETURNING id
	`

	err := repo.db.QueryRowContext(
		ctx,
		query,
		speaker.EventID,
		speaker.Name,
		speaker.Designation,
		speaker.Company,
		speaker.Image,
	).Scan(&speaker.ID)

	return speaker, err
}

func (repo *repository) GetAllEvents(ctx context.Context) ([]Event, error) {

	query := `
		SELECT
			e.id,
			e.event_name,
			e.event_slug,
			e.description,
			e.banner_image,
			e.poster_image,

			COALESCE(
				json_agg(
					DISTINCT jsonb_build_object(
						'id', s.id,
						'event_id', s.event_id,
						'title', s.title,
						'date_time', s.date_time
					)
				) FILTER (WHERE s.id IS NOT NULL),
				'[]'
			) AS schedules,

			COALESCE(
				json_agg(
					DISTINCT jsonb_build_object(
						'id', sp.id,
						'event_id', sp.event_id,
						'name', sp.name,
						'designation', sp.designation,
						'company', sp.company,
						'image', sp.image
					)
				) FILTER (WHERE sp.id IS NOT NULL),
				'[]'
			) AS speakers

		FROM events e
		LEFT JOIN schedules s ON s.event_id = e.id
		LEFT JOIN speakers sp ON sp.event_id = e.id

		GROUP BY
			e.id,
			e.event_name,
			e.event_slug,
			e.description,
			e.banner_image,
			e.poster_image
	`

	rows, err := repo.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var events []Event

	for rows.Next() {
		var event Event
		var schedulesJSON []byte
		var speakersJSON []byte

		err := rows.Scan(
			&event.ID,
			&event.EventName,
			&event.EventSlug,
			&event.Description,
			&event.BannerImage,
			&event.PosterImage,
			&schedulesJSON,
			&speakersJSON,
		)
		if err != nil {
			return nil, err
		}

		err = json.Unmarshal(schedulesJSON, &event.Schedules)
		if err != nil {
			return nil, err
		}

		err = json.Unmarshal(speakersJSON, &event.Speakers)
		if err != nil {
			return nil, err
		}

		events = append(events, event)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return events, nil
}

func (repo *repository) GetEventBySlug(ctx context.Context, slug string) (Event, error) {

	query := `
		SELECT
			e.id,
			e.event_name,
			e.event_slug,
			e.description,
			e.banner_image,
			e.poster_image,

			COALESCE(
				json_agg(
					DISTINCT jsonb_build_object(
						'id', s.id,
						'event_id', s.event_id,
						'title', s.title,
						'date_time', s.date_time
					)
				) FILTER (WHERE s.id IS NOT NULL),
				'[]'
			) AS schedules,

			COALESCE(
				json_agg(
					DISTINCT jsonb_build_object(
						'id', sp.id,
						'event_id', sp.event_id,
						'name', sp.name,
						'designation', sp.designation,
						'company', sp.company,
						'image', sp.image
					)
				) FILTER (WHERE sp.id IS NOT NULL),
				'[]'
			) AS speakers

		FROM events e
		LEFT JOIN schedules s ON s.event_id = e.id
		LEFT JOIN speakers sp ON sp.event_id = e.id

		WHERE e.event_slug = $1

		GROUP BY
			e.id,
			e.event_name,
			e.event_slug,
			e.description,
			e.banner_image,
			e.poster_image
	`

	var event Event
	var schedulesJSON []byte
	var speakersJSON []byte

	err := repo.db.QueryRowContext(
		ctx,
		query,
		slug,
	).Scan(
		&event.ID,
		&event.EventName,
		&event.EventSlug,
		&event.Description,
		&event.BannerImage,
		&event.PosterImage,
		&schedulesJSON,
		&speakersJSON,
	)

	if err != nil {
		return event, err
	}

	if err := json.Unmarshal(schedulesJSON, &event.Schedules); err != nil {
		return event, err
	}

	if err := json.Unmarshal(speakersJSON, &event.Speakers); err != nil {
		return event, err
	}

	return event, nil
}
func (repo *repository) GetEventNameByID(ctx context.Context, id string) (string, error) {

	query := `
		SELECT event_name
		FROM events
		WHERE id = $1
	`

	var eventName string

	err := repo.db.QueryRowContext(
		ctx,
		query,
		id,
	).Scan(&eventName)

	if err != nil {
		return "", err
	}

	return eventName, nil
}
