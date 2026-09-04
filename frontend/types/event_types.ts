export interface Event {
    id: string;
    event_name: string;
    event_slug: string;
    description: string;
    banner_image: string;
    poster_image: string;
    mode?: string;
    is_reg_closed: boolean;
    schedules?: Schedule[];
    speakers?: Speaker[];
}

export interface Schedule {
    id: string;
    event_id: string;
    title: string;
    date_time: string;
}

export interface Speaker {
    id: string;
    event_id: string;
    name: string;
    designation: string;
    company: string;
    image: string;
}
