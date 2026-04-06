/**
 * TuitionMedia — Shared Zod schemas and TypeScript types.
 * Used by backend (NestJS Pipes) and frontend (React Hook Form + validation).
 */

import { z } from "zod";

// Full role enum for internal use (includes ADMIN)
export const UserRoleSchema = z.enum(["STUDENT", "TUTOR", "ADMIN"]);
export type UserRole = z.infer<typeof UserRoleSchema>;

// Public registration only allows STUDENT and TUTOR (no ADMIN signup)
export const PublicUserRoleSchema = z.enum(["STUDENT", "TUTOR"]);
export type PublicUserRole = z.infer<typeof PublicUserRoleSchema>;

export const RegisterUserSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: PublicUserRoleSchema,
  name: z.string().min(1).max(100).optional(),
  tutorProfile: z
    .object({
      bio: z.string().optional(),
      subjects: z.array(z.string()).optional(),
      hourlyRate: z.number().positive().optional(),
      education: z.string().optional(),
    })
    .optional(),
  studentProfile: z
    .object({
      gradeLevel: z.string().optional(),
      preferredLocation: z.string().optional(),
    })
    .optional(),
});
export type RegisterUser = z.infer<typeof RegisterUserSchema>;

export const LoginUserSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(1, "Password required"),
});
export type LoginUser = z.infer<typeof LoginUserSchema>;

export const CreateTuitionRequestSchema = z.object({
  title: z.string().min(1, "Title required").max(200),
  description: z.string().min(1, "Description required").max(2000),
  subjects: z.array(z.string()).min(1, "At least one subject required"),
  level: z.string().optional(),
  mode: z.string().optional(),
  budget: z.number().positive().optional(),
  division: z.string().optional(),
  area: z.string().optional(),
});
export type CreateTuitionRequest = z.infer<typeof CreateTuitionRequestSchema>;

export const CreateApplicationSchema = z.object({
  requestId: z.string().min(1, "Request ID required"),
  coverLetter: z.string().min(1, "Cover letter required").max(2000),
});
export type CreateApplication = z.infer<typeof CreateApplicationSchema>;

export const TuitionRequestStatusSchema = z.enum(["OPEN", "IN_PROGRESS", "CLOSED"]);
export type TuitionRequestStatus = z.infer<typeof TuitionRequestStatusSchema>;

export const ApplicationStatusSchema = z.enum(["PENDING", "ACCEPTED", "REJECTED"]);
export type ApplicationStatus = z.infer<typeof ApplicationStatusSchema>;
