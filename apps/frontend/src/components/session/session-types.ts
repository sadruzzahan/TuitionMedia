export type SessionStatus = "PENDING" | "CONFIRMED" | "COMPLETED" | "CANCELLED";

export type Session = {
  id: string;
  applicationId: string;
  studentId: string;
  tutorId: string;
  scheduledAt: string;
  durationMinutes: number;
  subject: string;
  notes: string | null;
  status: SessionStatus;
  createdAt: string;
  student: { id: string; name: string | null; email: string };
  tutor: { id: string; name: string | null; email: string };
  application: {
    id: string;
    request: { id: string; title: string; subjects: string[] };
  };
};

export type AvailabilitySlot = {
  id?: string;
  dayOfWeek: number;
  startHour: number;
  endHour: number;
};

export type OpenSlot = {
  date: string;
  startHour: number;
  endHour: number;
};

export const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const DAY_NAMES_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
