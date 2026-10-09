"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { companySchema, type CompanyFormValues } from "@/lib/validations/company";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TEAM_MEMBERS } from "@/lib/data/team";

interface CompanyFormProps {
  defaultValues?: Partial<CompanyFormValues>;
  onSubmit: (values: CompanyFormValues) => void;
  onCancel: () => void;
  submitLabel?: string;
}

export function CompanyForm({ defaultValues, onSubmit, onCancel, submitLabel = "Create company" }: CompanyFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      name: "",
      industry: "",
      website: "",
      phone: "",
      address: "",
      ownerId: TEAM_MEMBERS[0].id,
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="company-name">Company name</Label>
        <Input id="company-name" invalid={!!errors.name} {...register("name")} />
        {errors.name ? <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p> : null}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="company-industry">Industry</Label>
          <Input id="company-industry" {...register("industry")} />
        </div>
        <div>
          <Label htmlFor="company-owner">Owner</Label>
          <Select id="company-owner" {...register("ownerId")}>
            {TEAM_MEMBERS.map((member) => (
              <option key={member.id} value={member.id}>
                {member.fullName}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="company-website">Website</Label>
        <Input id="company-website" placeholder="https://" {...register("website")} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="company-phone">Phone</Label>
          <Input id="company-phone" {...register("phone")} />
        </div>
        <div>
          <Label htmlFor="company-address">Address</Label>
          <Input id="company-address" {...register("address")} />
        </div>
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
