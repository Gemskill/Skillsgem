import {
  services,
  submissions,
  type Service,
  type InsertService,
  type Submission,
  type InsertSubmission,
} from "@shared/schema";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { eq, desc, sql } from "drizzle-orm";
import path from "node:path";
import fs from "node:fs";

// Database path is configurable via env var so the app can write to a
// persistent disk in production (e.g. Render's mounted disk at /data).
// Falls back to ./data.db for local development.
const DB_PATH = process.env.DATABASE_PATH || path.resolve(process.cwd(), "data.db");
const DB_DIR = path.dirname(DB_PATH);
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}
// If the target DB doesn't exist yet but a seed file ships with the app,
// copy the seed in on first boot so a fresh deploy comes pre-populated.
const SEED_PATH = path.resolve(process.cwd(), "seed.db");
if (!fs.existsSync(DB_PATH) && fs.existsSync(SEED_PATH)) {
  fs.copyFileSync(SEED_PATH, DB_PATH);
  console.log(`[storage] seeded database from ${SEED_PATH} -> ${DB_PATH}`);
}

const sqlite = new Database(DB_PATH);
sqlite.pragma("journal_mode = WAL");
console.log(`[storage] using database at ${DB_PATH}`);

// Ensure schema exists (lightweight bootstrap; Drizzle migrations not needed for this app)
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    service_type TEXT NOT NULL,
    send_needs TEXT NOT NULL,
    therapies TEXT NOT NULL DEFAULT '',
    age_min INTEGER NOT NULL,
    age_max INTEGER NOT NULL,
    fee_model TEXT NOT NULL DEFAULT 'unknown',
    region TEXT NOT NULL,
    locality TEXT NOT NULL DEFAULT '',
    postcode TEXT NOT NULL DEFAULT '',
    website TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    source_name TEXT NOT NULL DEFAULT '',
    source_url TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    is_published INTEGER NOT NULL DEFAULT 1
  );
  CREATE TABLE IF NOT EXISTS submissions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    service_type TEXT NOT NULL,
    send_needs TEXT NOT NULL,
    therapies TEXT NOT NULL DEFAULT '',
    age_min INTEGER NOT NULL,
    age_max INTEGER NOT NULL,
    fee_model TEXT NOT NULL DEFAULT 'unknown',
    region TEXT NOT NULL,
    locality TEXT NOT NULL DEFAULT '',
    postcode TEXT NOT NULL DEFAULT '',
    website TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    email TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    submitter_name TEXT NOT NULL DEFAULT '',
    submitter_email TEXT NOT NULL DEFAULT '',
    submitter_relation TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT 'pending',
    created_at INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS services_region_idx ON services(region);
  CREATE INDEX IF NOT EXISTS services_service_type_idx ON services(service_type);
`);

export const db = drizzle(sqlite);

export interface IStorage {
  listServices(): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(s: InsertService): Promise<Service>;
  bulkInsertServices(rows: InsertService[]): Promise<number>;
  deleteAllServices(): Promise<number>;
  listSubmissions(status?: string): Promise<Submission[]>;
  createSubmission(s: Omit<InsertSubmission, never>): Promise<Submission>;
  updateSubmissionStatus(id: number, status: string): Promise<void>;
  stats(): Promise<{ total: number; regions: number }>;
}

export class DatabaseStorage implements IStorage {
  async listServices(): Promise<Service[]> {
    return db.select().from(services).where(eq(services.is_published, true)).all();
  }
  async getService(id: number): Promise<Service | undefined> {
    return db.select().from(services).where(eq(services.id, id)).get();
  }
  async createService(s: InsertService): Promise<Service> {
    return db.insert(services).values(s).returning().get();
  }
  async bulkInsertServices(rows: InsertService[]): Promise<number> {
    if (!rows.length) return 0;
    // Chunk to stay under SQLite parameter limits
    const CHUNK = 200;
    let inserted = 0;
    for (let i = 0; i < rows.length; i += CHUNK) {
      const batch = rows.slice(i, i + CHUNK);
      const res = db.insert(services).values(batch).run();
      inserted += res.changes ?? batch.length;
    }
    return inserted;
  }
  async deleteAllServices(): Promise<number> {
    const res = db.delete(services).run();
    return res.changes ?? 0;
  }
  async listSubmissions(status?: string): Promise<Submission[]> {
    if (status) {
      return db.select().from(submissions).where(eq(submissions.status, status)).orderBy(desc(submissions.created_at)).all();
    }
    return db.select().from(submissions).orderBy(desc(submissions.created_at)).all();
  }
  async createSubmission(s: InsertSubmission): Promise<Submission> {
    return db
      .insert(submissions)
      .values({ ...s, status: "pending", created_at: Date.now() })
      .returning()
      .get();
  }
  async updateSubmissionStatus(id: number, status: string): Promise<void> {
    db.update(submissions).set({ status }).where(eq(submissions.id, id)).run();
  }
  async stats() {
    const totalRow = db.select({ c: sql<number>`COUNT(*)` }).from(services).where(eq(services.is_published, true)).get();
    const regionRow = db.select({ c: sql<number>`COUNT(DISTINCT region)` }).from(services).where(eq(services.is_published, true)).get();
    return { total: totalRow?.c ?? 0, regions: regionRow?.c ?? 0 };
  }
}

export const storage = new DatabaseStorage();
