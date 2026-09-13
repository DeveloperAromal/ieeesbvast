package game

import (
	"context"
	"database/sql"
	"errors"
	"strings"

	hashing "github.com/DeveloperAromal/ieeesbvast/pkg/hashing"
)

var ErrRegistrationClosed = errors.New("registration is closed for this event")
var ErrGameNotFound = errors.New("game not found")
var ErrInvalidAnswer = errors.New("invalid answer")
var ErrInvalidGameState = errors.New("this action is not available in the current maze state")

type Repository interface {
	Create(ctx context.Context, game Game) (Game, error)
	GetByID(ctx context.Context, id string) (Game, error)
	ValidateAnswer(ctx context.Context, req ValidateAnswerRequest) (AnswerResult, error)
	RequestHint(ctx context.Context, req RequestHintRequest) (Hint, int, error)
	GetTeamRegistrationIDFromSessionToken(ctx context.Context, token string) (string, error)
	GetLeaderboard(ctx context.Context, gameID string) ([]LeaderboardEntry, error)
	GetBlackoutGameData(ctx context.Context, sessionToken string) (BlackoutGameData, error)
}

type repository struct {
	db *sql.DB
}

func NewRepository(db *sql.DB) *repository {
	return &repository{db: db}
}

func (repo *repository) Create(ctx context.Context, game Game) (Game, error) {
	tx, err := repo.db.BeginTx(ctx, nil)
	if err != nil {
		return Game{}, err
	}
	defer tx.Rollback()

	gameQuery := `
		INSERT INTO games (name, subtitle, duration_minutes, created_at, updated_at)
		VALUES ($1, $2, $3, NOW(), NOW())
		RETURNING id, created_at, updated_at
	`

	err = tx.QueryRowContext(ctx, gameQuery, game.Name, game.Subtitle, game.Duration).
		Scan(&game.ID, &game.CreatedAt, &game.UpdatedAt)
	if err != nil {
		return Game{}, err
	}

	for i := range game.Chapters {
		chapter := &game.Chapters[i]

		chapterQuery := `
			INSERT INTO chapters (game_id, stage_number, title, discipline, question, how_to_solve, correct_answer, asset_url)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
			RETURNING id
		`
		err = tx.QueryRowContext(
			ctx,
			chapterQuery,
			game.ID,
			chapter.StageNumber,
			chapter.Title,
			chapter.Discipline,
			chapter.Question,
			chapter.HowToSolve,
			chapter.CorrectAnswer,
			chapter.AssetURL,
		).Scan(&chapter.ID)
		if err != nil {
			return Game{}, err
		}
		chapter.GameID = game.ID

		deadEndQuery := `
			INSERT INTO dead_ends (chapter_id, trap_answer, riddle_question, riddle_answer, penalty_minutes, penalty_points)
			VALUES ($1, $2, $3, $4, $5, $6)
			RETURNING id
		`
		err = tx.QueryRowContext(
			ctx,
			deadEndQuery,
			chapter.ID,
			chapter.DeadEnd.TrapAnswer,
			chapter.DeadEnd.RiddleQuestion,
			chapter.DeadEnd.RiddleAnswer,
			chapter.DeadEnd.PenaltyMinutes,
			chapter.DeadEnd.PenaltyPoints,
		).Scan(&chapter.DeadEnd.ID)
		if err != nil {
			return Game{}, err
		}
		chapter.DeadEnd.ChapterID = chapter.ID

		for j := range chapter.Hints {
			hint := &chapter.Hints[j]

			hintQuery := `
				INSERT INTO hints (chapter_id, level, text, point_cost)
				VALUES ($1, $2, $3, $4)
				RETURNING id
			`
			err = tx.QueryRowContext(ctx, hintQuery, chapter.ID, hint.Level, hint.Text, hint.Cost).Scan(&hint.ID)
			if err != nil {
				return Game{}, err
			}
			hint.ChapterID = chapter.ID
		}
	}

	if err = tx.Commit(); err != nil {
		return Game{}, err
	}

	return game, nil
}

