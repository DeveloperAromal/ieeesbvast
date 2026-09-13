CREATE TABLE IF NOT EXISTS registration_team_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    registration_id UUID NOT NULL REFERENCES registrations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (registration_id, email)
);

CREATE INDEX IF NOT EXISTS idx_registration_team_members_registration_id
    ON registration_team_members(registration_id);
