const isProduction =
  process.env.NEXT_PUBLIC_NODE_ENV === "production";

const baseUrl = isProduction
  ? process.env.NEXT_PUBLIC_API_URL
  : "http://localhost:8080";

export const BASE_URL = baseUrl;

export const APIENDPOINT = {
  Root: `${baseUrl}/`,
  Health: `${baseUrl}/health`,

  Login: `${baseUrl}/api/v1/auth/login`,
  ME: `${baseUrl}/api/v1/auth/me`,
  BlackoutLogin: `${baseUrl}/api/v1/auth/blackout/login`,

  GetAllEvents: `${baseUrl}/api/v1/events`,
  GetEventByID: (id: string) =>
    `${baseUrl}/api/v1/events/by-id/${id}`,
  GetEventBySlug: (slug: string) =>
    `${baseUrl}/api/v1/events/${slug}`,
  CreateEventTask: (eventId: string) =>
    `${baseUrl}/api/v1/events/id/${eventId}/task`,
  GetEventTask: (eventId: string) =>
    `${baseUrl}/api/v1/events/id/${eventId}/task`,
  UpdateEventTask: (eventId: string) =>
    `${baseUrl}/api/v1/events/id/${eventId}/task`,
  DeleteEventTask: (eventId: string) =>
    `${baseUrl}/api/v1/events/id/${eventId}/task`,
  GetSubmission: (eventId: string) =>
    `${baseUrl}/api/v1/submissions/${eventId}`,
  SaveSubmissionDraft: (eventId: string) =>
    `${baseUrl}/api/v1/submissions/${eventId}/draft`,
  SubmitSubmission: (eventId: string) =>
    `${baseUrl}/api/v1/submissions/${eventId}/submit`,
  CreateEvent: `${baseUrl}/api/v1/events`,
  CreateSpeaker: `${baseUrl}/api/v1/events/speakers`,
  CreateSchedule: `${baseUrl}/api/v1/events/schedules`,

  CreateRegistration: `${baseUrl}/api/v1/registrations`,
  GetRegistrationsByEventId: (eventId: string) =>
    `${baseUrl}/api/v1/registrations/${eventId}`,

  CreateRSVP: `${baseUrl}/api/v1/rsvps`,
  GetRSVPsByEventId: (eventId: string) =>
    `${baseUrl}/api/v1/rsvps/${eventId}`,
  GetRSVPById: (id: string) =>
    `${baseUrl}/api/v1/rsvps/by-id/${id}`,
  DeleteRSVP: (id: string) =>
    `${baseUrl}/api/v1/rsvps/${id}`,

  GetGameByID: (gameId: string) => `${baseUrl}/api/v1/game/${gameId}`,
  SubmitGameAnswer: `${baseUrl}/api/v1/game/answer`,
  RequestGameHint: `${baseUrl}/api/v1/game/hint`,
  GetGameLeaderboard: (gameId: string) => `${baseUrl}/api/v1/game/${gameId}/leaderboard`,
  BlackoutGame: `${baseUrl}/api/v1/game/blackout/game`,

  UploadFile: `${baseUrl}/api/v1/upload`,
  GetImageUrl: (key: string) =>
    `${baseUrl}/api/v1/upload/${key}`,
  GetFileURL: (key: string) =>
    `${baseUrl}/api/v1/upload/${key}`,
  DeleteFile: (key: string) =>
    `${baseUrl}/api/v1/upload/${key}`,
};
