"use client"

import { APIENDPOINT } from "@/config/Backend";
import { useApiCall } from "@/hooks/useApiCall";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const { makeApiCall } = useApiCall()
    const router = useRouter()

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Enter your email and password to continue.");
            return;
        }

        setLoading(true);
        try {
            const res = await makeApiCall(
                "POST",
                APIENDPOINT.Login,
                {
                    email,
                    password
                }
            )

            if (res.success) {
                router.push("/events/dashboard")
            } else {
                setError("Couldn't log in. Check your details and try again.");
            }
        } catch (err) {
            setError("Something went wrong. Try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="min-h-screen w-full flex items-center justify-center bg-[var(--bg-page)] px-4">
            <div className="w-full max-w-[380px]">
                <div className="card">
                    <h1 className="text-[20px] font-semibold text-[var(--text-primary)] mb-1">
                        Log in to your account
                    </h1>
                    <p className="text-[14px] text-[var(--text-secondary)] mb-6">
                        Welcome back. Enter your details below.
                    </p>

                    {error && (
                        <div className="status-bg-danger rounded-[8px] px-3 py-2 text-[13px] mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <label htmlFor="email" className="text-[13px] font-medium text-[var(--text-secondary)]">
                                Email
                            </label>
                            <input
                                id="email"
                                type="email"
                                className="input w-full"
                                placeholder="you@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                            />
                        </div>

                        <div className="flex flex-col gap-1.5">
                            <div className="relative">
                                <input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    className="input w-full pr-16"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((v) => !v)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] font-medium text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                                >
                                    {showPassword ? "Hide" : "Show"}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn btn-primary w-full justify-center mt-2 py-2.5"
                        >
                            {loading ? "Logging in…" : "Log in"}
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
}