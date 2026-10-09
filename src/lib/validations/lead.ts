import { z } from "zod";
import { LEAD_SOURCES, LEAD_STATUSES } from "@/lib/constants/crm";

export const leadSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.union([z.email("Enter a valid email address"), z.literal("")]).optional(),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  source: z.enum(LEAD_SOURCES),
  status: z.enum(LEAD_STATUSES),
  ownerId: z.string().min(1, "Owner is required"),
  notes: z.string().optional(),
});

export type LeadFormValues = z.infer<typeof leadSchema>;
