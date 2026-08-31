const isProduction =
  process.env.NEXT_PUBLIC_NODE_ENV === "production";

const baseUrl = isProduction
  ? process.env.NEXT_PUBLIC_API_URL
  : "http://localhost:8080";

export const APIENDPOINT = {
  Root: `${baseUrl}/`,
  Health: `${baseUrl}/health`,

  GetAllEvents: `${baseUrl}/api/v1/events`,
  GetEventByID: (id: string) =>
    `${baseUrl}/api/v1/events/name/${id}`,
  GetEventBySlug: (slug: string) =>
    `${baseUrl}/api/v1/events/${slug}`,
  CreateEvent: `${baseUrl}/api/v1/events`,
  CreateSpeaker: `${baseUrl}/api/v1/events/speakers`,
  CreateSchedule: `${baseUrl}/api/v1/events/schedules`,

  CreateRegistration: `${baseUrl}/api/v1/registrations`,

  UploadFile: `${baseUrl}/api/v1/upload`,
  GetImageUrl: (key: string) =>
    `${baseUrl}/api/v1/upload/${key}`,
  GetFileURL: (key: string) =>
    `${baseUrl}/api/v1/upload/${key}`,
  DeleteFile: (key: string) =>
    `${baseUrl}/api/v1/upload/${key}`,
};