func (repo *repository) GetByID(ctx context.Context, id string) (Game, error) {
	var game Game

	gameQuery := `
		SELECT id, name, subtitle, duration_minutes, created_at, updated_at
		FROM games
		WHERE id = $1
	`

	err := repo.db.QueryRowContext(ctx, gameQuery, id).Scan(
		&game.ID,
		&game.Name,
		&game.Subtitle,
		&game.Duration,
		&game.CreatedAt,
		&game.UpdatedAt,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return Game{}, ErrGameNotFound
	}
	if err != nil {
		return Game{}, err
	}

	chapterQuery := `
		SELECT id, game_id, stage_number, title, discipline, question, how_to_solve, correct_answer, asset_url
		FROM chapters
		WHERE game_id = $1
		ORDER BY stage_number ASC
	`

	rows, err := repo.db.QueryContext(ctx, chapterQuery, game.ID)
	if err != nil {
		return Game{}, err
	}
	defer rows.Close()

	for rows.Next() {
		var chapter Chapter
		var howToSolve sql.NullString
		var assetURL sql.NullString

		if err := rows.Scan(
			&chapter.ID,
			&chapter.GameID,
			&chapter.StageNumber,
			&chapter.Title,
			&chapter.Discipline,
			&chapter.Question,
			&howToSolve,
			&chapter.CorrectAnswer,
			&assetURL,
		); err != nil {
			return Game{}, err
		}
		chapter.HowToSolve = howToSolve.String
		if assetURL.Valid {
			chapter.AssetURL = &assetURL.String
		}
		chapter.DeadEnd, err = repo.getDeadEndByChapterID(ctx, chapter.ID)
		if err != nil {
			return Game{}, err
		}
		chapter.Hints, err = repo.getHintsByChapterID(ctx, chapter.ID)
		if err != nil {
			return Game{}, err
		}
		game.Chapters = append(game.Chapters, chapter)
	}

	if err := rows.Err(); err != nil {
		return Game{}, err
	}

	return game, nil
}

