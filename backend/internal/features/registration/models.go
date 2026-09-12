package projects

type Registration struct {
	ID          string `json:"id" db:"id"`
	FName       string `json:"fname" db:"fname"`
	LName       string `json:"lname" db:"lname"`
	Phonenumber string `json:"phonenumber" db:"phonenumber"`
	Email       string `json:"email" db:"email"`
	CollageName string `json:"collage_name" db:"collage_name"`
	Semester    string `json:"semester" db:"semester"`
	Branch      string `json:"branch" db:"branch"`
	EventID     string `json:"event_id" db:"event_id"`
	EventName   string `json:"event_name" db:"event_name"`
}
