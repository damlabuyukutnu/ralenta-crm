import { z } from "zod";

export const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.union([z.email("Enter a valid email address"), z.literal("")]).optional(),
  phone: z.string().optional(),
  jobTitle: z.string().optional(),
  companyId: z.string().optional(),
  ownerId: z.string().min(1, "Owner is required"),
});

export type ContactFormValues = z.infer<typeof contactSchema>;
