"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { APIENDPOINT } from "@/config/Backend";
import { useApiCall } from "@/hooks/useApiCall";
import Link from "next/link";

const BLACKOUT_EVENT_ID = "de921a92-5188-4d29-b7ce-ee1e458417bc";

export default function BlackoutLoginPage() {
  const router = useRouter();
  const { makeApiCall } = useApiCall();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required");
      setLoading(false);
      return;
    }

    const res = await makeApiCall("POST", APIENDPOINT.BlackoutLogin, {
      email: email,
      password: password,
    });

    if (res.success && res.data) {
      // Session token is set via cookie by the API
      setEmail("");
      setPassword("");
      router.push("/blackout/game");
    } else {
      setError(res.message || "Invalid credentials. Please try again.");
    }

    setLoading(false);
  };

  return (
    <main className="min-h-screen bg-[var(--bg-page)] flex items-center justify-center px-4">
      <div className="w-full max-w-md rounded-2xl border border-[var(--border-default)] bg-[var(--bg-surface-raised)] p-8">
        <div className="text-center">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Welcome to</p>
          <h1 className="mt-3 text-3xl font-bold text-[var(--text-primary)]">Blackout</h1>
          <p className="mt-2 text-[var(--text-secondary)]">Enter your credentials to begin</p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--color-accent)] transition-colors"
              disabled={loading}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-[var(--text-secondary)]">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-xl border border-[var(--border-default)] bg-[var(--bg-surface)] px-4 py-3 text-[var(--text-primary)] placeholder-[var(--text-muted)] outline-none focus:border-[var(--color-accent)] transition-colors"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[var(--color-accent)] px-5 py-3 font-semibold text-white hover:opacity-90 disabled:opacity-60 transition-opacity"
          >
            {loading ? "Authenticating..." : "Enter Blackout"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--text-muted)]">
          New to Blackout?{" "}
          <Link href={`/register/${BLACKOUT_EVENT_ID}`} className="font-medium text-[var(--color-accent)] hover:underline">
            Register your team
          </Link>
        </p>
      </div>
    </main>
  );
}
