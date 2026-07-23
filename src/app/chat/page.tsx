"use client";

import { useEffect, useRef, useState } from "react";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface Subscription {
  id: number;
  topic: string;
}

function renderMarkdown(md: string): string {
  const esc = md.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  return esc
    .split("\n")
    .map((line) => {
      if (line.startsWith("### ")) return `<h4 class="mt-3 font-semibold">${line.slice(4)}</h4>`;
      if (line.startsWith("## ")) return `<h3 class="mt-3 text-base font-semibold">${line.slice(3)}</h3>`;
      if (line.startsWith("# ")) return `<h3 class="mt-3 text-base font-bold">${line.slice(2)}</h3>`;
      if (line.startsWith("- ")) return `<p class="ml-4">• ${line.slice(2)}</p>`;
      const bold = line.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
      return line.trim() ? `<p class="mt-1">${bold}</p>` : "";
    })
    .join("");
}

export default function ChatPage() {
  const [authed, setAuthed] = useState(false);
  const [tab, setTab] = useState<"chat" | "critique" | "watch">("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [citations, setCitations] = useState<string[]>([]);
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [docText, setDocText] = useState("");
  const [critique, setCritique] = useState<string | null>(null);
  const [critiqueLoading, setCritiqueLoading] = useState(false);
  const [subs, setSubs] = useState<Subscription[]>([]);
  const [newTopic, setNewTopic] = useState("");
  const [digest, setDigest] = useState<{ topic: string; content: string } | null>(null);
  const [digestLoading, setDigestLoading] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d: { user: unknown }) => {
        if (!d.user) {
          window.location.replace("/login");
          return;
        }
        setAuthed(true);
        fetch("/api/subscriptions")
          .then((r) => r.json())
          .then((d: { subscriptions?: Subscription[] }) => setSubs(d.subscriptions || []))
          .catch(() => {});
      })
      .catch(() => window.location.replace("/login"));
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function ask(e: React.FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (!q || loading) return;
    setError(null);
    setLoading(true);
    const next: ChatMessage[] = [...messages, { role: "user", content: q }];
    setMessages(next);
    setQuestion("");
    try {
      const res = await fetch("/api/brain/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: q, history: messages.slice(-6) }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "The Brain is unavailable");
      } else {
        setMessages([...next, { role: "assistant", content: data.answer }]);
        setCitations(data.citations || []);
      }
    } catch {
      setError("Network error");
    }
    setLoading(false);
  }

  async function runCritique() {
    if (critiqueLoading) return;
    setError(null);
    setCritique(null);
    setCritiqueLoading(true);
    try {
      const res = await fetch("/api/critique", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: docText }),
      });
      const data = await res.json();
      if (!res.ok) setError(data.error || "Critique failed");
      else setCritique(data.critique);
    } catch {
      setError("Network error");
    }
    setCritiqueLoading(false);
  }

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setDocText(String(reader.result || "").slice(0, 24000));
    reader.readAsText(file);
  }

  async function subscribe() {
    const topic = newTopic.trim();
    if (!topic) return;
    const res = await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic }),
    });
    const data = await res.json();
    if (res.ok) {
      setSubs(data.subscriptions || []);
      setNewTopic("");
    } else setError(data.error || "Failed to subscribe");
  }

  async function unsubscribe(id: number) {
    const res = await fetch("/api/subscriptions", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    const data = await res.json();
    if (res.ok) setSubs(data.subscriptions || []);
  }

  async function loadDigest(topic: string) {
    setDigestLoading(topic);
    setDigest(null);
    try {
      const res = await fetch("/api/subscriptions/digest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic }),
      });
      const data = await res.json();
      if (res.ok) setDigest({ topic, content: data.digest });
      else setError(data.error || "Digest failed");
    } catch {
      setError("Network error");
    }
    setDigestLoading(null);
  }

  if (!authed) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo-mark.svg" alt="IndusBrain" className="h-16 w-16 animate-pulse" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-mark.svg" alt="IndusBrain" className="h-9 w-9" />
            <h1 className="text-2xl font-bold tracking-tight">Ask the Brain</h1>
          </div>
          <nav className="flex items-center gap-2 text-sm">
            <a href="/" className="rounded-lg px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100">
              Blueprints
            </a>
            <a href="/ideas" className="rounded-lg px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100">
              💡 Idea Engine
            </a>
            <a href="/outreach" className="rounded-lg px-3 py-1.5 font-medium text-slate-700 hover:bg-slate-100">
              📡 Outreach
            </a>
          </nav>
        </header>

        <div className="mb-6 flex gap-2 text-sm">
          <button
            onClick={() => setTab("chat")}
            className={`rounded-lg px-4 py-2 font-medium ${tab === "chat" ? "bg-blue-600 text-white" : "border border-slate-300 bg-white hover:bg-slate-100"}`}
          >
            💬 Chat
          </button>
          <button
            onClick={() => setTab("critique")}
            className={`rounded-lg px-4 py-2 font-medium ${tab === "critique" ? "bg-blue-600 text-white" : "border border-slate-300 bg-white hover:bg-slate-100"}`}
          >
            📄 Critique a document
          </button>
          <button
            onClick={() => setTab("watch")}
            className={`rounded-lg px-4 py-2 font-medium ${tab === "watch" ? "bg-blue-600 text-white" : "border border-slate-300 bg-white hover:bg-slate-100"}`}
          >
            🔔 My watchlist
          </button>
        </div>

        {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-red-700">{error}</p>}

        {tab === "chat" && (
          <section>
            <div className="mb-4 min-h-[300px] space-y-4 rounded-xl border border-slate-200 bg-white p-5">
              {messages.length === 0 && (
                <p className="text-sm text-slate-500">
                  Ask anything about industries, regulators, permits, costs, who to pay and in what
                  order — e.g. “who do I pay first for a fish farm in Ogun state?” The Brain answers
                  from its curated blueprints, company database, price data and everything it has
                  learned.
                </p>
              )}
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`rounded-lg px-4 py-3 text-sm ${m.role === "user" ? "ml-8 bg-blue-50 text-blue-900" : "mr-4 bg-slate-100"}`}
                >
                  {m.role === "assistant" ? (
                    <div dangerouslySetInnerHTML={{ __html: renderMarkdown(m.content) }} />
                  ) : (
                    m.content
                  )}
                </div>
              ))}
              {loading && <p className="text-sm text-slate-400">The Brain is thinking…</p>}
              {citations.length > 0 && messages.length > 0 && (
                <p className="border-t border-slate-100 pt-2 text-xs text-slate-400">
                  Sources: {citations.join(" · ")}
                </p>
              )}
              <div ref={bottomRef} />
            </div>
            <form onSubmit={ask} className="flex gap-2">
              <input
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask the Brain…"
                className="flex-1 rounded-lg border border-slate-300 px-4 py-3"
                maxLength={1000}
              />
              <button
                type="submit"
                disabled={loading}
                className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
              >
                Ask
              </button>
            </form>
          </section>
        )}

        {tab === "critique" && (
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="mb-3 text-sm text-slate-600">
              Paste your business plan, feasibility study or proposal (or upload a .txt/.md file) —
              the Brain critiques it like an investment committee: gaps, regulatory blind spots,
              unrealistic numbers and concrete fixes.
            </p>
            <input type="file" accept=".txt,.md" onChange={handleFile} className="mb-3 text-sm" />
            <textarea
              value={docText}
              onChange={(e) => setDocText(e.target.value.slice(0, 24000))}
              rows={10}
              placeholder="Paste your document text here…"
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-sm"
            />
            <button
              onClick={runCritique}
              disabled={critiqueLoading || docText.trim().length < 100}
              className="mt-3 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {critiqueLoading ? "Analyzing…" : "Critique document"}
            </button>
            {critique && (
              <div
                className="mt-5 rounded-lg bg-slate-50 p-5 text-sm"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(critique) }}
              />
            )}
          </section>
        )}

        {tab === "watch" && (
          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="mb-3 text-sm text-slate-600">
              Subscribe to industries or topics and get a weekly intelligence digest: opportunities,
              regulatory notes, market signals and concrete moves.
            </p>
            <div className="mb-4 flex gap-2">
              <input
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder="e.g. solar power, rice milling, fintech…"
                className="flex-1 rounded-lg border border-slate-300 px-4 py-2 text-sm"
                maxLength={100}
              />
              <button
                onClick={subscribe}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Subscribe
              </button>
            </div>
            {subs.length === 0 && <p className="text-sm text-slate-400">No subscriptions yet.</p>}
            <ul className="space-y-2">
              {subs.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-2 text-sm"
                >
                  <span className="font-medium">{s.topic}</span>
                  <span className="flex gap-3">
                    <button
                      onClick={() => loadDigest(s.topic)}
                      disabled={digestLoading !== null}
                      className="text-blue-600 hover:underline disabled:opacity-50"
                    >
                      {digestLoading === s.topic ? "Generating…" : "This week's digest"}
                    </button>
                    <button onClick={() => unsubscribe(s.id)} className="text-red-600 hover:underline">
                      Remove
                    </button>
                  </span>
                </li>
              ))}
            </ul>
            {digest && (
              <div className="mt-5 rounded-lg bg-slate-50 p-5 text-sm">
                <h3 className="mb-2 font-semibold">Weekly digest — {digest.topic}</h3>
                <div dangerouslySetInnerHTML={{ __html: renderMarkdown(digest.content) }} />
              </div>
            )}
          </section>
        )}
      </div>
    </main>
  );
}
