import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { AuditEntry, IndustryTemplate } from "@/lib/types";
import { industries as seedIndustries } from "@/data/industries";

const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), "data");

let db: Database.Database | null = null;

function getDb(): Database.Database {
  if (db) return db;
  fs.mkdirSync(DATA_DIR, { recursive: true });
  db = new Database(path.join(DATA_DIR, "indusbrain.db"));
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS industries (
      id TEXT PRIMARY KEY,
      data TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS credits (
      code TEXT PRIMARY KEY,
      credits INTEGER NOT NULL,
      note TEXT NOT NULL DEFAULT '',
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS audit_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request TEXT NOT NULL,
      industry TEXT NOT NULL,
      source TEXT NOT NULL,
      ip TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
  const count = (db.prepare("SELECT COUNT(*) AS c FROM industries").get() as { c: number }).c;
  if (count === 0) {
    const insert = db.prepare("INSERT INTO industries (id, data) VALUES (?, ?)");
    const tx = db.transaction((items: IndustryTemplate[]) => {
      for (const item of items) insert.run(item.id, JSON.stringify(item));
    });
    tx(seedIndustries);
  }
  return db;
}

export function listIndustries(): IndustryTemplate[] {
  const rows = getDb().prepare("SELECT data FROM industries ORDER BY id").all() as {
    data: string;
  }[];
  return rows.map((r) => JSON.parse(r.data) as IndustryTemplate);
}

export function getIndustry(id: string): IndustryTemplate | null {
  const row = getDb().prepare("SELECT data FROM industries WHERE id = ?").get(id) as
    | { data: string }
    | undefined;
  return row ? (JSON.parse(row.data) as IndustryTemplate) : null;
}

export function upsertIndustry(template: IndustryTemplate): void {
  getDb()
    .prepare(
      `INSERT INTO industries (id, data, updated_at) VALUES (?, ?, datetime('now'))
       ON CONFLICT(id) DO UPDATE SET data = excluded.data, updated_at = datetime('now')`
    )
    .run(template.id, JSON.stringify(template));
}

export function deleteIndustry(id: string): boolean {
  return getDb().prepare("DELETE FROM industries WHERE id = ?").run(id).changes > 0;
}

export function findIndustryInDb(request: string): IndustryTemplate | null {
  const text = request.toLowerCase();
  let best: { template: IndustryTemplate; score: number } | null = null;
  for (const template of listIndustries()) {
    const score = template.keywords.filter((k) => text.includes(k.toLowerCase())).length;
    if (score > 0 && (!best || score > best.score)) {
      best = { template, score };
    }
  }
  return best ? best.template : null;
}

export function issueCredits(code: string, credits: number, note = ""): void {
  getDb()
    .prepare(
      `INSERT INTO credits (code, credits, note, updated_at) VALUES (?, ?, ?, datetime('now'))
       ON CONFLICT(code) DO UPDATE SET credits = credits.credits + excluded.credits, note = excluded.note, updated_at = datetime('now')`
    )
    .run(code, credits, note);
}

export function getCredits(code: string): number {
  const row = getDb().prepare("SELECT credits FROM credits WHERE code = ?").get(code) as
    | { credits: number }
    | undefined;
  return row?.credits ?? 0;
}

export function consumeCredit(code: string): boolean {
  return (
    getDb()
      .prepare(
        "UPDATE credits SET credits = credits - 1, updated_at = datetime('now') WHERE code = ? AND credits > 0"
      )
      .run(code).changes > 0
  );
}

export function listCredits(): { code: string; credits: number; note: string }[] {
  return getDb()
    .prepare("SELECT code, credits, note FROM credits ORDER BY updated_at DESC")
    .all() as { code: string; credits: number; note: string }[];
}

export function logBlueprintRequest(entry: {
  request: string;
  industry: string;
  source: string;
  ip: string;
}): void {
  getDb()
    .prepare("INSERT INTO audit_log (request, industry, source, ip) VALUES (?, ?, ?, ?)")
    .run(entry.request, entry.industry, entry.source, entry.ip);
}

export function listAuditLog(limit = 200): AuditEntry[] {
  const rows = getDb()
    .prepare(
      "SELECT id, request, industry, source, ip, created_at FROM audit_log ORDER BY id DESC LIMIT ?"
    )
    .all(limit) as {
    id: number;
    request: string;
    industry: string;
    source: string;
    ip: string;
    created_at: string;
  }[];
  return rows.map((r) => ({
    id: r.id,
    request: r.request,
    industry: r.industry,
    source: r.source,
    ip: r.ip,
    createdAt: r.created_at,
  }));
}
