"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactFormValues } from "@/lib/validations/contact";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TEAM_MEMBERS } from "@/lib/data/team";
import { useCrmDatabase } from "@/lib/data/store";

interface ContactFormProps {
  defaultValues?: Partial<ContactFormValues>;
  onSubmit: (values: ContactFormValues) => void;
  onCancel: () => void;
  submitLabel?: string;
}

export function ContactForm({ defaultValues, onSubmit, onCancel, submitLabel = "Create contact" }: ContactFormProps) {
  const { companies } = useCrmDatabase();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      jobTitle: "",
      companyId: "",
      ownerId: TEAM_MEMBERS[0].id,
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="contact-first-name">First name</Label>
          <Input id="contact-first-name" invalid={!!errors.firstName} {...register("firstName")} />
          {errors.firstName ? <p className="mt-1 text-xs text-rose-600">{errors.firstName.message}</p> : null}
        </div>
        <div>
          <Label htmlFor="contact-last-name">Last name</Label>
          <Input id="contact-last-name" invalid={!!errors.lastName} {...register("lastName")} />
          {errors.lastName ? <p className="mt-1 text-xs text-rose-600">{errors.lastName.message}</p> : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="contact-email">Email</Label>
          <Input id="contact-email" type="email" invalid={!!errors.email} {...register("email")} />
          {errors.email ? <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p> : null}
        </div>
        <div>
          <Label htmlFor="contact-phone">Phone</Label>
          <Input id="contact-phone" {...register("phone")} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="contact-job-title">Job title</Label>
          <Input id="contact-job-title" {...register("jobTitle")} />
        </div>
        <div>
          <Label htmlFor="contact-company">Company</Label>
          <Select id="contact-company" {...register("companyId")}>
            <option value="">No company</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="contact-owner">Owner</Label>
        <Select id="contact-owner" {...register("ownerId")}>
          {TEAM_MEMBERS.map((member) => (
            <option key={member.id} value={member.id}>
              {member.fullName}
            </option>
          ))}
        </Select>
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">{submitLabel}</Button>
      </div>
    </form>
  );
}