func (repo *repository) ValidateAnswer(ctx context.Context, req ValidateAnswerRequest) (AnswerResult, error) {
	var result AnswerResult
	if req.TeamRegistrationID == "" {
		return result, errors.New("team registration not found for this user")
	}
	if err := repo.ensureTeamGameSession(ctx, req.TeamRegistrationID, req.GameID); err != nil {
		return result, err
	}
	tx, err := repo.db.BeginTx(ctx, nil)
	if err != nil {
		return result, err
	}
	defer tx.Rollback()

	var sessionID, mazeState, status string
	var currentStage, score int
	err = tx.QueryRowContext(ctx, `SELECT id, current_stage, score, maze_state, status FROM team_game_sessions WHERE team_registration_id = $1 AND game_id = $2 FOR UPDATE`, req.TeamRegistrationID, req.GameID).Scan(&sessionID, &currentStage, &score, &mazeState, &status)
	if err != nil {
		return result, err
	}
	if req.StageNumber != currentStage || status == "completed" || mazeState == "completed" {
		return result, ErrInvalidGameState
	}
	chapter, err := repo.getChapterByGameAndStage(ctx, req.GameID, currentStage)
	if err != nil {
		return result, err
	}
	result.CurrentStage, result.TeamRegistrationID = currentStage, req.TeamRegistrationID
	answerType := req.AnswerType
	if answerType == "" {
		answerType = "door"
	}
	cleanAnswer := strings.TrimSpace(strings.ToLower(req.Answer))

	if mazeState == "dead_end" {
		if answerType != "escape" {
			return result, ErrInvalidGameState
		}
		deadEnd, err := repo.getDeadEndByChapterID(ctx, chapter.ID)
		if err != nil {
			return result, err
		}
		if cleanAnswer != strings.TrimSpace(strings.ToLower(deadEnd.RiddleAnswer)) {
			result.Score, result.MazeState = score, "dead_end"
			result.Message = "That does not open the escape route. Try the riddle again."
			result.DeadEnd = &deadEnd
			return result, tx.Commit()
		}
		if _, err = tx.ExecContext(ctx, `UPDATE team_game_sessions SET maze_state = 'door', updated_at = NOW() WHERE id = $1`, sessionID); err != nil {
			return result, err
		}
		result.Correct, result.Score, result.MazeState = true, score, "door"
		result.Message = "Escape route opened. Return to the locked door."
		return result, tx.Commit()
	}
	if mazeState != "door" || answerType != "door" {
		return result, ErrInvalidGameState
	}

	if cleanAnswer != strings.TrimSpace(strings.ToLower(chapter.CorrectAnswer)) {
		deadEnd, err := repo.getDeadEndByChapterID(ctx, chapter.ID)
		if err != nil {
			return result, err
		}
		if deadEnd.ID == "" {
			return result, ErrInvalidGameState
		}
		err = tx.QueryRowContext(ctx, `UPDATE team_game_sessions SET maze_state = 'dead_end', penalty_minutes = penalty_minutes + $2, penalty_points = penalty_points + $3, score = score - $3, updated_at = NOW() WHERE id = $1 RETURNING score`, sessionID, deadEnd.PenaltyMinutes, deadEnd.PenaltyPoints).Scan(&result.Score)
		if err != nil {
			return result, err
		}
		result.MazeState, result.DeadEnd = "dead_end", &deadEnd
		result.PenaltyMinutes, result.PenaltyPoints = deadEnd.PenaltyMinutes, deadEnd.PenaltyPoints
		result.Message = "The door was a dead end. Solve the escape riddle to return."
		return result, tx.Commit()
	}

	if _, err = tx.ExecContext(ctx, `INSERT INTO team_game_chapter_progress (session_id, chapter_id, solved, attempts, solved_at) VALUES ($1, $2, TRUE, 1, NOW()) ON CONFLICT (session_id, chapter_id) DO UPDATE SET solved = TRUE, attempts = team_game_chapter_progress.attempts + 1, solved_at = NOW(), updated_at = NOW()`, sessionID, chapter.ID); err != nil {
		return result, err
	}
	nextStage, nextErr := repo.getChapterByGameAndStage(ctx, req.GameID, currentStage+1)
	if errors.Is(nextErr, ErrGameNotFound) {
		err = tx.QueryRowContext(ctx, `UPDATE team_game_sessions SET score = score + 100, maze_state = 'completed', status = 'completed', finished_at = NOW(), updated_at = NOW() WHERE id = $1 RETURNING score`, sessionID).Scan(&result.Score)
		if err != nil {
			return result, err
		}
		result.Correct, result.MazeState, result.Message = true, "completed", "Final door cleared. You escaped the Blackout maze."
		return result, tx.Commit()
	}
	if nextErr != nil {
		return result, nextErr
	}
	err = tx.QueryRowContext(ctx, `UPDATE team_game_sessions SET current_stage = $2, score = score + 100, updated_at = NOW() WHERE id = $1 RETURNING score`, sessionID, currentStage+1).Scan(&result.Score)
	if err != nil {
		return result, err
	}
	result.Correct, result.MazeState, result.NextStage, result.Message = true, "door", &nextStage, "Correct. The next door is unlocked."
	return result, tx.Commit()
}

func (repo *repository) RequestHint(ctx context.Context, req RequestHintRequest) (Hint, int, error) {
	var hint Hint
	if req.TeamRegistrationID == "" {
		return hint, 0, errors.New("team registration not found for this user")
	}
	if err := repo.ensureTeamGameSession(ctx, req.TeamRegistrationID, req.GameID); err != nil {
		return hint, 0, err
	}
	tx, err := repo.db.BeginTx(ctx, nil)
	if err != nil {
		return hint, 0, err
	}
	defer tx.Rollback()
	var sessionID, mazeState, status string
	var currentStage int
	if err = tx.QueryRowContext(ctx, `SELECT id, current_stage, maze_state, status FROM team_game_sessions WHERE team_registration_id = $1 AND game_id = $2 FOR UPDATE`, req.TeamRegistrationID, req.GameID).Scan(&sessionID, &currentStage, &mazeState, &status); err != nil {
		return hint, 0, err
	}
	if req.StageNumber != currentStage || mazeState != "door" || status == "completed" {
		return hint, 0, ErrInvalidGameState
	}
	chapter, err := repo.getChapterByGameAndStage(ctx, req.GameID, currentStage)
	if err != nil {
		return hint, 0, err
	}
	err = tx.QueryRowContext(ctx, `SELECT h.id, h.chapter_id, h.level, h.text, h.point_cost FROM hints h WHERE h.chapter_id = $1 AND NOT EXISTS (SELECT 1 FROM team_game_hint_unlocks u WHERE u.session_id = $2 AND u.hint_id = h.id) ORDER BY h.level ASC LIMIT 1`, chapter.ID, sessionID).Scan(&hint.ID, &hint.ChapterID, &hint.Level, &hint.Text, &hint.Cost)
	if errors.Is(err, sql.ErrNoRows) {
		return hint, 0, ErrGameNotFound
	}
	if err != nil {
		return hint, 0, err
	}
	if _, err = tx.ExecContext(ctx, `INSERT INTO team_game_hint_unlocks (session_id, hint_id) VALUES ($1, $2)`, sessionID, hint.ID); err != nil {
		return hint, 0, err
	}
	var score int
	if err = tx.QueryRowContext(ctx, `UPDATE team_game_sessions SET score = score - $2, updated_at = NOW() WHERE id = $1 RETURNING score`, sessionID, hint.Cost).Scan(&score); err != nil {
		return hint, 0, err
	}
	if err = tx.Commit(); err != nil {
		return hint, 0, err
	}
	return hint, score, nil
}

