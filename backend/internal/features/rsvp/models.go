package rsvp

type RSVP struct {
	ID          string `json:"id" db:"id"`
	Name        string `json:"name" db:"name"`
	Phonenumber string `json:"phonenumber" db:"phonenumber"`
	Semester    string `json:"semester" db:"semester"`
	Branch      string `json:"branch" db:"branch"`
	EventID     string `json:"event_id" db:"event_id"`
	EventName   string `json:"event_name" db:"event_name"`
	CreatedAt   string `json:"created_at" db:"created_at"`
}
