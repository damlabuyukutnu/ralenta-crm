"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leadSchema, type LeadFormValues } from "@/lib/validations/lead";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { TEAM_MEMBERS } from "@/lib/data/team";
import { LEAD_SOURCE_LABELS, LEAD_SOURCES, LEAD_STATUS_CONFIG, LEAD_STATUSES } from "@/lib/constants/crm";

interface LeadFormProps {
  defaultValues?: Partial<LeadFormValues>;
  onSubmit: (values: LeadFormValues) => void;
  onCancel: () => void;
  submitLabel?: string;
}

export function LeadForm({ defaultValues, onSubmit, onCancel, submitLabel = "Create lead" }: LeadFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      companyName: "",
      source: "website",
      status: "new",
      ownerId: TEAM_MEMBERS[0].id,
      notes: "",
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="lead-first-name">First name</Label>
          <Input id="lead-first-name" invalid={!!errors.firstName} {...register("firstName")} />
          {errors.firstName ? <p className="mt-1 text-xs text-rose-600">{errors.firstName.message}</p> : null}
        </div>
        <div>
          <Label htmlFor="lead-last-name">Last name</Label>
          <Input id="lead-last-name" invalid={!!errors.lastName} {...register("lastName")} />
          {errors.lastName ? <p className="mt-1 text-xs text-rose-600">{errors.lastName.message}</p> : null}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="lead-email">Email</Label>
          <Input id="lead-email" type="email" invalid={!!errors.email} {...register("email")} />
          {errors.email ? <p className="mt-1 text-xs text-rose-600">{errors.email.message}</p> : null}
        </div>
        <div>
          <Label htmlFor="lead-phone">Phone</Label>
          <Input id="lead-phone" {...register("phone")} />
        </div>
      </div>

      <div>
        <Label htmlFor="lead-company-name">Company name</Label>
        <Input id="lead-company-name" {...register("companyName")} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="lead-source">Source</Label>
          <Select id="lead-source" {...register("source")}>
            {LEAD_SOURCES.map((source) => (
              <option key={source} value={source}>
                {LEAD_SOURCE_LABELS[source]}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="lead-status">Status</Label>
          <Select id="lead-status" {...register("status")}>
            {LEAD_STATUSES.map((status) => (
              <option key={status} value={status}>
                {LEAD_STATUS_CONFIG[status].label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="lead-owner">Owner</Label>
          <Select id="lead-owner" {...register("ownerId")}>
            {TEAM_MEMBERS.map((member) => (
              <option key={member.id} value={member.id}>
                {member.fullName}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="lead-notes">Notes</Label>
        <Textarea id="lead-notes" {...register("notes")} />
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
