
"use client";

import { APIENDPOINT } from "@/config/Backend";
import { useApiCall } from "@/hooks/useApiCall";
import { ImageProxy } from "@/components/ImageProxy";
import { Event } from "@/types/event_types";
import { Calendar, Users } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Events() {
    const { makeApiCall } = useApiCall();
    const [events, setEvents] = useState<Event[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchEvents = async () => {
            setLoading(true);
            setError(null);

            try {
                const res = await makeApiCall(
                    "GET",
                    APIENDPOINT.GetAllEvents
                );

                if (res.success && res.data) {
                    setEvents(Array.isArray(res.data) ? res.data : []);
                } else {
                    setError(res.message || "Failed to fetch events");
                }
            } catch (err) {
                setError("An error occurred while fetching events");
            } finally {
                setLoading(false);
            }
        };

        fetchEvents();
    }, [makeApiCall]);

    if (loading) {
        return (
            <main
                className="flex min-h-screen items-center justify-center"
                style={{ background: "var(--bg-page)" }}
            >
                <p style={{ color: "var(--text-secondary)" }}>
                    Loading events...
                </p>
            </main>
        );
    }

    if (error) {
        return (
            <main
                className="flex min-h-screen items-center justify-center"
                style={{ background: "var(--bg-page)" }}
            >
                <p style={{ color: "var(--text-secondary)" }}>
                    {error}
                </p>
            </main>
        );
    }

    return (
        <main className="min-h-screen" style={{ background: "var(--bg-page)" }}>
            <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
                <div className="mb-10">
                    <h1 className="text-4xl font-bold tracking-tight"
                        style={{ color: "var(--text-primary)" }}>
                        Events
                    </h1>
                    <p className="mt-2 text-lg"
                        style={{ color: "var(--text-muted)" }}>
                        Explore and register for our upcoming events
                    </p>
                </div>

                {events.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <p style={{ color: "var(--text-secondary)" }}>
                            No events available at the moment
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {events.map((event) => (
                            <EventCard key={event.id} event={event} />
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}

function EventCard({ event }: { event: Event }) {
    return (
        <Link
            href={`/events/${event.event_slug}`}
            className="group rounded-xl overflow-hidden transition-transform hover:scale-105"
            style={{
                background: "var(--bg-surface-raised)",
                border: "1px solid var(--border-default)",
            }}
        >
            {/* Event Poster with fresh signed URL */}
            {event.poster_image && (
                <div className="w-full h-48 overflow-hidden bg-cover bg-center"
                    style={{
                        backgroundColor: "var(--bg-surface)",
                    }}>
                    <ImageProxy
                        imageKey={event.poster_image}
                        alt={event.event_name}
                        className="w-full h-full object-cover"
                    />
                </div>
            )}

            <div className="p-5">
                <h3
                    className="text-lg font-semibold line-clamp-2"
                    style={{ color: "var(--text-primary)" }}
                >
                    {event.event_name}
                </h3>

                <p
                    className="mt-2 text-sm line-clamp-2"
                    style={{ color: "var(--text-muted)" }}
                >
                    {event.description}
                </p>

                <div className="mt-4 flex items-center justify-between text-sm"
                    style={{ color: "var(--text-secondary)" }}>
                    <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>Sep 20, 2026</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Users size={14} />
                        <span>124 registered</span>
                    </div>
                </div>

                <button
                    className="mt-4 w-full py-2 rounded-lg font-medium transition-colors"
                    style={{
                        background: "var(--color-accent)",
                        color: "var(--color-accent-text)",
                    }}
                >
                    View Event
                </button>
            </div>
        </Link>
    );
}
