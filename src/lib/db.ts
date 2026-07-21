import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { AuditEntry, IndustryTemplate } from "@/lib/types";
import { industries as baseIndustries } from "@/data/industries";
import { extraIndustries } from "@/data/industries-extra";

const seedIndustries = [...baseIndustries, ...extraIndustries];

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
    CREATE TABLE IF NOT EXISTS saved_blueprints (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS companies (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL,
      services TEXT NOT NULL DEFAULT '',
      location TEXT NOT NULL DEFAULT '',
      contact TEXT NOT NULL DEFAULT '',
      verified INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS api_keys (
      key TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      credits INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS saved_ideas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      data TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE TABLE IF NOT EXISTS outreach_domains (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      domain TEXT NOT NULL UNIQUE,
      industry TEXT NOT NULL DEFAULT 'unclassified',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_outreach_industry ON outreach_domains(industry);
    CREATE TABLE IF NOT EXISTS brain_memory (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kind TEXT NOT NULL,
      brief TEXT NOT NULL,
      country TEXT NOT NULL DEFAULT '',
      title TEXT NOT NULL DEFAULT '',
      summary TEXT NOT NULL DEFAULT '',
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
  const insert = db.prepare("INSERT OR IGNORE INTO industries (id, data) VALUES (?, ?)");
  const tx = db.transaction((items: IndustryTemplate[]) => {
    for (const item of items) insert.run(item.id, JSON.stringify(item));
  });
  tx(seedIndustries);
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
    const score = template.keywords
      .filter((k) => text.includes(k.toLowerCase()))
      .reduce((sum, k) => sum + k.length, 0);
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

export interface SavedBlueprintMeta {
  id: number;
  title: string;
  createdAt: string;
}

export function saveBlueprint(userId: number, title: string, data: string): number {
  const info = getDb()
    .prepare("INSERT INTO saved_blueprints (user_id, title, data) VALUES (?, ?, ?)")
    .run(userId, title, data);
  return Number(info.lastInsertRowid);
}

export function listSavedBlueprints(userId: number): SavedBlueprintMeta[] {
  const rows = getDb()
    .prepare(
      "SELECT id, title, created_at FROM saved_blueprints WHERE user_id = ? ORDER BY id DESC"
    )
    .all(userId) as { id: number; title: string; created_at: string }[];
  return rows.map((r) => ({ id: r.id, title: r.title, createdAt: r.created_at }));
}

export function getSavedBlueprint(userId: number, id: number): string | null {
  const row = getDb()
    .prepare("SELECT data FROM saved_blueprints WHERE id = ? AND user_id = ?")
    .get(id, userId) as { data: string } | undefined;
  return row ? row.data : null;
}

export interface Company {
  id: number;
  name: string;
  category: string;
  services: string;
  location: string;
  contact: string;
  verified: boolean;
}

export function listCompanies(category?: string): Company[] {
  const rows = (
    category
      ? getDb()
          .prepare(
            "SELECT id, name, category, services, location, contact, verified FROM companies WHERE category = ? ORDER BY verified DESC, name"
          )
          .all(category)
      : getDb()
          .prepare(
            "SELECT id, name, category, services, location, contact, verified FROM companies ORDER BY category, verified DESC, name"
          )
          .all()
  ) as {
    id: number;
    name: string;
    category: string;
    services: string;
    location: string;
    contact: string;
    verified: number;
  }[];
  return rows.map((r) => ({ ...r, verified: r.verified === 1 }));
}

export function upsertCompany(c: {
  id?: number;
  name: string;
  category: string;
  services: string;
  location: string;
  contact: string;
  verified: boolean;
}): void {
  if (c.id) {
    getDb()
      .prepare(
        "UPDATE companies SET name = ?, category = ?, services = ?, location = ?, contact = ?, verified = ? WHERE id = ?"
      )
      .run(c.name, c.category, c.services, c.location, c.contact, c.verified ? 1 : 0, c.id);
  } else {
    getDb()
      .prepare(
        "INSERT INTO companies (name, category, services, location, contact, verified) VALUES (?, ?, ?, ?, ?, ?)"
      )
      .run(c.name, c.category, c.services, c.location, c.contact, c.verified ? 1 : 0);
  }
}

export function deleteCompany(id: number): boolean {
  return getDb().prepare("DELETE FROM companies WHERE id = ?").run(id).changes > 0;
}

export interface ApiKey {
  key: string;
  name: string;
  credits: number;
  createdAt: string;
}

export function createApiKey(key: string, name: string, credits: number): void {
  getDb()
    .prepare("INSERT INTO api_keys (key, name, credits) VALUES (?, ?, ?)")
    .run(key, name, credits);
}

export function listApiKeys(): ApiKey[] {
  const rows = getDb()
    .prepare("SELECT key, name, credits, created_at FROM api_keys ORDER BY created_at DESC")
    .all() as { key: string; name: string; credits: number; created_at: string }[];
  return rows.map((r) => ({ key: r.key, name: r.name, credits: r.credits, createdAt: r.created_at }));
}

export function addApiKeyCredits(key: string, credits: number): boolean {
  return (
    getDb()
      .prepare("UPDATE api_keys SET credits = credits + ? WHERE key = ?")
      .run(credits, key).changes > 0
  );
}

export function deleteApiKey(key: string): boolean {
  return getDb().prepare("DELETE FROM api_keys WHERE key = ?").run(key).changes > 0;
}

export function consumeApiKeyCredit(key: string): boolean {
  return (
    getDb()
      .prepare("UPDATE api_keys SET credits = credits - 1 WHERE key = ? AND credits > 0")
      .run(key).changes > 0
  );
}

export function saveIdeaReport(userId: number, title: string, data: string): number {
  const info = getDb()
    .prepare("INSERT INTO saved_ideas (user_id, title, data) VALUES (?, ?, ?)")
    .run(userId, title, data);
  return Number(info.lastInsertRowid);
}

export function listSavedIdeas(userId: number): SavedBlueprintMeta[] {
  const rows = getDb()
    .prepare(
      "SELECT id, title, created_at FROM saved_ideas WHERE user_id = ? ORDER BY id DESC"
    )
    .all(userId) as { id: number; title: string; created_at: string }[];
  return rows.map((r) => ({ id: r.id, title: r.title, createdAt: r.created_at }));
}

export function getSavedIdea(userId: number, id: number): string | null {
  const row = getDb()
    .prepare("SELECT data FROM saved_ideas WHERE id = ? AND user_id = ?")
    .get(id, userId) as { data: string } | undefined;
  return row ? row.data : null;
}

export interface OutreachDomain {
  id: number;
  domain: string;
  industry: string;
}

export function bulkInsertOutreachDomains(
  entries: { domain: string; industry: string }[]
): number {
  const d = getDb();
  const insert = d.prepare(
    "INSERT OR IGNORE INTO outreach_domains (domain, industry) VALUES (?, ?)"
  );
  let added = 0;
  const tx = d.transaction((items: { domain: string; industry: string }[]) => {
    for (const e of items) {
      added += insert.run(e.domain, e.industry).changes;
    }
  });
  tx(entries);
  return added;
}

export function searchOutreachDomains(
  industry: string,
  query: string,
  page: number,
  perPage = 50
): { total: number; domains: OutreachDomain[] } {
  const d = getDb();
  const clauses: string[] = [];
  const params: string[] = [];
  if (industry) {
    clauses.push("industry = ?");
    params.push(industry);
  }
  if (query) {
    clauses.push("domain LIKE ?");
    params.push(`%${query}%`);
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const total = (
    d.prepare(`SELECT COUNT(*) AS n FROM outreach_domains ${where}`).get(...params) as {
      n: number;
    }
  ).n;
  const domains = d
    .prepare(
      `SELECT id, domain, industry FROM outreach_domains ${where} ORDER BY domain LIMIT ? OFFSET ?`
    )
    .all(...params, perPage, Math.max(0, page - 1) * perPage) as OutreachDomain[];
  return { total, domains };
}

export function outreachIndustryStats(): { industry: string; count: number }[] {
  return getDb()
    .prepare(
      "SELECT industry, COUNT(*) AS count FROM outreach_domains GROUP BY industry ORDER BY count DESC"
    )
    .all() as { industry: string; count: number }[];
}

export interface BrainMemoryRow {
  id: number;
  kind: string;
  brief: string;
  country: string;
  title: string;
  summary: string;
  createdAt: string;
}

export function recordBrainMemory(
  entries: { kind: string; brief: string; country?: string; title?: string; summary?: string }[]
): void {
  const d = getDb();
  const insert = d.prepare(
    "INSERT INTO brain_memory (kind, brief, country, title, summary) VALUES (?, ?, ?, ?, ?)"
  );
  const tx = d.transaction((items: typeof entries) => {
    for (const e of items) {
      insert.run(e.kind, e.brief, e.country || "", e.title || "", e.summary || "");
    }
  });
  tx(entries);
}

export function listRecentBrainMemory(limit = 500): BrainMemoryRow[] {
  const rows = getDb()
    .prepare(
      "SELECT id, kind, brief, country, title, summary, created_at FROM brain_memory ORDER BY id DESC LIMIT ?"
    )
    .all(limit) as {
    id: number;
    kind: string;
    brief: string;
    country: string;
    title: string;
    summary: string;
    created_at: string;
  }[];
  return rows.map((r) => ({ ...r, createdAt: r.created_at }));
}

export function countBrainMemory(): number {
  return (getDb().prepare("SELECT COUNT(*) AS n FROM brain_memory").get() as { n: number }).n;
}

export function listUnclassifiedDomains(limit: number): string[] {
  return (
    getDb()
      .prepare(
        "SELECT domain FROM outreach_domains WHERE industry = 'unclassified' ORDER BY id LIMIT ?"
      )
      .all(limit) as { domain: string }[]
  ).map((r) => r.domain);
}

export function updateDomainIndustries(entries: { domain: string; industry: string }[]): number {
  const d = getDb();
  const update = d.prepare("UPDATE outreach_domains SET industry = ? WHERE domain = ?");
  let changed = 0;
  const tx = d.transaction((items: typeof entries) => {
    for (const e of items) changed += update.run(e.industry, e.domain).changes;
  });
  tx(entries);
  return changed;
}

export function deleteOutreachIndustry(industry: string): number {
  return getDb()
    .prepare("DELETE FROM outreach_domains WHERE industry = ?")
    .run(industry).changes;
}
