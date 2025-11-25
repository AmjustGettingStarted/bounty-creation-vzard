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

