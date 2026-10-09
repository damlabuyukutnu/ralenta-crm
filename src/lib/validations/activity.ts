import { z } from "zod";
import { ACTIVITY_TYPES } from "@/lib/constants/crm";

export const activitySchema = z.object({
  type: z.enum(ACTIVITY_TYPES),
  subject: z.string().min(1, "Subject is required"),
  description: z.string().optional(),
  dueDate: z.string().optional(),
  ownerId: z.string().min(1, "Owner is required"),
  relatedType: z.enum(["lead", "contact", "company", "opportunity"]),
  relatedId: z.string().min(1, "Select a related record"),
});

export type ActivityFormValues = z.infer<typeof activitySchema>;
