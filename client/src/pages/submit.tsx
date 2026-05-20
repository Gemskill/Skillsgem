import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  REGIONS, SERVICE_TYPES, SERVICE_TYPE_LABELS, SEND_NEEDS, SEND_NEED_LABELS,
  THERAPIES, THERAPY_LABELS, FEE_MODELS, FEE_MODEL_LABELS,
} from "@/lib/taxonomy";
import { CheckCircle2 } from "lucide-react";

const formSchema = z.object({
  name: z.string().min(2, "Service name is required"),
  service_type: z.enum(SERVICE_TYPES),
  send_needs_arr: z.array(z.string()).min(1, "Select at least one need"),
  therapies_arr: z.array(z.string()).default([]),
  age_min: z.coerce.number().int().min(0).max(99),
  age_max: z.coerce.number().int().min(0).max(99),
  fee_model: z.enum(FEE_MODELS),
  region: z.enum(REGIONS),
  locality: z.string().default(""),
  postcode: z.string().default(""),
  website: z.string().url("Must be a valid URL").or(z.literal("")),
  phone: z.string().default(""),
  email: z.string().default(""),
  description: z.string().min(20, "Please describe the service in at least 20 characters"),
  submitter_name: z.string().min(1, "Your name"),
  submitter_email: z.string().email("Valid email"),
  submitter_relation: z.string().default(""),
});
type FormData = z.infer<typeof formSchema>;

