CREATE TABLE rsvps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    event_id UUID NOT NULL,

    name VARCHAR(255) NOT NULL,
    phonenumber VARCHAR(20) NOT NULL,
    semester VARCHAR(10) NOT NULL DEFAULT 'S1',
    branch VARCHAR(20) NOT NULL DEFAULT 'CSE',

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_rsvp_event
        FOREIGN KEY (event_id)
        REFERENCES events(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_rsvp_event_id ON rsvps(event_id);
