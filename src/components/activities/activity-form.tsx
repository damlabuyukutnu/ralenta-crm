"use client";

import { useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { activitySchema, type ActivityFormValues } from "@/lib/validations/activity";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { TEAM_MEMBERS } from "@/lib/data/team";
import { ACTIVITY_TYPE_CONFIG, ACTIVITY_TYPES } from "@/lib/constants/crm";
import { useCrmDatabase } from "@/lib/data/store";

interface ActivityFormProps {
  defaultValues?: Partial<ActivityFormValues>;
  onSubmit: (values: ActivityFormValues) => void;
  onCancel: () => void;
  submitLabel?: string;
}

export function ActivityForm({ defaultValues, onSubmit, onCancel, submitLabel = "Create activity" }: ActivityFormProps) {
  const { leads, contacts, companies, opportunities } = useCrmDatabase();
  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ActivityFormValues>({
    resolver: zodResolver(activitySchema),
    defaultValues: {
      type: "task",
      subject: "",
      description: "",
      dueDate: "",
      ownerId: TEAM_MEMBERS[0].id,
      relatedType: "lead",
      relatedId: "",
      ...defaultValues,
    },
  });

  const relatedType = useWatch({ control, name: "relatedType" });
  const previousRelatedType = useRef(relatedType);

  useEffect(() => {
    if (previousRelatedType.current !== relatedType) {
      setValue("relatedId", "");
      previousRelatedType.current = relatedType;
    }
  }, [relatedType, setValue]);

  const relatedOptions =
    relatedType === "lead"
      ? leads.map((lead) => ({ id: lead.id, label: `${lead.firstName} ${lead.lastName}` }))
      : relatedType === "contact"
        ? contacts.map((contact) => ({ id: contact.id, label: `${contact.firstName} ${contact.lastName}` }))
        : relatedType === "company"
          ? companies.map((company) => ({ id: company.id, label: company.name }))
          : opportunities.map((opportunity) => ({ id: opportunity.id, label: opportunity.name }));

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
      <div>
        <Label htmlFor="activity-subject">Subject</Label>
        <Input id="activity-subject" invalid={!!errors.subject} {...register("subject")} />
        {errors.subject ? <p className="mt-1 text-xs text-rose-600">{errors.subject.message}</p> : null}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="activity-type">Type</Label>
          <Select id="activity-type" {...register("type")}>
            {ACTIVITY_TYPES.map((type) => (
              <option key={type} value={type}>
                {ACTIVITY_TYPE_CONFIG[type].label}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="activity-due-date">Due date</Label>
          <Input id="activity-due-date" type="date" {...register("dueDate")} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="activity-related-type">Related to</Label>
          <Select id="activity-related-type" {...register("relatedType")}>
            <option value="lead">Lead</option>
            <option value="contact">Contact</option>
            <option value="company">Company</option>
            <option value="opportunity">Opportunity</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="activity-related-id">Record</Label>
          <Select id="activity-related-id" invalid={!!errors.relatedId} {...register("relatedId")}>
            <option value="">Select a record</option>
            {relatedOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </Select>
          {errors.relatedId ? <p className="mt-1 text-xs text-rose-600">{errors.relatedId.message}</p> : null}
        </div>
      </div>

      <div>
        <Label htmlFor="activity-owner">Owner</Label>
        <Select id="activity-owner" {...register("ownerId")}>
          {TEAM_MEMBERS.map((member) => (
            <option key={member.id} value={member.id}>
              {member.fullName}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="activity-description">Description</Label>
        <Textarea id="activity-description" {...register("description")} />
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
