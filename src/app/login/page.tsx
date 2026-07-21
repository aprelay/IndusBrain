"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    setLoading(false);
    if (!res.ok) {
      setError(data?.error || "Failed");
      return;
    }
    router.push("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-900">
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h1 className="text-xl font-bold">
          {mode === "login" ? "Sign in" : "Create account"}
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Sign in to use your blueprint credits. Credits are issued after you accept a quote
          and pay by bank transfer.
        </p>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="mt-4 w-full rounded-lg border border-slate-300 px-3 py-2"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (min 8 characters)"
          className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-2"
          required
          minLength={8}
        />
        {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-lg bg-blue-600 px-4 py-2 font-semibold text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
        </button>
        <button
          type="button"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
          className="mt-3 w-full text-sm text-blue-600 hover:underline"
        >
          {mode === "login" ? "New here? Create an account" : "Already registered? Sign in"}
        </button>
        <p className="mt-4 text-xs text-slate-400">
          By continuing you agree to our{" "}
          <a href="/privacy" className="underline">
            privacy policy
          </a>
          .
        </p>
      </form>
    </main>
  );
}
