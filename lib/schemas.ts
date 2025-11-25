import { z } from "zod";

export const step1Schema = z.object({
  title: z.string().min(1, "Title is required").max(40, "Title must be 40 characters or less"),
  description: z.string().min(1, "Description is required"),
  type: z.enum(["Content", "Design", "Development", "Marketing", "Other"], {
    required_error: "Type is required",
  }),
  dominant_core: z.enum(["Water", "Earth", "Social", "Energy"], {
    required_error: "Dominant core is required",
  }),
  mode: z.enum(["digital", "physical"], {
    required_error: "Mode is required",
  }),
  location: z.string().optional(),
}).refine(
  (data) => {
    if (data.mode === "physical") {
      return data.location && data.location.trim().length > 0;
    }
    return true;
  },
  {
    message: "Location is required for physical mode",
    path: ["location"],
  }
);

export type Step1FormData = z.infer<typeof step1Schema>;

export const step2Schema = z.object({
  reward: z.object({
    currency: z.enum(["USD", "EUR", "INR", "GBP"], {
      required_error: "Currency is required",
    }),
    amount: z.number().min(0.01, "Amount must be greater than 0"),
    winners: z.number().int().min(1, "Winners must be at least 1"),
  }),
  timeline: z.object({
    expiration_date: z.date({
      required_error: "Expiration date is required",
    }).refine(
      (date) => date > new Date(),
      {
        message: "Expiration date must be in the future",
      }
    ),
    estimated_completion: z.object({
      days: z.number().int().min(0, "Days must be 0 or greater"),
      hours: z.number().int().min(0, "Hours must be between 0 and 23").max(23, "Hours must be between 0 and 23"),
      minutes: z.number().int().min(0, "Minutes must be between 0 and 59").max(59, "Minutes must be between 0 and 59"),
    }),
  }),
  hasImpactCertificate: z.boolean(),
  impactBriefMessage: z.string().optional(),
  sdgs: z.array(z.string()).min(1, "At least one SDG must be selected"),
}).refine(
  (data) => {
    if (data.hasImpactCertificate) {
      return data.impactBriefMessage && data.impactBriefMessage.trim().length > 0;
    }
    return true;
  },
  {
    message: "Impact brief message is required when impact certificate is enabled",
    path: ["impactBriefMessage"],
  }
);

export type Step2FormData = z.infer<typeof step2Schema>;

