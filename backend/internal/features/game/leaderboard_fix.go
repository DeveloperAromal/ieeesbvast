package game

// GetLeaderboard query fix - change INNER JOIN to LEFT JOIN
// File: backend/internal/features/game/repository.go
// Function: GetLeaderboard
// Line: ~354-381

// OLD QUERY:
// SELECT
//   s.team_registration_id,
//   r.team_name,
//   s.current_stage,
//   s.score,
//   s.penalty_minutes,
//   s.penalty_points
// FROM team_game_sessions s
// JOIN registrations r ON r.id = s.team_registration_id
// WHERE s.game_id = $1
// ORDER BY s.score DESC, s.current_stage DESC, s.updated_at ASC

// NEW QUERY:
// SELECT
//   COALESCE(s.team_registration_id, ''),
//   COALESCE(r.team_name, 'Unknown Team'),
//   s.current_stage,
//   s.score,
//   s.penalty_minutes,
//   s.penalty_points
// FROM team_game_sessions s
// LEFT JOIN registrations r ON r.id = s.team_registration_id
// WHERE s.game_id = $1
// ORDER BY s.score DESC, s.current_stage DESC, s.updated_at ASC
