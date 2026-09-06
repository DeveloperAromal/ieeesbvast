package events

type Event struct {
	ID             string `json:"id" db:"id"`
	EventName      string `json:"event_name" db:"event_name"`
	EventSlug      string `json:"event_slug" db:"event_slug"`
	Description    string `json:"description" db:"description"`
	BannerImage    string `json:"banner_image" db:"banner_image"`
	PosterImage    string `json:"poster_image" db:"poster_image"`
	IsRegClosed    bool   `json:"is_reg_closed" db:"is_reg_closed"`
	IsEventStarted bool   `json:"is_event_started" db:"is_event_started"`

	Schedules []Schedule `json:"schedules,omitempty"`
	Speakers  []Speaker  `json:"speakers,omitempty"`
}

type Schedule struct {
	ID       string `json:"id" db:"id"`
	EventID  string `json:"event_id" db:"event_id"`
	Title    string `json:"title" db:"title"`
	DateTime string `json:"date_time" db:"date_time"`
}

type Speaker struct {
	ID          string `json:"id" db:"id"`
	EventID     string `json:"event_id" db:"event_id"`
	Name        string `json:"name" db:"name"`
	Designation string `json:"designation" db:"designation"`
	Company     string `json:"company" db:"company"`
	Image       string `json:"image" db:"image"`
}

type EventReg struct {
	EventName      string `json:"event_name" db:"event_name"`
	IsRegClosed    bool   `json:"is_reg_closed" db:"is_reg_closed"`
	IsEventStarted bool   `json:"is_event_started" db:"is_event_started"`
}

type EventTask struct {
	ID           string `json:"id" db:"id"`
	EventID      string `json:"event_id" db:"event_id"`
	Instructions string `json:"instructions" db:"instructions"`
	DriveLink    string `json:"drive_link" db:"drive_link"`
	CreatedAt    string `json:"created_at" db:"created_at"`
	UpdatedAt    string `json:"updated_at" db:"updated_at"`
}

type CreateEventTaskRequest struct {
	Instructions string `json:"instructions" binding:"required"`
	DriveLink    string `json:"drive_link" binding:"required"`
}
