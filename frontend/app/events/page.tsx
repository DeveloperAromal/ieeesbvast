
"use client";

import { APIENDPOINT } from "@/config/Backend";
import { useApiCall } from "@/hooks/useApiCall";
import { ImageProxy } from "@/components/ImageProxy";
import { Event } from "@/types/event_types";
import { Calendar, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function EventsPage() {
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
            <main className="min-h-screen flex items-center justify-center"
                style={{ background: "var(--bg-page)" }}>
                <p style={{ color: "var(--text-secondary)" }}>
                    Loading events...
                </p>
            </main>
        );
    }

    if (error) {
        return (
            <main className="min-h-screen flex items-center justify-center"
                style={{ background: "var(--bg-page)" }}>
                <div className="text-center">
                    <p style={{ color: "var(--text-secondary)" }}>
                        {error}
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen" style={{ background: "var(--bg-page)" }}>
            <section className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
                {/* Header */}
                <div className="mb-12">
                    <h1 className="text-4xl font-bold tracking-tight"
                        style={{ color: "var(--text-primary)" }}>
                        Events
                    </h1>
                    <p className="text-lg mt-3"
                        style={{ color: "var(--text-muted)" }}>
                        Discover and register for our upcoming events
                    </p>
                </div>

                {/* Events Grid */}
                {events.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20">
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
            className="group rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-105"
            style={{
                background: "var(--bg-surface-raised)",
                border: "1px solid var(--border-default)",
            }}
        >
            {/* Event Poster */}
            {event.poster_image && (
                <div className="w-full h-48 overflow-hidden bg-gray-200 relative"
                    style={{
                        backgroundColor: "var(--bg-surface)",
                    }}>
                    <ImageProxy
                        imageKey={event.poster_image}
                        alt={event.event_name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                </div>
            )}

            {/* Content */}
            <div className="p-5">
                {/* Event Name */}
                <h3
                    className="text-lg font-semibold line-clamp-2 group-hover:text-color-accent transition-colors"
                    style={{ color: "var(--text-primary)" }}
                >
                    {event.event_name}
                </h3>

                {/* Description */}
                <p
                    className="mt-2 text-sm line-clamp-2"
                    style={{ color: "var(--text-muted)" }}
                >
                    {event.description}
                </p>

                {/* Meta Info */}
                <div className="mt-4 flex items-center justify-between text-xs"
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

                {/* Footer with Arrow */}
                <div className="mt-5 flex items-center justify-between pt-4"
                    style={{ borderTop: "1px solid var(--border-default)" }}>
                    <span className="text-xs font-semibold"
                        style={{ color: "var(--color-accent)" }}>
                        View Event
                    </span>
                    <ArrowRight size={16}
                        className="group-hover:translate-x-1 transition-transform"
                        style={{ color: "var(--color-accent)" }} />
                </div>
            </div>
        </Link>
    );
}