func (repo *repository) GetTeamRegistrationIDFromSessionToken(ctx context.Context, token string) (string, error) {
	hashedToken, err := hashing.NewAlgo().CreateSHA(token)
	if err != nil {
		return "", err
	}

	query := `
		SELECT u.reg_id
		FROM sessions s
		JOIN users u ON u.id = s.user_id
		WHERE s.token_hash = $1 AND s.expires_at > NOW()
	`

	var regID string
	if err := repo.db.QueryRowContext(ctx, query, hashedToken).Scan(&regID); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return "", errors.New("session expired or invalid")
		}
		return "", err
	}

	return regID, nil
}

func (repo *repository) GetLeaderboard(ctx context.Context, gameID string) ([]LeaderboardEntry, error) {
	query := `
		SELECT
			s.team_registration_id,
			r.team_name,
			s.current_stage,
			s.score,
			s.penalty_minutes,
			s.penalty_points
		FROM team_game_sessions s
		JOIN registrations r ON r.id = s.team_registration_id
		WHERE s.game_id = $1
		ORDER BY s.score DESC, s.current_stage DESC, s.updated_at ASC
	`

	rows, err := repo.db.QueryContext(ctx, query, gameID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	entries := make([]LeaderboardEntry, 0)
	for rows.Next() {
		var entry LeaderboardEntry
		var registrationID string
		if err := rows.Scan(&registrationID, &entry.TeamName, &entry.CurrentStage, &entry.Score, &entry.PenaltyMinutes, &entry.PenaltyPoints); err != nil {
			return nil, err
		}
		entry.TeamRegistrationID = registrationID
		entries = append(entries, entry)
	}
	if err := rows.Err(); err != nil {
		return nil, err
	}

	for i := range entries {
		entries[i].Rank = i + 1
	}

	return entries, nil
}

func (repo *repository) GetBlackoutGameData(ctx context.Context, sessionToken string) (BlackoutGameData, error) {
	var gameData BlackoutGameData
	var sessionID sql.NullString

	hashedToken, err := hashing.NewAlgo().CreateSHA(sessionToken)
	if err != nil {
		return BlackoutGameData{}, err
	}

	// First, get user and game info
	gameQuery := `
		SELECT
			g.id,
			g.name,
			g.subtitle,
			g.duration_minutes,
			u.reg_id,
			COALESCE(tgs.current_stage, 1),
			COALESCE(tgs.score, 0),
			COALESCE(tgs.penalty_minutes, 0),
			COALESCE(tgs.penalty_points, 0),
			COALESCE(tgs.maze_state, 'door'),
			COALESCE(tgs.status, 'in_progress'),
			tgs.id
		FROM sessions s
		JOIN users u ON s.user_id = u.id
		JOIN (SELECT id, name, subtitle, duration_minutes FROM games ORDER BY created_at DESC LIMIT 1) g ON true
		LEFT JOIN team_game_sessions tgs ON tgs.game_id = g.id AND tgs.team_registration_id = u.reg_id
		WHERE s.token_hash = $1 AND s.expires_at > NOW()
	`

	err = repo.db.QueryRowContext(ctx, gameQuery, hashedToken).Scan(
		&gameData.GameID,
		&gameData.GameName,
		&gameData.GameSubtitle,
		&gameData.Duration,
		&gameData.UserID,
		&gameData.CurrentStage,
		&gameData.Score,
		&gameData.PenaltyMinutes,
		&gameData.PenaltyPoints,
		&gameData.MazeState,
		&gameData.Status,
		&sessionID,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return BlackoutGameData{}, errors.New("session expired or no game configured")
		}
		return BlackoutGameData{}, err
	}

	// Only hints explicitly unlocked by this team are returned to the browser.
	chapter, err := repo.getBlackoutChapter(ctx, gameData.GameID, gameData.CurrentStage, sessionID)
	if err != nil {
		// Log but don't fail - chapter might not exist for this stage
		return gameData, nil
	}

	gameData.CurrentChapter = &chapter
	return gameData, nil
}

