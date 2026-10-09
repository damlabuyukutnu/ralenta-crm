"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { opportunitySchema, type OpportunityFormValues } from "@/lib/validations/opportunity";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { TEAM_MEMBERS } from "@/lib/data/team";
import { OPPORTUNITY_STAGE_CONFIG, OPPORTUNITY_STAGES } from "@/lib/constants/crm";
import { useCrmDatabase } from "@/lib/data/store";

interface OpportunityFormProps {
  defaultValues?: Partial<OpportunityFormValues>;
  onSubmit: (values: OpportunityFormValues) => void;
  onCancel: () => void;
  submitLabel?: string;
}

export function OpportunityForm({ defaultValues, onSubmit, onCancel, submitLabel = "Create opportunity" }: OpportunityFormProps) {
  const { companies, contacts } = useCrmDatabase();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<OpportunityFormValues>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      name: "",
      companyId: "",
      contactId: "",
      stage: "new",
      amount: "0",
      probability: "",
      expectedCloseDate: "",
      ownerId: TEAM_MEMBERS[0].id,
      notes: "",
      ...defaultValues,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="opportunity-name">Opportunity name</Label>
        <Input id="opportunity-name" invalid={!!errors.name} {...register("name")} />
        {errors.name ? <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p> : null}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="opportunity-company">Company</Label>
          <Select id="opportunity-company" {...register("companyId")}>
            <option value="">No company</option>
            {companies.map((company) => (
              <option key={company.id} value={company.id}>
                {company.name}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="opportunity-contact">Contact</Label>
          <Select id="opportunity-contact" {...register("contactId")}>
            <option value="">No contact</option>
            {contacts.map((contact) => (
              <option key={contact.id} value={contact.id}>
                {contact.firstName} {contact.lastName}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <Label htmlFor="opportunity-amount">Amount (USD)</Label>
          <Input id="opportunity-amount" type="number" min={0} step={100} invalid={!!errors.amount} {...register("amount")} />
          {errors.amount ? <p className="mt-1 text-xs text-rose-600">{errors.amount.message}</p> : null}
        </div>
        <div>
          <Label htmlFor="opportunity-probability">Probability (%)</Label>
          <Input id="opportunity-probability" type="number" min={0} max={100} {...register("probability")} />
        </div>
        <div>
          <Label htmlFor="opportunity-stage">Stage</Label>
          <Select id="opportunity-stage" {...register("stage")}>
            {OPPORTUNITY_STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {OPPORTUNITY_STAGE_CONFIG[stage].label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="opportunity-close-date">Expected close date</Label>
          <Input id="opportunity-close-date" type="date" {...register("expectedCloseDate")} />
        </div>
        <div>
          <Label htmlFor="opportunity-owner">Owner</Label>
          <Select id="opportunity-owner" {...register("ownerId")}>
            {TEAM_MEMBERS.map((member) => (
              <option key={member.id} value={member.id}>
                {member.fullName}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="opportunity-notes">Notes</Label>
        <Textarea id="opportunity-notes" {...register("notes")} />
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
