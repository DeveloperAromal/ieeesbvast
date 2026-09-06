export interface Event {
    id: string;
    event_name: string;
    event_slug: string;
    description: string;
    banner_image: string;
    poster_image: string;
    mode?: string;
    is_reg_closed: boolean;
    is_event_started: boolean;
    schedules?: Schedule[];
    speakers?: Speaker[];
}

export interface EventTask {
    id: string;
    event_id: string;
    instructions: string;
    drive_link: string;
    created_at: string;
    updated_at: string;
}

export interface SubmissionFile {
    id: string;
    submission_id: string;
    file_name: string;
    file_key: string;
    mime_type: string;
    file_size: number;
    created_at: string;
}

export interface Submission {
    id: string;
    user_id: string;
    event_id: string;
    status: "draft" | "submitted";
    submitted_at?: string;
    created_at: string;
    updated_at: string;
    files: SubmissionFile[];
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