func (repo *repository) getBlackoutChapter(ctx context.Context, gameID string, stageNumber int, sessionID sql.NullString) (Chapter, error) {
	var chapter Chapter
	var howToSolve sql.NullString
	var assetURL sql.NullString

	// Simple query without JSON aggregation first
	query := `
		SELECT
			c.id,
			c.game_id,
			c.stage_number,
			c.title,
			c.discipline,
			c.question,
			c.how_to_solve,
			c.asset_url
		FROM chapters c
		WHERE c.game_id = $1 AND c.stage_number = $2
	`

	err := repo.db.QueryRowContext(ctx, query, gameID, stageNumber).Scan(
		&chapter.ID,
		&chapter.GameID,
		&chapter.StageNumber,
		&chapter.Title,
		&chapter.Discipline,
		&chapter.Question,
		&howToSolve,
		&assetURL,
	)

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return Chapter{}, ErrGameNotFound
		}
		return Chapter{}, err
	}

	chapter.HowToSolve = howToSolve.String
	if assetURL.Valid {
		chapter.AssetURL = &assetURL.String
	}

	// Fetch dead end separately
	chapter.DeadEnd, _ = repo.getDeadEndByChapterID(ctx, chapter.ID)

	if sessionID.Valid {
		chapter.Hints, _ = repo.getUnlockedHintsByChapterID(ctx, sessionID.String, chapter.ID)
	}

	return chapter, nil
}

