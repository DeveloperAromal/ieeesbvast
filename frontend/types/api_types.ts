export type ApiResponse = {
    data?: any;
    status?: number;
    message: string;
    user?: string;
    success: boolean;
    token?: string
}

export interface RegistrationPayload {
    fname: string;
    lname: string;
    phonenumber: string;
    email: string;
    collage_name: string;
    semester: string;
    branch: string;
    event_id: string;
    team_name: string;
    team_size: number;
    team_members: TeamMemberPayload[];
}

export interface TeamMemberPayload {
    name: string;
    email: string;
}
