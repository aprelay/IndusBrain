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
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'client',
      credits INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS sessions (
      token TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      expires_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS quote_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      company TEXT NOT NULL DEFAULT '',
      request TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
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

export interface User {
  id: number;
  email: string;
  role: string;
  credits: number;
}

export function createUser(email: string, passwordHash: string): User | null {
  try {
    const info = getDb()
      .prepare("INSERT INTO users (email, password_hash) VALUES (?, ?)")
      .run(email.toLowerCase(), passwordHash);
    return { id: Number(info.lastInsertRowid), email: email.toLowerCase(), role: "client", credits: 0 };
  } catch {
    return null;
  }
}

export function getUserByEmail(
  email: string
): (User & { passwordHash: string }) | null {
  const row = getDb()
    .prepare("SELECT id, email, password_hash, role, credits FROM users WHERE email = ?")
    .get(email.toLowerCase()) as
    | { id: number; email: string; password_hash: string; role: string; credits: number }
    | undefined;
  return row
    ? { id: row.id, email: row.email, passwordHash: row.password_hash, role: row.role, credits: row.credits }
    : null;
}

export function createSession(userId: number, token: string, expiresAt: string): void {
  getDb()
    .prepare("INSERT INTO sessions (token, user_id, expires_at) VALUES (?, ?, ?)")
    .run(token, userId, expiresAt);
}

export function getUserBySession(token: string): User | null {
  const row = getDb()
    .prepare(
      `SELECT u.id, u.email, u.role, u.credits FROM sessions s
       JOIN users u ON u.id = s.user_id
       WHERE s.token = ? AND s.expires_at > datetime('now')`
    )
    .get(token) as User | undefined;
  return row ?? null;
}

export function deleteSession(token: string): void {
  getDb().prepare("DELETE FROM sessions WHERE token = ?").run(token);
}

export function consumeUserCredit(userId: number): boolean {
  return (
    getDb()
      .prepare("UPDATE users SET credits = credits - 1 WHERE id = ? AND credits > 0")
      .run(userId).changes > 0
  );
}

export function addUserCredits(email: string, credits: number): boolean {
  return (
    getDb()
      .prepare("UPDATE users SET credits = credits + ? WHERE email = ?")
      .run(credits, email.toLowerCase()).changes > 0
  );
}

export function listUsers(): User[] {
  return getDb()
    .prepare("SELECT id, email, role, credits FROM users ORDER BY id DESC")
    .all() as User[];
}

export interface QuoteRequest {
  id: number;
  name: string;
  email: string;
  company: string;
  request: string;
  status: string;
  createdAt: string;
}

export function createQuoteRequest(q: {
  name: string;
  email: string;
  company: string;
  request: string;
}): void {
  getDb()
    .prepare("INSERT INTO quote_requests (name, email, company, request) VALUES (?, ?, ?, ?)")
    .run(q.name, q.email, q.company, q.request);
}

export function listQuoteRequests(): QuoteRequest[] {
  const rows = getDb()
    .prepare(
      "SELECT id, name, email, company, request, status, created_at FROM quote_requests ORDER BY id DESC"
    )
    .all() as {
    id: number;
    name: string;
    email: string;
    company: string;
    request: string;
    status: string;
    created_at: string;
  }[];
  return rows.map((r) => ({ ...r, createdAt: r.created_at }));
}

export function updateQuoteStatus(id: number, status: string): boolean {
  return (
    getDb()
      .prepare("UPDATE quote_requests SET status = ? WHERE id = ?")
      .run(status, id).changes > 0
  );
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
