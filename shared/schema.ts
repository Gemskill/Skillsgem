import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// =====================
// Reference enums
// =====================

export const REGIONS = [
  "England - North East",
  "England - North West",
  "England - Yorkshire and the Humber",
  "England - East Midlands",
  "England - West Midlands",
  "England - East of England",
  "England - London",
  "England - South East",
  "England - South West",
  "Wales - North Wales",
  "Wales - Mid Wales",
  "Wales - South Wales",
  "Scotland - Highlands",
  "Scotland - Central Lowlands",
  "Scotland - Southern Uplands",
  "Northern Ireland - East",
  "Northern Ireland - West",
  "Isle of Man",
  "Jersey",
  "Guernsey",
] as const;

export const SERVICE_TYPES = [
  "special_school",
  "mainstream_with_resource",
  "independent_specialist",
  "pru_ap",
  "therapy_provider",
  "charity_support",
  "respite_short_breaks",
  "tutor_consultancy",
  "advocacy_legal",
  "assessment_diagnostic",
  "parent_support_group",
  "local_offer",
  "other",
] as const;

export const SERVICE_TYPE_LABELS: Record<(typeof SERVICE_TYPES)[number], string> = {
  special_school: "Special school",
  mainstream_with_resource: "Mainstream with resource base",
  independent_specialist: "Independent specialist",
  pru_ap: "PRU / Alternative provision",
  therapy_provider: "Therapy provider",
  charity_support: "Charity / support organisation",
  respite_short_breaks: "Respite / short breaks",
  tutor_consultancy: "Tutor / consultancy",
  advocacy_legal: "Advocacy / legal",
  assessment_diagnostic: "Assessment / diagnostic",
  parent_support_group: "Parent support group",
  local_offer: "Local Offer (LA)",
  other: "Other",
};

export const SEND_NEEDS = [
  "ASD",
  "ADHD",
  "SpLD",
  "SEMH",
  "PMLD",
  "SLD",
  "MLD",
  "SLCN",
  "HI",
  "VI",
  "MSI",
  "PD",
  "Medical",
  "Behavioural",
  "Generic",
] as const;

export const SEND_NEED_LABELS: Record<(typeof SEND_NEEDS)[number], string> = {
  ASD: "Autism (ASD)",
  ADHD: "ADHD",
  SpLD: "Specific learning difficulty (SpLD)",
  SEMH: "Social, emotional & mental health",
  PMLD: "Profound & multiple learning difficulty",
  SLD: "Severe learning difficulty",
  MLD: "Moderate learning difficulty",
  SLCN: "Speech, language & communication",
  HI: "Hearing impairment",
  VI: "Vision impairment",
  MSI: "Multi-sensory impairment",
  PD: "Physical disability",
  Medical: "Medical needs",
  Behavioural: "Behavioural needs",
  Generic: "All / cross-need",
};

export const THERAPIES = [
  "SaLT",
  "OT",
  "Physio",
  "Music_Therapy",
  "Play_Therapy",
  "ABA",
  "Counselling",
  "EP",
  "Sensory_Integration",
] as const;

export const THERAPY_LABELS: Record<(typeof THERAPIES)[number], string> = {
  SaLT: "Speech & language therapy",
  OT: "Occupational therapy",
  Physio: "Physiotherapy",
  Music_Therapy: "Music therapy",
  Play_Therapy: "Play therapy",
  ABA: "ABA",
  Counselling: "Counselling",
  EP: "Educational psychology",
  Sensory_Integration: "Sensory integration",
};

export const FEE_MODELS = [
  "free",
  "nhs_funded",
  "la_funded",
  "means_tested",
  "paid",
  "mixed",
  "unknown",
] as const;

export const FEE_MODEL_LABELS: Record<(typeof FEE_MODELS)[number], string> = {
  free: "Free",
  nhs_funded: "NHS funded",
  la_funded: "LA funded (EHCP / statemented)",
  means_tested: "Means tested",
  paid: "Paid",
  mixed: "Mixed funding",
  unknown: "Unknown",
};

// =====================
// Tables
// =====================

export const services = sqliteTable("services", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  service_type: text("service_type").notNull(),
  send_needs: text("send_needs").notNull(), // pipe-delimited
  therapies: text("therapies").notNull().default(""), // pipe-delimited
  age_min: integer("age_min").notNull(),
  age_max: integer("age_max").notNull(),
  fee_model: text("fee_model").notNull().default("unknown"),
  region: text("region").notNull(),
  locality: text("locality").notNull().default(""),
  postcode: text("postcode").notNull().default(""),
  website: text("website").notNull().default(""),
  phone: text("phone").notNull().default(""),
  email: text("email").notNull().default(""),
  source_name: text("source_name").notNull().default(""),
  source_url: text("source_url").notNull().default(""),
  description: text("description").notNull().default(""),
  is_published: integer("is_published", { mode: "boolean" }).notNull().default(true),
});

export const submissions = sqliteTable("submissions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  service_type: text("service_type").notNull(),
  send_needs: text("send_needs").notNull(),
  therapies: text("therapies").notNull().default(""),
  age_min: integer("age_min").notNull(),
  age_max: integer("age_max").notNull(),
  fee_model: text("fee_model").notNull().default("unknown"),
  region: text("region").notNull(),
  locality: text("locality").notNull().default(""),
  postcode: text("postcode").notNull().default(""),
  website: text("website").notNull().default(""),
  phone: text("phone").notNull().default(""),
  email: text("email").notNull().default(""),
  description: text("description").notNull().default(""),
  submitter_name: text("submitter_name").notNull().default(""),
  submitter_email: text("submitter_email").notNull().default(""),
  submitter_relation: text("submitter_relation").notNull().default(""),
  status: text("status").notNull().default("pending"), // pending | approved | rejected
  created_at: integer("created_at").notNull(),
});

// =====================
// Zod schemas & types
// =====================

export const insertServiceSchema = createInsertSchema(services).omit({ id: true });
export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;

export const insertSubmissionSchema = createInsertSchema(submissions)
  .omit({ id: true, status: true, created_at: true })
  .extend({
    name: z.string().min(2, "Service name is required"),
    service_type: z.enum(SERVICE_TYPES),
    send_needs: z.string().min(1, "Select at least one need"),
    region: z.enum(REGIONS),
    age_min: z.coerce.number().int().min(0).max(99),
    age_max: z.coerce.number().int().min(0).max(99),
    fee_model: z.enum(FEE_MODELS),
    submitter_email: z.string().email("Valid email required"),
    website: z.string().url("Must be a valid URL").or(z.literal("")),
  });
export type InsertSubmission = z.infer<typeof insertSubmissionSchema>;
export type Submission = typeof submissions.$inferSelect;
