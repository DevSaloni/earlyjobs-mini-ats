import { z } from 'zod';
import { HiringStage, HIRING_STAGES } from '../types.ts';

export const CandidateSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Candidate name must be at least 2 characters' })
    .max(100, { message: 'Candidate name cannot exceed 100 characters' })
    .trim(),
  email: z
    .string()
    .email({ message: 'A valid email address is required (e.g. name@domain.com)' })
    .trim()
    .toLowerCase(),
  phone: z.string().trim().optional().default(''),
  jobTitle: z
    .string()
    .min(2, { message: 'Job title is required' })
    .max(100)
    .trim(),
  experience: z.coerce
    .number()
    .min(0, { message: 'Experience cannot be negative' })
    .default(0),
  skills: z
    .array(z.string().trim())
    .or(
      z.string().transform((val) =>
        val
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean)
      )
    )
    .optional()
    .default([]),
  resumeUrl: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => !val || /^https?:\/\/.+/i.test(val),
      { message: 'Resume URL must begin with http:// or https://' }
    )
    .default(''),
  stage: z.enum(HIRING_STAGES as [HiringStage, ...HiringStage[]]).default('Applied'),
  appliedAt: z.coerce.date().optional().default(() => new Date()),
  notes: z.string().trim().optional().default(''),
});

export const CandidateUpdateSchema = CandidateSchema.partial();

export const StageUpdateSchema = z.object({
  stage: z.enum(HIRING_STAGES as [HiringStage, ...HiringStage[]]),
  notes: z.string().trim().optional(),
});
