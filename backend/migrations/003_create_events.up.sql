CREATE TABLE events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_name VARCHAR(255) NOT NULL,
    event_slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    banner_image TEXT,
    poster_image TEXT,
    is_reg_closed Boolean NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
