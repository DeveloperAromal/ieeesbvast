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
	GetEventByID(ctx context.Context, id string) (Event, error)
	GetEventNameByID(ctx context.Context, id string) (EventReg, error)

	CreateEventTask(ctx context.Context, task EventTask) (EventTask, error)
	GetEventTask(ctx context.Context, eventID string) (EventTask, error)
	UpdateEventTask(ctx context.Context, task EventTask) (EventTask, error)
	DeleteEventTask(ctx context.Context, eventID string) error
}

type repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *repository {
	return &repository{
		db: db,
	}
}

// ============================================================
// CREATE EVENT
// ============================================================

func (repo *repository) CreateEvent(
	ctx context.Context,
	event Event,
) (Event, error) {

	query := `
		INSERT INTO events (
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
	).Scan(
		&event.ID,
	)

	return event, err
}

// ============================================================
// CREATE SCHEDULE
// ============================================================

func (repo *repository) CreateSchedule(
	ctx context.Context,
	schedule Schedule,
) (Schedule, error) {

	query := `
		INSERT INTO schedules (
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
	).Scan(
		&schedule.ID,
	)

	return schedule, err
}

// ============================================================
// CREATE SPEAKER
// ============================================================

func (repo *repository) CreateSpeaker(
	ctx context.Context,
	speaker Speaker,
) (Speaker, error) {

	query := `
		INSERT INTO speakers (
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
	).Scan(
		&speaker.ID,
	)

	return speaker, err
}

// ============================================================
// GET ALL EVENTS
// ============================================================

func (repo *repository) GetAllEvents(
	ctx context.Context,
) ([]Event, error) {

	query := `
		SELECT
			e.id,
			e.event_name,
			e.event_slug,
			e.description,
			e.banner_image,
			e.poster_image,
			e.is_reg_closed,
			e.is_event_started,

			COALESCE(
				(
					SELECT json_agg(
						json_build_object(
							'id', s.id,
							'event_id', s.event_id,
							'title', s.title,
							'date_time', s.date_time
						)
					)
					FROM schedules s
					WHERE s.event_id = e.id
				),
				'[]'::json
			) AS schedules,

			COALESCE(
				(
					SELECT json_agg(
						json_build_object(
							'id', sp.id,
							'event_id', sp.event_id,
							'name', sp.name,
							'designation', sp.designation,
							'company', sp.company,
							'image', sp.image
						)
					)
					FROM speakers sp
					WHERE sp.event_id = e.id
				),
				'[]'::json
			) AS speakers

		FROM events e
		ORDER BY e.created_at DESC
	`

	rows, err := repo.db.QueryContext(ctx, query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	events := make([]Event, 0)

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
			&event.IsRegClosed,
			&event.IsEventStarted,
			&schedulesJSON,
			&speakersJSON,
		)

		if err != nil {
			return nil, err
		}

		if err := json.Unmarshal(
			schedulesJSON,
			&event.Schedules,
		); err != nil {
			return nil, err
		}

		if err := json.Unmarshal(
			speakersJSON,
			&event.Speakers,
		); err != nil {
			return nil, err
		}

		events = append(events, event)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return events, nil
}

// ============================================================
// GET EVENT BY SLUG
// ============================================================

func (repo *repository) GetEventBySlug(
	ctx context.Context,
	slug string,
) (Event, error) {

	var event Event
	var schedulesJSON []byte
	var speakersJSON []byte

	query := `
		SELECT
			e.id,
			e.event_name,
			e.event_slug,
			e.description,
			e.banner_image,
			e.poster_image,
			e.is_reg_closed,
			e.is_event_started,

			COALESCE(
				(
					SELECT json_agg(
						json_build_object(
							'id', s.id,
							'event_id', s.event_id,
							'title', s.title,
							'date_time', s.date_time
						)
					)
					FROM schedules s
					WHERE s.event_id = e.id
				),
				'[]'::json
			) AS schedules,

			COALESCE(
				(
					SELECT json_agg(
						json_build_object(
							'id', sp.id,
							'event_id', sp.event_id,
							'name', sp.name,
							'designation', sp.designation,
							'company', sp.company,
							'image', sp.image
						)
					)
					FROM speakers sp
					WHERE sp.event_id = e.id
				),
				'[]'::json
			) AS speakers

		FROM events e
		WHERE e.event_slug = $1
	`

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
		&event.IsRegClosed,
		&event.IsEventStarted,
		&schedulesJSON,
		&speakersJSON,
	)

	if err != nil {
		return Event{}, err
	}

	if err := json.Unmarshal(
		schedulesJSON,
		&event.Schedules,
	); err != nil {
		return Event{}, err
	}

	if err := json.Unmarshal(
		speakersJSON,
		&event.Speakers,
	); err != nil {
		return Event{}, err
	}

	return event, nil
}

// ============================================================
// GET EVENT BY ID
// ============================================================

func (repo *repository) GetEventByID(
	ctx context.Context,
	id string,
) (Event, error) {

	var event Event
	var schedulesJSON []byte
	var speakersJSON []byte

	query := `
		SELECT
			e.id,
			e.event_name,
			e.event_slug,
			e.description,
			e.banner_image,
			e.poster_image,
			e.is_reg_closed,
			e.is_event_started,

			COALESCE(
				(
					SELECT json_agg(
						json_build_object(
							'id', s.id,
							'event_id', s.event_id,
							'title', s.title,
							'date_time', s.date_time
						)
					)
					FROM schedules s
					WHERE s.event_id = e.id
				),
				'[]'::json
			) AS schedules,

			COALESCE(
				(
					SELECT json_agg(
						json_build_object(
							'id', sp.id,
							'event_id', sp.event_id,
							'name', sp.name,
							'designation', sp.designation,
							'company', sp.company,
							'image', sp.image
						)
					)
					FROM speakers sp
					WHERE sp.event_id = e.id
				),
				'[]'::json
			) AS speakers

		FROM events e
		WHERE e.id = $1
	`

	err := repo.db.QueryRowContext(
		ctx,
		query,
		id,
	).Scan(
		&event.ID,
		&event.EventName,
		&event.EventSlug,
		&event.Description,
		&event.BannerImage,
		&event.PosterImage,
		&event.IsRegClosed,
		&event.IsEventStarted,
		&schedulesJSON,
		&speakersJSON,
	)

	if err != nil {
		return Event{}, err
	}

	if err := json.Unmarshal(
		schedulesJSON,
		&event.Schedules,
	); err != nil {
		return Event{}, err
	}

	if err := json.Unmarshal(
		speakersJSON,
		&event.Speakers,
	); err != nil {
		return Event{}, err
	}

	return event, nil
}

// ============================================================
// GET EVENT NAME BY ID
// ============================================================

func (repo *repository) GetEventNameByID(
	ctx context.Context,
	id string,
) (EventReg, error) {

	query := `
		SELECT
			event_name,
			is_reg_closed,
			is_event_started
		FROM events
		WHERE id = $1
	`

	var event EventReg

	err := repo.db.QueryRowContext(
		ctx,
		query,
		id,
	).Scan(
		&event.EventName,
		&event.IsRegClosed,
		&event.IsEventStarted,
	)

	if err != nil {
		return EventReg{}, err
	}

	return event, nil
}

// ============================================================
// CREATE EVENT TASK
// ============================================================

func (repo *repository) CreateEventTask(
	ctx context.Context,
	task EventTask,
) (EventTask, error) {

	query := `
		INSERT INTO event_tasks (
			event_id,
			instructions,
			drive_link
		)
		VALUES ($1, $2, $3)
		RETURNING
			id,
			created_at,
			updated_at
	`

	err := repo.db.QueryRowContext(
		ctx,
		query,
		task.EventID,
		task.Instructions,
		task.DriveLink,
	).Scan(
		&task.ID,
		&task.CreatedAt,
		&task.UpdatedAt,
	)

	return task, err
}

// ============================================================
// GET EVENT TASK
// ============================================================
func (repo *repository) GetEventTask(
	ctx context.Context,
	eventID string,
) (EventTask, error) {

	var task EventTask

	query := `
		SELECT
			et.id,
			et.event_id,
			et.instructions,
			et.drive_link,
			et.created_at,
			et.updated_at
		FROM event_tasks AS et
		WHERE et.event_id = $1
	`

	var id string
	err := repo.db.QueryRowContext(
		ctx,
		`SELECT id FROM event_tasks WHERE event_id = $1`,
		eventID,
	).Scan(&id)

	if err != nil {
		return task, err
	}

	// If the above works, continue with the real query.
	err = repo.db.QueryRowContext(
		ctx,
		query,
		eventID,
	).Scan(
		&task.ID,
		&task.EventID,
		&task.Instructions,
		&task.DriveLink,
		&task.CreatedAt,
		&task.UpdatedAt,
	)

	return task, err
}

// ============================================================
// UPDATE EVENT TASK
// ============================================================

func (repo *repository) UpdateEventTask(
	ctx context.Context,
	task EventTask,
) (EventTask, error) {

	query := `
		UPDATE event_tasks
		SET
			instructions = $2,
			drive_link = $3,
			updated_at = CURRENT_TIMESTAMP
		WHERE event_id = $1
		RETURNING
			id,
			event_id,
			instructions,
			drive_link,
			created_at,
			updated_at
	`

	err := repo.db.QueryRowContext(
		ctx,
		query,
		task.EventID,
		task.Instructions,
		task.DriveLink,
	).Scan(
		&task.ID,
		&task.EventID,
		&task.Instructions,
		&task.DriveLink,
		&task.CreatedAt,
		&task.UpdatedAt,
	)

	if err != nil {
		return EventTask{}, err
	}

	return task, nil
}

// ============================================================
// DELETE EVENT TASK
// ============================================================

func (repo *repository) DeleteEventTask(
	ctx context.Context,
	eventID string,
) error {

	query := `
		DELETE FROM event_tasks
		WHERE event_id = $1
	`

	_, err := repo.db.ExecContext(
		ctx,
		query,
		eventID,
	)

	return err
}
