import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/logo";
import { Search, MapPin, Users, FileText, Heart } from "lucide-react";

export default function Home() {
  const { data: stats } = useQuery<{ total: number; regions: number }>({ queryKey: ["/api/stats"] });
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-accent/40 via-background to-background" />
        <div className="mx-auto max-w-6xl px-4 md:px-6 pt-12 md:pt-20 pb-14 md:pb-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/60 px-3 py-1 text-xs font-medium text-muted-foreground mb-6" data-testid="badge-hero-tag">
              <Heart className="h-3 w-3 text-primary" />
              Built for families navigating SEND
            </div>
            <h1 className="font-serif text-4xl md:text-6xl font-semibold tracking-tight leading-[1.05]" data-testid="text-hero-title">
              Find the right SEND support, wherever you are.
            </h1>
            <p className="mt-5 text-base md:text-lg text-muted-foreground max-w-2xl" data-testid="text-hero-subtitle">
              A growing directory of special schools, therapists, charities and parent-led groups across the UK, Northern Ireland and the Crown Dependencies. Filter by age, need, region and how it's funded.
            </p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Link href="/directory">
                <Button size="lg" className="gap-2" data-testid="button-browse-directory">
                  <Search className="h-4 w-4" /> Browse the directory
                </Button>
              </Link>
              <Link href="/submit">
                <Button size="lg" variant="outline" data-testid="button-submit-cta">
                  Submit a service
                </Button>
              </Link>
            </div>
            {stats ? (
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
                <span data-testid="text-stat-services"><strong className="text-foreground">{stats.total}</strong> services listed</span>
                <span data-testid="text-stat-regions"><strong className="text-foreground">{stats.regions}</strong> of 20 regions covered</span>
              </div>
            ) : null}
          </div>
          <div className="hidden md:block absolute -right-10 top-10 opacity-40">
            <Logo className="h-64 w-64 text-primary/40" />
          </div>
        </div>
      </section>

      {/* What you can find */}
      <section className="mx-auto max-w-6xl px-4 md:px-6 py-12 md:py-16">
        <h2 className="font-serif text-2xl md:text-3xl font-semibold mb-8">What you can find</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { icon: Users, title: "Schools & alternative provision", body: "Maintained and independent special schools, resource bases, PRUs and AP across all 20 regions." },
            { icon: Heart, title: "Therapies & assessment", body: "Speech & language, OT, EP, sensory integration and diagnostic services — NHS, LA-funded and private." },
            { icon: FileText, title: "Charities & advocacy", body: "National and regional support groups, SENDIASS, legal advocacy and parent-led networks." },
          ].map((c) => (
            <div key={c.title} className="rounded-xl border border-card-border bg-card p-6 hover-elevate" data-testid={`card-feature-${c.title.toLowerCase().split(" ")[0]}`}>
              <c.icon className="h-6 w-6 text-primary mb-3" />
              <div className="font-semibold mb-1">{c.title}</div>
              <p className="text-sm text-muted-foreground">{c.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Filters preview */}
      <section className="mx-auto max-w-6xl px-4 md:px-6 pb-16">
        <div className="rounded-2xl bg-sidebar border border-sidebar-border p-6 md:p-10">
          <div className="grid gap-8 md:grid-cols-2 items-center">
            <div>
              <h2 className="font-serif text-2xl md:text-3xl font-semibold mb-3">Filter by what actually matters to you.</h2>
              <p className="text-muted-foreground">
                Refine by region, age band, type of need, service type, therapies offered, and how it's funded. Tap a service to see contact details and the public source we found it from.
              </p>
              <Link href="/directory">
                <Button className="mt-5 gap-2" data-testid="button-try-filters">
                  <MapPin className="h-4 w-4" /> Try the filters
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {["Region", "Age band", "Need (ASD, ADHD, SLCN…)", "Service type", "Therapies", "Free or paid"].map((f) => (
                <div key={f} className="rounded-md border border-border bg-card px-3 py-2">{f}</div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