export default function Submit() {
  const { toast } = useToast();
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "", service_type: "therapy_provider" as any, send_needs_arr: [], therapies_arr: [],
      age_min: 0, age_max: 18, fee_model: "unknown" as any, region: "England - North East" as any,
      locality: "", postcode: "", website: "", phone: "", email: "", description: "",
      submitter_name: "", submitter_email: "", submitter_relation: "",
    },
  });

  async function onSubmit(values: FormData) {
    const payload = {
      ...values,
      send_needs: values.send_needs_arr.join("|"),
      therapies: values.therapies_arr.join("|"),
    } as any;
    delete payload.send_needs_arr; delete payload.therapies_arr;

    try {
      await apiRequest("POST", "/api/submissions", payload);
      setSubmitted(true);
      toast({ title: "Thanks!", description: "Your submission is in the review queue." });
    } catch (e: any) {
      toast({ title: "Submission failed", description: e?.message || "Please try again", variant: "destructive" });
    }
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl px-4 md:px-6 py-16 text-center">
        <CheckCircle2 className="h-12 w-12 text-primary mx-auto mb-4" />
        <h1 className="font-serif text-3xl font-semibold mb-2">Submission received</h1>
        <p className="text-muted-foreground mb-6">
          Thank you. The Skillsgem team will review and publish approved listings — usually within a week.
        </p>
        <Button onClick={() => { setSubmitted(false); form.reset(); }} variant="outline" data-testid="button-submit-another">
          Submit another
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 md:px-6 py-8 md:py-12">
      <div className="mb-8">
        <h1 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight">Submit a service</h1>
        <p className="text-muted-foreground mt-2">
          Know a SEND school, therapist, charity or parent group that should be listed? Tell us about them. We'll review before publishing.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Section title="About the service">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem><FormLabel>Service name *</FormLabel>
                <FormControl><Input placeholder="e.g. Sunshine Special School" {...field} data-testid="input-name" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="service_type" render={({ field }) => (
                <FormItem><FormLabel>Type *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl><SelectTrigger data-testid="select-submit-service-type"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {SERVICE_TYPES.map((t) => <SelectItem key={t} value={t}>{SERVICE_TYPE_LABELS[t]}</SelectItem>)}
                    </SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="fee_model" render={({ field }) => (
                <FormItem><FormLabel>Fee / funding *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl><SelectTrigger data-testid="select-submit-fee"><SelectValue /></SelectTrigger></FormControl>
                    <SelectContent>
                      {FEE_MODELS.map((f) => <SelectItem key={f} value={f}>{FEE_MODEL_LABELS[f]}</SelectItem>)}
                    </SelectContent>
                  </Select><FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="send_needs_arr" render={() => (
              <FormItem><FormLabel>SEND needs supported *</FormLabel>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {SEND_NEEDS.map((n) => (
                    <FormField key={n} control={form.control} name="send_needs_arr"
                      render={({ field }) => (
                        <label className="flex items-start gap-2 text-sm cursor-pointer rounded-md px-2 py-1.5 hover-elevate" data-testid={`check-submit-need-${n}`}>
                          <Checkbox
                            checked={field.value?.includes(n)}
                            onCheckedChange={(checked) => {
                              const v = field.value || [];
                              field.onChange(checked ? [...v, n] : v.filter((x: string) => x !== n));
                            }}
                          />
                          <span className="leading-tight">{SEND_NEED_LABELS[n]}</span>
                        </label>
                      )} />
                  ))}
                </div><FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="therapies_arr" render={() => (
              <FormItem><FormLabel>Therapies offered (optional)</FormLabel>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {THERAPIES.map((t) => (
                    <FormField key={t} control={form.control} name="therapies_arr"
                      render={({ field }) => (
                        <label className="flex items-start gap-2 text-sm cursor-pointer rounded-md px-2 py-1.5 hover-elevate" data-testid={`check-submit-therapy-${t}`}>
                          <Checkbox
                            checked={field.value?.includes(t)}
                            onCheckedChange={(checked) => {
                              const v = field.value || [];
                              field.onChange(checked ? [...v, t] : v.filter((x: string) => x !== t));
                            }}
                          />
                          <span className="leading-tight">{THERAPY_LABELS[t]}</span>
                        </label>
                      )} />
                  ))}
                </div>
              </FormItem>
            )} />

            <div className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="age_min" render={({ field }) => (
                <FormItem><FormLabel>Youngest age *</FormLabel><FormControl><Input type="number" min={0} max={99} {...field} data-testid="input-age-min" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="age_max" render={({ field }) => (
                <FormItem><FormLabel>Oldest age *</FormLabel><FormControl><Input type="number" min={0} max={99} {...field} data-testid="input-age-max" /></FormControl><FormDescription>Use 99 for adult / all ages</FormDescription><FormMessage /></FormItem>
              )} />
            </div>

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem><FormLabel>Description *</FormLabel>
                <FormControl><Textarea rows={4} placeholder="What do they offer? Who is it for?" {...field} data-testid="textarea-description" /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </Section>

          <Section title="Location & contact">
            <FormField control={form.control} name="region" render={({ field }) => (
              <FormItem><FormLabel>Region *</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl><SelectTrigger data-testid="select-submit-region"><SelectValue /></SelectTrigger></FormControl>
                  <SelectContent>
                    {REGIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select><FormMessage />
              </FormItem>
            )} />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="locality" render={({ field }) => (
                <FormItem><FormLabel>Town / city</FormLabel><FormControl><Input {...field} data-testid="input-locality" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="postcode" render={({ field }) => (
                <FormItem><FormLabel>Postcode</FormLabel><FormControl><Input {...field} data-testid="input-postcode" /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="website" render={({ field }) => (
              <FormItem><FormLabel>Website</FormLabel><FormControl><Input type="url" placeholder="https://" {...field} data-testid="input-website" /></FormControl><FormMessage /></FormItem>
            )} />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="phone" render={({ field }) => (
                <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} data-testid="input-phone" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="email" render={({ field }) => (
                <FormItem><FormLabel>Email</FormLabel><FormControl><Input {...field} data-testid="input-email" /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
          </Section>

          <Section title="About you">
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField control={form.control} name="submitter_name" render={({ field }) => (
                <FormItem><FormLabel>Your name *</FormLabel><FormControl><Input {...field} data-testid="input-submitter-name" /></FormControl><FormMessage /></FormItem>
              )} />
              <FormField control={form.control} name="submitter_email" render={({ field }) => (
                <FormItem><FormLabel>Your email *</FormLabel><FormControl><Input type="email" {...field} data-testid="input-submitter-email" /></FormControl><FormMessage /></FormItem>
              )} />
            </div>
            <FormField control={form.control} name="submitter_relation" render={({ field }) => (
              <FormItem><FormLabel>Relationship to the service</FormLabel>
                <FormControl><Input placeholder="e.g. Parent, staff member, just a fan" {...field} data-testid="input-submitter-relation" /></FormControl>
              </FormItem>
            )} />
          </Section>

          <div className="flex justify-end">
            <Button type="submit" size="lg" disabled={form.formState.isSubmitting} data-testid="button-submit-form">
              {form.formState.isSubmitting ? "Submitting…" : "Submit for review"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-card-border bg-card p-5 md:p-6 space-y-4">
      <div className="font-semibold text-base">{title}</div>
      {children}
    </div>
  );
}
