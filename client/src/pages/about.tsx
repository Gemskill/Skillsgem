import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function About() {
  return (
    <div className="mx-auto max-w-3xl px-4 md:px-6 py-10 md:py-14">
      <h1 className="font-serif text-3xl md:text-4xl font-semibold tracking-tight mb-3">About Skillsgem</h1>
      <p className="text-lg text-muted-foreground mb-8">
        Skillsgem is a community-built directory of services for children, young people and families navigating Special Educational Needs and Disabilities across the UK, Northern Ireland and the Crown Dependencies.
      </p>

      <h2 className="font-serif text-2xl font-semibold mt-10 mb-3">What's listed</h2>
      <ul className="list-disc pl-5 space-y-1 text-foreground/90">
        <li>Special schools, mainstream schools with resource bases, PRUs and alternative provision</li>
        <li>Independent specialist schools and colleges</li>
        <li>Therapy providers — speech & language, OT, EP, sensory integration and more</li>
        <li>Charities, parent-led groups, SENDIASS-equivalent advice services</li>
        <li>Respite, short breaks, tutors, advocacy and legal support</li>
      </ul>

      <h2 className="font-serif text-2xl font-semibold mt-10 mb-3">Where the first-pass data came from</h2>
      <p className="text-foreground/90">First-pass listings were assembled from public sources, including:</p>
      <ul className="list-disc pl-5 space-y-1 mt-2 text-foreground/90">
        <li><a className="underline" href="https://reports.ofsted.gov.uk/" target="_blank" rel="noopener noreferrer">Ofsted</a> inspection reports (England)</li>
        <li><a className="underline" href="https://www.cqc.org.uk/" target="_blank" rel="noopener noreferrer">Care Quality Commission</a> registered providers</li>
        <li><a className="underline" href="https://www.estyn.gov.wales/" target="_blank" rel="noopener noreferrer">Estyn</a> (Wales), <a className="underline" href="https://education.gov.scot/" target="_blank" rel="noopener noreferrer">Education Scotland</a>, <a className="underline" href="https://www.etini.gov.uk/" target="_blank" rel="noopener noreferrer">ETI</a> (NI)</li>
        <li>Local Authority Local Offer pages</li>
        <li>National SEND charities (NAS, IPSEA, Contact, Mencap, Scope, Sense, Cerebra, SENDIASS, SNAP Cymru, Enquire, Autism NI and others)</li>
      </ul>
      <p className="text-foreground/90 mt-3">
        Every listing links back to the source it came from. Always verify details with the provider before relying on a service for your child.
      </p>

      <h2 className="font-serif text-2xl font-semibold mt-10 mb-3">Help us grow it</h2>
      <p className="text-foreground/90">
        If you spot a service that should be here, or a detail that needs updating, please submit it — every submission is reviewed before going live.
      </p>
      <div className="mt-5">
        <Link href="/submit"><Button data-testid="button-about-submit">Submit a service</Button></Link>
      </div>

      <h2 className="font-serif text-2xl font-semibold mt-10 mb-3">A note on terminology</h2>
      <p className="text-foreground/90">
        Different parts of the UK use different terms: SEND in England, ALN in Wales, ASN in Scotland, SEN in Northern Ireland. For findability, we use SEND throughout the site — but listings honour the framework local to each provider.
      </p>
    </div>
  );
}
