import type { Express, Request, Response, NextFunction } from "express";
import express from "express";
import { createServer } from "node:http";
import type { Server } from "node:http";
import { storage } from "./storage";
import {
  insertServiceSchema,
  insertSubmissionSchema,
  REGIONS,
  SERVICE_TYPES,
  SEND_NEEDS,
  THERAPIES,
  FEE_MODELS,
} from "@shared/schema";
import { z } from "zod";

// Lightweight admin token check. The ADMIN_TOKEN env var protects mutating admin endpoints.
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || "skillsgem-admin-2026";

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const header = req.header("x-admin-token") || (req.query.token as string | undefined);
  if (header !== ADMIN_TOKEN) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
}

// CSV parser tolerant of quoted fields containing commas and escaped quotes ("")
function parseCsv(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ",") {
        cur.push(field);
        field = "";
      } else if (ch === "\n") {
        cur.push(field);
        rows.push(cur);
        cur = [];
        field = "";
      } else if (ch === "\r") {
        // ignore
      } else {
        field += ch;
      }
    }
  }
  if (field.length > 0 || cur.length > 0) {
    cur.push(field);
    rows.push(cur);
  }
  if (!rows.length) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).filter((r) => r.some((c) => c.trim() !== "")).map((r) => {
    const obj: Record<string, string> = {};
    headers.forEach((h, idx) => (obj[h] = (r[idx] ?? "").trim()));
    return obj;
  });
}

export async function registerRoutes(
  httpServer: Server,
  app: Express,
): Promise<Server> {
  // Reference taxonomy — drives filter UI
  app.get("/api/taxonomy", (_req, res) => {
    res.json({ regions: REGIONS, service_types: SERVICE_TYPES, send_needs: SEND_NEEDS, therapies: THERAPIES, fee_models: FEE_MODELS });
  });

  app.get("/api/stats", async (_req, res) => {
    res.json(await storage.stats());
  });

  app.get("/api/services", async (_req, res) => {
    const list = await storage.listServices();
    res.json(list);
  });

  app.get("/api/services/:id", async (req, res) => {
    const id = Number(req.params.id);
    const svc = await storage.getService(id);
    if (!svc) return res.status(404).json({ error: "Not found" });
    res.json(svc);
  });

  app.post("/api/submissions", async (req, res) => {
    const parsed = insertSubmissionSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: "Validation failed", details: parsed.error.flatten() });
    }
    const sub = await storage.createSubmission(parsed.data);
    res.json({ ok: true, id: sub.id });
  });

  // ---------- Admin endpoints ----------
  app.get("/api/admin/submissions", requireAdmin, async (req, res) => {
    const status = (req.query.status as string | undefined) || undefined;
    res.json(await storage.listSubmissions(status));
  });

  app.post("/api/admin/submissions/:id/status", requireAdmin, async (req, res) => {
    const id = Number(req.params.id);
    const status = String(req.body?.status || "");
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }
    await storage.updateSubmissionStatus(id, status);
    res.json({ ok: true });
  });

  // CSV import — accepts raw CSV body, parses, validates, bulk inserts.
  app.post(
    "/api/admin/import",
    requireAdmin,
    express.text({ type: "*/*", limit: "20mb" }),
    async (req, res) => {
      const replace = req.query.replace === "1";
      const csv = req.body as string;
      if (!csv || typeof csv !== "string") {
        return res.status(400).json({ error: "CSV body required" });
      }
      const records = parseCsv(csv);
      const errors: { row: number; error: string }[] = [];
      const valid: any[] = [];
      records.forEach((r, idx) => {
        try {
          const obj = {
            name: r.name ?? "",
            service_type: r.service_type ?? "",
            send_needs: r.send_needs ?? "",
            therapies: r.therapies ?? "",
            age_min: Number(r.age_min ?? 0),
            age_max: Number(r.age_max ?? 99),
            fee_model: r.fee_model ?? "unknown",
            region: r.region ?? "",
            locality: r.locality ?? "",
            postcode: r.postcode ?? "",
            website: r.website ?? "",
            phone: r.phone ?? "",
            email: r.email ?? "",
            source_name: r.source_name ?? "",
            source_url: r.source_url ?? "",
            description: r.description ?? "",
            is_published: true,
          };
          const parsed = insertServiceSchema.safeParse(obj);
          if (!parsed.success) {
            errors.push({ row: idx + 2, error: parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ") });
          } else {
            valid.push(parsed.data);
          }
        } catch (e: any) {
          errors.push({ row: idx + 2, error: e?.message || "parse error" });
        }
      });

      let deleted = 0;
      if (replace) deleted = await storage.deleteAllServices();
      const inserted = await storage.bulkInsertServices(valid);
      res.json({ inserted, deleted, errors_count: errors.length, errors: errors.slice(0, 50) });
    },
  );

  return httpServer;
}
