"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar, Users } from "lucide-react";

export function AdminSidebar() {
    const pathname = usePathname();

    const isActive = (path: string) => pathname === path;

    return (
        <aside className="w-64 border-r min-h-screen"
            style={{
                borderColor: "var(--border-default)",
                background: "var(--bg-surface-raised)"
            }}>
            <div className="p-6">
                <h2 className="text-sm font-semibold uppercase tracking-wider"
                    style={{ color: "var(--text-muted)" }}>
                    Admin
                </h2>
            </div>

            <nav className="space-y-1 px-3">
                <Link
                    href="/admin"
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive("/admin")
                            ? "text-color-accent"
                            : ""
                    }`}
                    style={{
                        background: isActive("/admin") ? "var(--bg-surface)" : "transparent",
                        color: isActive("/admin") ? "var(--color-accent)" : "var(--text-secondary)",
                    }}
                >
                    <Calendar size={18} />
                    Create Event
                </Link>

                <Link
                    href="/admin/registrations"
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        isActive("/admin/registrations")
                            ? "text-color-accent"
                            : ""
                    }`}
                    style={{
                        background: isActive("/admin/registrations") ? "var(--bg-surface)" : "transparent",
                        color: isActive("/admin/registrations") ? "var(--color-accent)" : "var(--text-secondary)",
                    }}
                >
                    <Users size={18} />
                    Registrations
                </Link>
            </nav>
        </aside>
    );
}
