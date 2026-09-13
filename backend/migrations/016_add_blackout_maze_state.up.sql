ALTER TABLE team_game_sessions
    ADD COLUMN IF NOT EXISTS maze_state VARCHAR(20) NOT NULL DEFAULT 'door';

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'team_game_sessions_maze_state_check'
    ) THEN
        ALTER TABLE team_game_sessions
            ADD CONSTRAINT team_game_sessions_maze_state_check
            CHECK (maze_state IN ('door', 'dead_end', 'completed'));
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS team_game_hint_unlocks (
    session_id UUID NOT NULL REFERENCES team_game_sessions(id) ON DELETE CASCADE,
    hint_id UUID NOT NULL REFERENCES hints(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (session_id, hint_id)
);
