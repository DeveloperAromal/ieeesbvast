CREATE TABLE registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    event_id UUID NOT NULL,

    fname VARCHAR(100) NOT NULL,
    lname VARCHAR(100),
    phonenumber VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    collage_name VARCHAR(255) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_registration_event
        FOREIGN KEY (event_id)
        REFERENCES events(id)
        ON DELETE CASCADE
);