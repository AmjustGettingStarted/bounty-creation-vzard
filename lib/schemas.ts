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
    expiration_date: z.date().optional(),
    estimated_completion: z.object({
      days: z.number().int().min(0, "Days must be 0 or greater"),
      hours: z.number().int().min(0, "Hours must be between 0 and 23").max(23, "Hours must be between 0 and 23"),
      minutes: z.number().int().min(0, "Minutes must be between 0 and 59").max(59, "Minutes must be between 0 and 59"),
    }),
  }).refine(
    (data) => {
      if (!data.expiration_date) {
        return false;
      }
      return data.expiration_date > new Date();
    },
    {
      message: "Expiration date is required and must be in the future",
      path: ["expiration_date"],
    }
  ),
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

export const step3Schema = z.object({
  has_backer: z.boolean(),
  backer: z.object({
    name: z.string().optional(),
    logo: z.string().optional(),
    message: z.string().optional(),
  }).optional(),
  terms_accepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
}).refine(
  (data) => {
    if (data.has_backer) {
      return data.backer?.name && data.backer.name.trim().length > 0;
    }
    return true;
  },
  {
    message: "Backer name is required when backer is enabled",
    path: ["backer", "name"],
  }
).refine(
  (data) => {
    if (data.has_backer) {
      return data.backer?.logo && data.backer.logo.trim().length > 0;
    }
    return true;
  },
  {
    message: "Backer logo URL is required when backer is enabled",
    path: ["backer", "logo"],
  }
).refine(
  (data) => {
    if (data.has_backer && data.backer?.logo) {
      try {
        new URL(data.backer.logo);
        return true;
      } catch {
        return false;
      }
    }
    return true;
  },
  {
    message: "Logo must be a valid URL",
    path: ["backer", "logo"],
  }
).transform((data) => {
  // If has_backer is false, set backer to undefined
  if (!data.has_backer) {
    return {
      ...data,
      backer: undefined,
    };
  }
  return data;
});

export type Step3FormData = z.infer<typeof step3Schema>;

