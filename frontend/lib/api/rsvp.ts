import { BASE_URL } from '@/config/Backend';

export interface RSVPRequest {
    name: string;
    phonenumber: string;
    semester: string;
    branch: string;
    event_id: string;
}

export interface RSVPResponse {
    id: string;
    name: string;
    phonenumber: string;
    semester: string;
    branch: string;
    event_id: string;
    event_name: string;
    created_at: string;
}

export async function checkExistingRSVP(eventId: string, phonenumber: string): Promise<RSVPResponse | null> {
    try {
        const response = await fetch(`${BASE_URL}/api/v1/rsvps/${eventId}`);

        if (!response.ok) {
            return null;
        }

        const result = await response.json();
        const rsvps = result.data || [];

        // Normalize phone number for comparison
        const cleanedPhone = phonenumber.replace(/[^\d]/g, '');

        // Check if this phone number already has an RSVP for this event
        const existingRSVP = rsvps.find((rsvp: RSVPResponse) => {
            const rsvpPhone = rsvp.phonenumber.replace(/[^\d]/g, '');
            return rsvpPhone === cleanedPhone;
        });

        return existingRSVP || null;
    } catch (error) {
        return null;
    }
}

export async function submitRSVP(data: RSVPRequest): Promise<RSVPResponse> {
    const response = await fetch(`${BASE_URL}/api/v1/rsvps`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit RSVP');
    }

    const result = await response.json();
    return result.data;
}

export async function getRSVPsByEvent(eventId: string): Promise<RSVPResponse[]> {
    const response = await fetch(`${BASE_URL}/api/v1/rsvps/${eventId}`);

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch RSVPs');
    }

    const result = await response.json();
    return result.data || [];
}

export async function getRSVPById(id: string): Promise<RSVPResponse> {
    const response = await fetch(`${BASE_URL}/api/v1/rsvps/by-id/${id}`);

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch RSVP');
    }

    const result = await response.json();
    return result.data;
}

export async function deleteRSVP(id: string): Promise<void> {
    const response = await fetch(`${BASE_URL}/api/v1/rsvps/${id}`, {
        method: 'DELETE',
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete RSVP');
    }
}