func (repo *repository) getUnlockedHintsByChapterID(ctx context.Context, sessionID, chapterID string) ([]Hint, error) {
	rows, err := repo.db.QueryContext(ctx, `
		SELECT h.id, h.chapter_id, h.level, h.text, h.point_cost
		FROM hints h
		JOIN team_game_hint_unlocks u ON u.hint_id = h.id
		WHERE u.session_id = $1 AND h.chapter_id = $2
		ORDER BY h.level ASC`, sessionID, chapterID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var hints []Hint
	for rows.Next() {
		var hint Hint
		if err := rows.Scan(&hint.ID, &hint.ChapterID, &hint.Level, &hint.Text, &hint.Cost); err != nil {
			return nil, err
		}
		hints = append(hints, hint)
	}
	return hints, rows.Err()
}

func (repo *repository) ensureTeamGameSession(ctx context.Context, teamRegistrationID, gameID string) error {
	query := `
		INSERT INTO team_game_sessions (team_registration_id, game_id, current_stage, score, penalty_minutes, penalty_points, status)
		VALUES ($1, $2, 1, 0, 0, 0, 'in_progress')
		ON CONFLICT (team_registration_id, game_id)
		DO NOTHING
	`
	_, err := repo.db.ExecContext(ctx, query, teamRegistrationID, gameID)
	return err
}

func (repo *repository) markChapterSolved(ctx context.Context, teamRegistrationID, gameID, chapterID string) error {
	query := `
		INSERT INTO team_game_chapter_progress (session_id, chapter_id, solved, attempts, solved_at)
		SELECT id, $3, TRUE, 1, NOW()
		FROM team_game_sessions
		WHERE team_registration_id = $1 AND game_id = $2
		ON CONFLICT (session_id, chapter_id)
		DO UPDATE SET solved = TRUE, attempts = team_game_chapter_progress.attempts + 1, solved_at = NOW(), updated_at = NOW()
	`
	_, err := repo.db.ExecContext(ctx, query, teamRegistrationID, gameID, chapterID)
	return err
}

func (repo *repository) advanceTeamGameSession(ctx context.Context, teamRegistrationID, gameID string, scoreDelta, nextStage int) error {
	query := `
		UPDATE team_game_sessions
		SET current_stage = $3,
			score = score + $4,
			updated_at = NOW()
		WHERE team_registration_id = $1 AND game_id = $2
	`
	_, err := repo.db.ExecContext(ctx, query, teamRegistrationID, gameID, nextStage, scoreDelta)
	return err
}

func (repo *repository) completeTeamGameSession(ctx context.Context, teamRegistrationID, gameID string, scoreDelta, currentStage int) error {
	query := `
		UPDATE team_game_sessions
		SET current_stage = $3,
			score = score + $4,
			status = 'completed',
			finished_at = NOW(),
			updated_at = NOW()
		WHERE team_registration_id = $1 AND game_id = $2
	`
	_, err := repo.db.ExecContext(ctx, query, teamRegistrationID, gameID, currentStage, scoreDelta)
	return err
}

func (repo *repository) applyDeadEndPenalty(ctx context.Context, teamRegistrationID, gameID string, penaltyMinutes, penaltyPoints int) error {
	query := `
		UPDATE team_game_sessions
		SET penalty_minutes = penalty_minutes + $3,
			penalty_points = penalty_points + $4,
			score = CASE WHEN score - $4 < 0 THEN 0 ELSE score - $4 END,
			updated_at = NOW()
		WHERE team_registration_id = $1 AND game_id = $2
	`
	_, err := repo.db.ExecContext(ctx, query, teamRegistrationID, gameID, penaltyMinutes, penaltyPoints)
	return err
}

func (repo *repository) getChapterByGameAndStage(ctx context.Context, gameID string, stageNumber int) (Chapter, error) {
	var chapter Chapter
	var howToSolve sql.NullString
	var assetURL sql.NullString

	query := `
		SELECT id, game_id, stage_number, title, discipline, question, how_to_solve, correct_answer, asset_url
		FROM chapters
		WHERE game_id = $1 AND stage_number = $2
	`

	err := repo.db.QueryRowContext(ctx, query, gameID, stageNumber).Scan(
		&chapter.ID,
		&chapter.GameID,
		&chapter.StageNumber,
		&chapter.Title,
		&chapter.Discipline,
		&chapter.Question,
		&howToSolve,
		&chapter.CorrectAnswer,
		&assetURL,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return Chapter{}, ErrGameNotFound
	}
	if err != nil {
		return Chapter{}, err
	}

	chapter.HowToSolve = howToSolve.String
	if assetURL.Valid {
		chapter.AssetURL = &assetURL.String
	}

	return chapter, nil
}

func (repo *repository) getDeadEndByChapterID(ctx context.Context, chapterID string) (DeadEnd, error) {
	var deadEnd DeadEnd
	query := `
		SELECT id, chapter_id, trap_answer, riddle_question, riddle_answer, penalty_minutes, penalty_points
		FROM dead_ends
		WHERE chapter_id = $1
	`

	err := repo.db.QueryRowContext(ctx, query, chapterID).Scan(
		&deadEnd.ID,
		&deadEnd.ChapterID,
		&deadEnd.TrapAnswer,
		&deadEnd.RiddleQuestion,
		&deadEnd.RiddleAnswer,
		&deadEnd.PenaltyMinutes,
		&deadEnd.PenaltyPoints,
	)
	if errors.Is(err, sql.ErrNoRows) {
		return DeadEnd{}, nil
	}
	if err != nil {
		return DeadEnd{}, err
	}

	return deadEnd, nil
}

func (repo *repository) getHintsByChapterID(ctx context.Context, chapterID string) ([]Hint, error) {
	query := `
		SELECT id, chapter_id, level, text, point_cost
		FROM hints
		WHERE chapter_id = $1
		ORDER BY level ASC
	`

	rows, err := repo.db.QueryContext(ctx, query, chapterID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var hints []Hint
	for rows.Next() {
		var hint Hint
		if err := rows.Scan(&hint.ID, &hint.ChapterID, &hint.Level, &hint.Text, &hint.Cost); err != nil {
			return nil, err
		}
		hints = append(hints, hint)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	return hints, nil
}
