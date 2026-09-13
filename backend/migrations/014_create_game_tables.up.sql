CREATE TABLE IF NOT EXISTS games (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    subtitle TEXT,
    duration_minutes INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    game_id UUID NOT NULL REFERENCES games(id) ON DELETE CASCADE,
    stage_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    discipline VARCHAR(255) NOT NULL,
    question TEXT NOT NULL,
    how_to_solve TEXT,
    correct_answer TEXT NOT NULL,
    asset_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (game_id, stage_number)
);

CREATE TABLE IF NOT EXISTS dead_ends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID NOT NULL UNIQUE REFERENCES chapters(id) ON DELETE CASCADE,
    trap_answer VARCHAR(255),
    riddle_question TEXT,
    riddle_answer TEXT,
    penalty_minutes INTEGER NOT NULL DEFAULT 0,
    penalty_points INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
    level SMALLINT NOT NULL CHECK (level BETWEEN 1 AND 2),
    text TEXT NOT NULL,
    point_cost INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chapters_game_id_stage_number
    ON chapters (game_id, stage_number);

CREATE INDEX IF NOT EXISTS idx_hints_chapter_id
    ON hints (chapter_id);
