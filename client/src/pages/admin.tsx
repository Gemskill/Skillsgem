import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function Admin() {
  const { toast } = useToast();
  const [token, setToken] = useState("");
  const [tokenSubmitted, setTokenSubmitted] = useState(false);
  const [csv, setCsv] = useState("");
  const [replace, setReplace] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);

  const { data: submissions = [], refetch } = useQuery<any[]>({
    queryKey: ["/api/admin/submissions"],
    enabled: tokenSubmitted,
    queryFn: async () => {
      const res = await fetch(`/api/admin/submissions`, { headers: { "x-admin-token": token } });
      if (!res.ok) throw new Error("Unauthorized");
      return res.json();
    },
  });

  async function setStatus(id: number, status: string) {
    const res = await fetch(`/api/admin/submissions/${id}/status`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-token": token },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      toast({ title: `Marked ${status}` });
      refetch();
    } else {
      toast({ title: "Failed", variant: "destructive" });
    }
  }

  async function doImport() {
    setImporting(true); setImportResult(null);
    try {
      const res = await fetch(`/api/admin/import?replace=${replace ? 1 : 0}`, {
        method: "POST",
        headers: { "Content-Type": "text/csv", "x-admin-token": token },
        body: csv,
      });
      const data = await res.json();
      setImportResult(data);
      if (res.ok) toast({ title: `Imported ${data.inserted} rows`, description: data.errors_count ? `${data.errors_count} rows had errors` : "All rows valid" });
      else toast({ title: "Import failed", variant: "destructive" });
      queryClient.invalidateQueries({ queryKey: ["/api/services"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats"] });
    } finally {
      setImporting(false);
    }
  }

  if (!tokenSubmitted) {
    return (
      <div className="mx-auto max-w-md px-4 py-16">
        <h1 className="font-serif text-3xl font-semibold mb-4">Admin</h1>
        <p className="text-sm text-muted-foreground mb-4">Enter admin token to continue.</p>
        <Input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Admin token" data-testid="input-admin-token" />
        <Button className="mt-3" onClick={() => setTokenSubmitted(true)} disabled={!token} data-testid="button-admin-login">Continue</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 md:px-6 py-8 md:py-10">
      <h1 className="font-serif text-3xl md:text-4xl font-semibold mb-6">Admin</h1>

      <section className="rounded-xl border border-card-border bg-card p-5 md:p-6 mb-8">
        <h2 className="font-semibold text-lg mb-2">CSV bulk import</h2>
        <p className="text-sm text-muted-foreground mb-3">
          Paste CSV matching the seed schema (name, service_type, send_needs, therapies, age_min, age_max, fee_model, region, locality, postcode, website, phone, email, source_name, source_url, description). Pipe-separate send_needs and therapies.
        </p>
        <Textarea rows={8} value={csv} onChange={(e) => setCsv(e.target.value)} placeholder="name,service_type,send_needs,…" className="font-mono text-xs" data-testid="textarea-csv" />
        <div className="mt-3 flex items-center gap-3">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={replace} onChange={(e) => setReplace(e.target.checked)} data-testid="check-replace" />
            Replace all existing services
          </label>
          <Button onClick={doImport} disabled={!csv || importing} data-testid="button-import">{importing ? "Importing…" : "Import"}</Button>
        </div>
        {importResult && (
          <div className="mt-4 text-sm">
            <div>Inserted: <strong>{importResult.inserted}</strong></div>
            {importResult.deleted ? <div>Deleted: <strong>{importResult.deleted}</strong></div> : null}
            <div>Errors: <strong>{importResult.errors_count}</strong></div>
            {importResult.errors?.length ? (
              <details className="mt-2"><summary className="cursor-pointer">Show first errors</summary>
                <ul className="mt-2 text-xs text-destructive">
                  {importResult.errors.map((e: any, i: number) => <li key={i}>Row {e.row}: {e.error}</li>)}
                </ul>
              </details>
            ) : null}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-card-border bg-card p-5 md:p-6">
        <h2 className="font-semibold text-lg mb-3">Submission queue ({submissions.length})</h2>
        {!submissions.length ? (
          <div className="text-sm text-muted-foreground">No submissions yet.</div>
        ) : (
          <ul className="divide-y divide-border">
            {submissions.map((s: any) => (
              <li key={s.id} className="py-3 text-sm" data-testid={`sub-${s.id}`}>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <div className="font-semibold">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.region} · {s.service_type} · from {s.submitter_name || "anon"} ({s.submitter_email})</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={s.status === "pending" ? "secondary" : s.status === "approved" ? "default" : "outline"}>{s.status}</Badge>
                    <Button size="sm" variant="outline" onClick={() => setStatus(s.id, "approved")} data-testid={`button-approve-${s.id}`}>Approve</Button>
                    <Button size="sm" variant="outline" onClick={() => setStatus(s.id, "rejected")} data-testid={`button-reject-${s.id}`}>Reject</Button>
                  </div>
                </div>
                <p className="mt-2 text-muted-foreground">{s.description}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
