package game

import "time"

type Game struct {
	ID        string    `json:"id" db:"id"`
	Name      string    `json:"name" db:"name"`
	Subtitle  string    `json:"subtitle" db:"subtitle"`
	Duration  int       `json:"duration_minutes" db:"duration_minutes"`
	Chapters  []Chapter `json:"chapters" db:"-"`
	CreatedAt time.Time `json:"created_at" db:"created_at"`
	UpdatedAt time.Time `json:"updated_at" db:"updated_at"`
}

type Chapter struct {
	ID            string  `json:"id" db:"id"`
	GameID        string  `json:"game_id" db:"game_id"`
	StageNumber   int     `json:"stage_number" db:"stage_number"`
	Title         string  `json:"title" db:"title"`
	Discipline    string  `json:"discipline" db:"discipline"`
	Question      string  `json:"question" db:"question"`
	HowToSolve    string  `json:"-" db:"how_to_solve"`
	CorrectAnswer string  `json:"-" db:"correct_answer"`
	AssetURL      *string `json:"asset_url" db:"asset_url"`

	DeadEnd DeadEnd `json:"dead_end" db:"-"`
	Hints   []Hint  `json:"hints" db:"-"`
}

type DeadEnd struct {
	ID             string `json:"id" db:"id"`
	ChapterID      string `json:"chapter_id" db:"chapter_id"`
	TrapAnswer     string `json:"-" db:"trap_answer"`
	RiddleQuestion string `json:"riddle_question" db:"riddle_question"`
	RiddleAnswer   string `json:"-" db:"riddle_answer"`
	PenaltyMinutes int    `json:"penalty_minutes" db:"penalty_minutes"`
	PenaltyPoints  int    `json:"penalty_points" db:"penalty_points"`
}

type Hint struct {
	ID        string `json:"id" db:"id"`
	ChapterID string `json:"chapter_id" db:"chapter_id"`
	Level     int    `json:"level" db:"level"`
	Text      string `json:"text" db:"text"`
	Cost      int    `json:"point_cost" db:"point_cost"`
}

type ValidateAnswerRequest struct {
	GameID             string `json:"game_id" binding:"required"`
	StageNumber        int    `json:"stage_number" binding:"required,min=1"`
	Answer             string `json:"answer" binding:"required"`
	AnswerType         string `json:"answer_type"`
	TeamRegistrationID string `json:"team_registration_id,omitempty"`
}

type RequestHintRequest struct {
	GameID             string `json:"game_id" binding:"required"`
	StageNumber        int    `json:"stage_number" binding:"required,min=1"`
	TeamRegistrationID string `json:"team_registration_id,omitempty"`
}

type AnswerResult struct {
	Correct            bool     `json:"correct"`
	CurrentStage       int      `json:"current_stage"`
	NextStage          *Chapter `json:"next_stage,omitempty"`
	DeadEnd            *DeadEnd `json:"dead_end,omitempty"`
	Message            string   `json:"message"`
	CurrentChapter     *Chapter `json:"current_chapter,omitempty"`
	PenaltyMinutes     int      `json:"penalty_minutes,omitempty"`
	PenaltyPoints      int      `json:"penalty_points,omitempty"`
	Score              int      `json:"score,omitempty"`
	MazeState          string   `json:"maze_state,omitempty"`
	TeamRegistrationID string   `json:"team_registration_id,omitempty"`
}

type LeaderboardEntry struct {
	Rank               int    `json:"rank"`
	TeamRegistrationID string `json:"team_registration_id"`
	TeamName           string `json:"team_name"`
	CurrentStage       int    `json:"current_stage"`
	Score              int    `json:"score"`
	PenaltyMinutes     int    `json:"penalty_minutes"`
	PenaltyPoints      int    `json:"penalty_points"`
}

type CreateGameRequest struct {
	Name     string                 `json:"name" binding:"required"`
	Subtitle string                 `json:"subtitle"`
	Duration int                    `json:"duration_minutes" binding:"required"`
	Chapters []CreateChapterRequest `json:"chapters" binding:"required,dive"`
}

type CreateChapterRequest struct {
	StageNumber   int                  `json:"stage_number" binding:"required"`
	Title         string               `json:"title" binding:"required"`
	Discipline    string               `json:"discipline" binding:"required"`
	Question      string               `json:"question" binding:"required"`
	HowToSolve    string               `json:"how_to_solve"`
	CorrectAnswer string               `json:"correct_answer" binding:"required"`
	AssetURL      *string              `json:"asset_url"`
	DeadEnd       CreateDeadEndRequest `json:"dead_end" binding:"required"`
	Hints         []CreateHintRequest  `json:"hints"`
}

type CreateDeadEndRequest struct {
	TrapAnswer     string `json:"trap_answer"`
	RiddleQuestion string `json:"riddle_question"`
	RiddleAnswer   string `json:"riddle_answer"`
	PenaltyMinutes int    `json:"penalty_minutes"`
	PenaltyPoints  int    `json:"penalty_points"`
}

type CreateHintRequest struct {
	Level int    `json:"level" binding:"required,min=1,max=2"`
	Text  string `json:"text" binding:"required"`
	Cost  int    `json:"point_cost"`
}

type BlackoutGameData struct {
	GameID         string   `json:"game_id"`
	GameName       string   `json:"game_name"`
	GameSubtitle   string   `json:"game_subtitle"`
	Duration       int      `json:"duration_minutes"`
	CurrentStage   int      `json:"current_stage"`
	Score          int      `json:"score"`
	PenaltyMinutes int      `json:"penalty_minutes"`
	PenaltyPoints  int      `json:"penalty_points"`
	MazeState      string   `json:"maze_state"`
	Status         string   `json:"status"`
	CurrentChapter *Chapter `json:"current_chapter,omitempty"`
	UserID         string   `json:"user_id"`
}
