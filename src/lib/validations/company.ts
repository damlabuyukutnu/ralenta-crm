import { z } from "zod";

export const companySchema = z.object({
  name: z.string().min(1, "Company name is required"),
  industry: z.string().optional(),
  website: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  ownerId: z.string().min(1, "Owner is required"),
});

export type CompanyFormValues = z.infer<typeof companySchema>;
