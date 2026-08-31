CREATE TABLE speakers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    event_id UUID NOT NULL,

    name VARCHAR(255) NOT NULL,
    designation VARCHAR(255),
    company VARCHAR(255),
    image TEXT,

    CONSTRAINT fk_speaker_event
        FOREIGN KEY (event_id)
        REFERENCES events(id)
        ON DELETE CASCADE
);