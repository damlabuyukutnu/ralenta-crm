import { z } from "zod";
import { OPPORTUNITY_STAGES } from "@/lib/constants/crm";

export const opportunitySchema = z.object({
  name: z.string().min(1, "Opportunity name is required"),
  companyId: z.string().optional(),
  contactId: z.string().optional(),
  stage: z.enum(OPPORTUNITY_STAGES),
  amount: z
    .string()
    .min(1, "Amount is required")
    .refine((value) => !Number.isNaN(Number(value)) && Number(value) >= 0, "Enter a valid, non-negative amount"),
  probability: z
    .string()
    .optional()
    .refine(
      (value) => !value || (!Number.isNaN(Number(value)) && Number(value) >= 0 && Number(value) <= 100),
      "Enter a value between 0 and 100",
    ),
  expectedCloseDate: z.string().optional(),
  ownerId: z.string().min(1, "Owner is required"),
  notes: z.string().optional(),
});

export type OpportunityFormValues = z.infer<typeof opportunitySchema>;
