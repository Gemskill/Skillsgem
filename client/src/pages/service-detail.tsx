import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  splitPiped, SERVICE_TYPE_LABELS, SEND_NEED_LABELS, THERAPY_LABELS, FEE_MODEL_LABELS, type Service,
} from "@/lib/taxonomy";
import { ArrowLeft, ExternalLink, Mail, Phone, MapPin, BookOpen } from "lucide-react";

export default function ServiceDetail() {
  const [, params] = useRoute<{ id: string }>("/service/:id");
  const id = Number(params?.id);
  const { data: s, isLoading, error } = useQuery<Service>({
    queryKey: ["/api/services", id],
    enabled: !Number.isNaN(id),
  });

  if (isLoading) return <div className="mx-auto max-w-3xl px-4 md:px-6 py-10">Loading…</div>;
  if (error || !s) return (
    <div className="mx-auto max-w-3xl px-4 md:px-6 py-10">
      <Link href="/directory"><Button variant="ghost" className="gap-2 mb-4" data-testid="button-back"><ArrowLeft className="h-4 w-4" /> Back</Button></Link>
      <div>Service not found.</div>
    </div>
  );

  const needs = splitPiped(s.send_needs);
  const therapies = splitPiped(s.therapies);
  const ageLabel = s.age_min === 0 && s.age_max >= 99 ? "All ages" : `Ages ${s.age_min}–${s.age_max === 99 ? "25+" : s.age_max}`;

  return (
    <div className="mx-auto max-w-3xl px-4 md:px-6 py-6 md:py-10">
      <Link href="/directory"><Button variant="ghost" className="gap-2 mb-4" data-testid="button-back-directory"><ArrowLeft className="h-4 w-4" /> Back to directory</Button></Link>

      <header className="mb-6">
        <div className="text-xs uppercase tracking-wide text-primary font-semibold mb-2">{SERVICE_TYPE_LABELS[s.service_type]}</div>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold leading-tight" data-testid="text-detail-name">{s.name}</h1>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3 text-sm text-muted-foreground">
          <span className="inline-flex items-center gap-1"><MapPin className="h-4 w-4" />{s.locality ? `${s.locality}, ` : ""}{s.region}{s.postcode ? ` · ${s.postcode}` : ""}</span>
          <span>{ageLabel}</span>
          <span>{FEE_MODEL_LABELS[s.fee_model]}</span>
        </div>
      </header>

      {s.description && (
        <section className="prose-sm mb-6">
          <p className="text-foreground/90 leading-relaxed">{s.description}</p>
        </section>
      )}

      <div className="grid gap-4 md:grid-cols-2 mb-6">
        <Card title="SEND needs supported">
          {needs.length ? (
            <div className="flex flex-wrap gap-1.5">
              {needs.map((n) => <Badge key={n} variant="secondary" data-testid={`badge-need-${n}`}>{SEND_NEED_LABELS[n as keyof typeof SEND_NEED_LABELS] ?? n}</Badge>)}
            </div>
          ) : <Empty>Not specified</Empty>}
        </Card>

        <Card title="Therapies & approaches">
          {therapies.length ? (
            <div className="flex flex-wrap gap-1.5">
              {therapies.map((t) => <Badge key={t} variant="outline" data-testid={`badge-therapy-${t}`}>{THERAPY_LABELS[t as keyof typeof THERAPY_LABELS] ?? t}</Badge>)}
            </div>
          ) : <Empty>None listed</Empty>}
        </Card>
      </div>

      <Card title="Contact">
        <div className="grid gap-2 text-sm">
          {s.website && (
            <a href={s.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-primary hover:underline" data-testid="link-website">
              <ExternalLink className="h-4 w-4" /> {s.website.replace(/^https?:\/\//, "")}
            </a>
          )}
          {s.phone && (
            <a href={`tel:${s.phone}`} className="inline-flex items-center gap-2 hover:underline" data-testid="link-phone">
              <Phone className="h-4 w-4 text-muted-foreground" /> {s.phone}
            </a>
          )}
          {s.email && (
            <a href={`mailto:${s.email}`} className="inline-flex items-center gap-2 hover:underline" data-testid="link-email">
              <Mail className="h-4 w-4 text-muted-foreground" /> {s.email}
            </a>
          )}
          {!s.website && !s.phone && !s.email && <Empty>No public contact details listed. Try the source link below.</Empty>}
        </div>
      </Card>

      {s.source_url && (
        <div className="mt-6 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <BookOpen className="h-3 w-3" />
            Source: <a href={s.source_url} target="_blank" rel="noopener noreferrer" className="underline hover:text-foreground" data-testid="link-source">{s.source_name || "view"}</a>
          </span>
        </div>
      )}

      <div className="mt-10 rounded-xl border border-card-border bg-card p-5">
        <div className="font-semibold mb-1">Spotted something wrong?</div>
        <p className="text-sm text-muted-foreground mb-3">
          This directory is built from public data and community submissions. If a detail is out of date, please submit a correction.
        </p>
        <Link href="/submit"><Button variant="outline" data-testid="button-suggest-correction">Submit a correction</Button></Link>
      </div>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-card-border bg-card p-5">
      <div className="text-xs uppercase tracking-wide text-muted-foreground font-semibold mb-3">{title}</div>
      {children}
    </div>
  );
}
function Empty({ children }: { children: React.ReactNode }) {
  return <div className="text-sm text-muted-foreground italic">{children}</div>;
}
