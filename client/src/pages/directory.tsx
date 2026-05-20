import { useMemo, useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  REGIONS, SERVICE_TYPES, SERVICE_TYPE_LABELS, SEND_NEEDS, SEND_NEED_LABELS,
  THERAPIES, THERAPY_LABELS, FEE_MODELS, FEE_MODEL_LABELS, splitPiped, type Service,
} from "@/lib/taxonomy";
import { Search, SlidersHorizontal, X, MapPin, ExternalLink } from "lucide-react";

const AGE_BANDS = [
  { label: "All ages", min: 0, max: 99 },
  { label: "Early years (0–5)", min: 0, max: 5 },
  { label: "Primary (5–11)", min: 5, max: 11 },
  { label: "Secondary (11–16)", min: 11, max: 16 },
  { label: "Post-16 (16–25)", min: 16, max: 25 },
];

export default function Directory() {
  const { data: services = [], isLoading } = useQuery<Service[]>({ queryKey: ["/api/services"] });

  const [q, setQ] = useState("");
  const [region, setRegion] = useState<string>("all");
  const [serviceType, setServiceType] = useState<string>("all");
  const [feeModel, setFeeModel] = useState<string>("all");
  const [ageBandIdx, setAgeBandIdx] = useState<number>(0);
  const [needs, setNeeds] = useState<Set<string>>(new Set());
  const [therapies, setTherapies] = useState<Set<string>>(new Set());

  const toggle = (set: Set<string>, key: string, setter: (s: Set<string>) => void) => {
    const next = new Set(set);
    if (next.has(key)) next.delete(key); else next.add(key);
    setter(next);
  };

  const filtered = useMemo(() => {
    const ageBand = AGE_BANDS[ageBandIdx];
    const ql = q.trim().toLowerCase();
    return services.filter((s) => {
      if (region !== "all" && s.region !== region) return false;
      if (serviceType !== "all" && s.service_type !== serviceType) return false;
      if (feeModel !== "all" && s.fee_model !== feeModel) return false;
      // Age band overlap test
      if (!(s.age_max >= ageBand.min && s.age_min <= ageBand.max)) return false;
      if (needs.size) {
        const sn = new Set(splitPiped(s.send_needs));
        const needsArr = Array.from(needs);
        if (!needsArr.some((n) => sn.has(n))) return false;
      }
      if (therapies.size) {
        const st = new Set(splitPiped(s.therapies));
        const therapiesArr = Array.from(therapies);
        if (!therapiesArr.some((t) => st.has(t))) return false;
      }
      if (ql) {
        const hay = `${s.name} ${s.locality} ${s.postcode} ${s.description}`.toLowerCase();
        if (!hay.includes(ql)) return false;
      }
      return true;
    });
  }, [services, q, region, serviceType, feeModel, ageBandIdx, needs, therapies]);

  const clearAll = () => {
    setQ(""); setRegion("all"); setServiceType("all"); setFeeModel("all"); setAgeBandIdx(0);
    setNeeds(new Set()); setTherapies(new Set());
  };

  const activeFilterCount =
    (q ? 1 : 0) + (region !== "all" ? 1 : 0) + (serviceType !== "all" ? 1 : 0) +
    (feeModel !== "all" ? 1 : 0) + (ageBandIdx !== 0 ? 1 : 0) + needs.size + therapies.size;

  const FilterPanel = (
    <div className="space-y-6">
      <FilterGroup title="Region">
        <Select value={region} onValueChange={setRegion}>
          <SelectTrigger data-testid="select-region"><SelectValue placeholder="Any region" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any region</SelectItem>
            {REGIONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
          </SelectContent>
        </Select>
      </FilterGroup>

      <FilterGroup title="Service type">
        <Select value={serviceType} onValueChange={setServiceType}>
          <SelectTrigger data-testid="select-service-type"><SelectValue placeholder="Any type" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any type</SelectItem>
            {SERVICE_TYPES.map((t) => <SelectItem key={t} value={t}>{SERVICE_TYPE_LABELS[t]}</SelectItem>)}
          </SelectContent>
        </Select>
      </FilterGroup>

      <FilterGroup title="Age band">
        <Select value={String(ageBandIdx)} onValueChange={(v) => setAgeBandIdx(Number(v))}>
          <SelectTrigger data-testid="select-age-band"><SelectValue /></SelectTrigger>
          <SelectContent>
            {AGE_BANDS.map((a, i) => <SelectItem key={a.label} value={String(i)}>{a.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </FilterGroup>

      <FilterGroup title="Fee / funding">
        <Select value={feeModel} onValueChange={setFeeModel}>
          <SelectTrigger data-testid="select-fee-model"><SelectValue placeholder="Any" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Any funding</SelectItem>
            {FEE_MODELS.map((f) => <SelectItem key={f} value={f}>{FEE_MODEL_LABELS[f]}</SelectItem>)}
          </SelectContent>
        </Select>
      </FilterGroup>

      <FilterGroup title="SEND need">
        <div className="grid grid-cols-1 gap-1.5 max-h-72 overflow-y-auto pr-1">
          {SEND_NEEDS.map((n) => (
            <label key={n} className="flex items-start gap-2 text-sm cursor-pointer rounded-md px-2 py-1.5 hover-elevate" data-testid={`check-need-${n}`}>
              <Checkbox checked={needs.has(n)} onCheckedChange={() => toggle(needs, n, setNeeds)} />
              <span className="leading-tight">{SEND_NEED_LABELS[n]}</span>
            </label>
          ))}
        </div>
      </FilterGroup>

      <FilterGroup title="Therapies offered">
        <div className="grid grid-cols-1 gap-1.5 max-h-56 overflow-y-auto pr-1">
          {THERAPIES.map((t) => (
            <label key={t} className="flex items-start gap-2 text-sm cursor-pointer rounded-md px-2 py-1.5 hover-elevate" data-testid={`check-therapy-${t}`}>
              <Checkbox checked={therapies.has(t)} onCheckedChange={() => toggle(therapies, t, setTherapies)} />
              <span className="leading-tight">{THERAPY_LABELS[t]}</span>
            </label>
          ))}
        </div>
      </FilterGroup>

      <Button variant="outline" className="w-full gap-2" onClick={clearAll} data-testid="button-clear-filters">
        <X className="h-4 w-4" /> Clear filters
      </Button>
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 md:px-6 py-8 md:py-10">
      <div className="mb-6">
        <h1 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight">SEND directory</h1>
        <p className="text-muted-foreground mt-1">Search and filter across {services.length} listed services.</p>
      </div>

      {/* Search + mobile filter trigger */}
      <div className="flex gap-2 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, town or postcode…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="pl-9"
            data-testid="input-search"
          />
        </div>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline" className="md:hidden gap-2" data-testid="button-open-filters">
              <SlidersHorizontal className="h-4 w-4" /> Filters
              {activeFilterCount > 0 && <Badge variant="secondary">{activeFilterCount}</Badge>}
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[88vw] sm:max-w-sm overflow-y-auto">
            <SheetHeader><SheetTitle>Filter services</SheetTitle></SheetHeader>
            <div className="mt-6">{FilterPanel}</div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="grid gap-6 md:grid-cols-[280px_1fr]">
        <aside className="hidden md:block sticky top-20 self-start">
          {FilterPanel}
        </aside>

        <div>
          <div className="text-sm text-muted-foreground mb-3" data-testid="text-results-count">
            {isLoading ? "Loading…" : `${filtered.length} result${filtered.length === 1 ? "" : "s"}`}
          </div>
          {isLoading ? (
            <div className="grid gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="rounded-xl border border-card-border bg-card p-5 animate-pulse h-32" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState onReset={clearAll} />
          ) : (
            <div className="grid gap-3">
              {filtered.map((s) => <ServiceCard key={s.id} s={s} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-2">{title}</div>
      {children}
    </div>
  );
}

function ServiceCard({ s }: { s: Service }) {
  const needs = splitPiped(s.send_needs).slice(0, 4);
  const ageLabel = s.age_min === 0 && s.age_max >= 99 ? "All ages" : `Ages ${s.age_min}–${s.age_max === 99 ? "25+" : s.age_max}`;
  return (
    <Link href={`/service/${s.id}`}>
      <article className="rounded-xl border border-card-border bg-card p-5 hover-elevate cursor-pointer" data-testid={`card-service-${s.id}`}>
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base md:text-lg leading-tight" data-testid={`text-service-name-${s.id}`}>{s.name}</h3>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{s.locality ? `${s.locality} · ` : ""}{s.region}</span>
              <span>{ageLabel}</span>
              <span>{SERVICE_TYPE_LABELS[s.service_type]}</span>
              <span>{FEE_MODEL_LABELS[s.fee_model]}</span>
            </div>
          </div>
        </div>
        {s.description && (
          <p className="mt-3 text-sm text-foreground/80 line-clamp-2">{s.description}</p>
        )}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {needs.map((n) => (
            <Badge key={n} variant="secondary" className="text-[10px]">{SEND_NEED_LABELS[n as keyof typeof SEND_NEED_LABELS] ?? n}</Badge>
          ))}
        </div>
      </article>
    </Link>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-card/40 p-10 text-center">
      <div className="text-4xl mb-2">🔍</div>
      <div className="font-semibold mb-1">No services match those filters yet</div>
      <p className="text-sm text-muted-foreground max-w-sm mx-auto">
        Try clearing some filters, or submit a service you know about so others can find it.
      </p>
      <div className="mt-4 flex justify-center gap-2">
        <Button variant="outline" onClick={onReset} data-testid="button-empty-reset">Clear filters</Button>
        <Link href="/submit"><Button data-testid="button-empty-submit">Submit a service</Button></Link>
      </div>
    </div>
  );
}
