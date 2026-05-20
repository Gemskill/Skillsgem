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
export type ServiceType = (typeof SERVICE_TYPES)[number];

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
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
  "ASD", "ADHD", "SpLD", "SEMH", "PMLD", "SLD", "MLD", "SLCN", "HI", "VI", "MSI", "PD", "Medical", "Behavioural", "Generic",
] as const;
export type SendNeed = (typeof SEND_NEEDS)[number];

export const SEND_NEED_LABELS: Record<SendNeed, string> = {
  ASD: "Autism (ASD)",
  ADHD: "ADHD",
  SpLD: "Specific learning difficulty",
  SEMH: "Social, emotional & mental health",
  PMLD: "Profound & multiple LD",
  SLD: "Severe LD",
  MLD: "Moderate LD",
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
  "SaLT", "OT", "Physio", "Music_Therapy", "Play_Therapy", "ABA", "Counselling", "EP", "Sensory_Integration",
] as const;
export type Therapy = (typeof THERAPIES)[number];

export const THERAPY_LABELS: Record<Therapy, string> = {
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
  "free", "nhs_funded", "la_funded", "means_tested", "paid", "mixed", "unknown",
] as const;
export type FeeModel = (typeof FEE_MODELS)[number];

export const FEE_MODEL_LABELS: Record<FeeModel, string> = {
  free: "Free",
  nhs_funded: "NHS funded",
  la_funded: "LA funded (EHCP)",
  means_tested: "Means tested",
  paid: "Paid",
  mixed: "Mixed",
  unknown: "Ask provider",
};

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
export type Region = (typeof REGIONS)[number];

export function splitPiped(s: string | null | undefined): string[] {
  if (!s) return [];
  return s.split("|").map((x) => x.trim()).filter(Boolean);
}

export type Service = {
  id: number;
  name: string;
  service_type: ServiceType;
  send_needs: string;
  therapies: string;
  age_min: number;
  age_max: number;
  fee_model: FeeModel;
  region: Region;
  locality: string;
  postcode: string;
  website: string;
  phone: string;
  email: string;
  source_name: string;
  source_url: string;
  description: string;
  is_published: boolean;
};
