CREATE TABLE IF NOT EXISTS team_game_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    current_stage INTEGER NOT NULL DEFAULT 1,
    score INTEGER NOT NULL DEFAULT 0,
    penalty_minutes INTEGER NOT NULL DEFAULT 0,
    penalty_points INTEGER NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'in_progress',
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    finished_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (team_registration_id, game_id)
);

CREATE TABLE IF NOT EXISTS team_game_chapter_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES team_game_sessions(id) ON DELETE CASCADE,
    chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    solved BOOLEAN NOT NULL DEFAULT FALSE,
    attempts INTEGER NOT NULL DEFAULT 0,
    solved_at TIMESTAMPTZ NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (session_id, chapter_id)
);

CREATE INDEX IF NOT EXISTS idx_team_game_sessions_game_id
    ON team_game_sessions(game_id, score DESC, current_stage DESC);

CREATE INDEX IF NOT EXISTS idx_team_game_sessions_team_registration_id
    ON team_game_sessions(team_registration_id);

CREATE INDEX IF NOT EXISTS idx_team_game_chapter_progress_session_id
    ON team_game_chapter_progress(session_id, chapter_id);
