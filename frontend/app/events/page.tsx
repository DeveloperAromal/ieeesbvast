"use client";

import { APIENDPOINT } from "@/config/Backend";
import { useApiCall } from "@/hooks/useApiCall";
import { ImageProxy } from "@/components/ImageProxy";
import { Event } from "@/types/event_types";
import { Calendar, ArrowRight, CalendarX } from "lucide-react";
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

    return (
        <main className="min-h-screen" style={{ background: "var(--bg-page)" }}>
            <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
                {/* Header */}
                <div className="mb-8 sm:mb-12">
                    <span
                        className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase"
                        style={{
                            background: "var(--bg-accent-subtle, rgba(99,102,241,0.12))",
                            color: "var(--color-accent, #6366f1)",
                        }}
                    >
                        Browse
                    </span>
                    <h1
                        className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl"
                        style={{ color: "var(--text-primary)" }}
                    >
                        Events
                    </h1>
                    <p
                        className="mt-2 text-base sm:mt-3 sm:text-lg"
                        style={{ color: "var(--text-muted)" }}
                    >
                        Discover and register for our upcoming events
                    </p>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                            <EventCardSkeleton key={i} />
                        ))}
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <div className="flex flex-col items-center justify-center rounded-2xl py-20 text-center"
                        style={{
                            background: "var(--bg-surface-raised)",
                            border: "1px solid var(--border-default)",
                        }}>
                        <p style={{ color: "var(--text-secondary)" }}>
                            {error}
                        </p>
                    </div>
                )}

                {/* Empty */}
                {!loading && !error && events.length === 0 && (
                    <div
                        className="flex flex-col items-center justify-center rounded-2xl py-20 text-center"
                        style={{
                            background: "var(--bg-surface-raised)",
                            border: "1px solid var(--border-default)",
                        }}
                    >
                        <div
                            className="mb-4 flex h-14 w-14 items-center justify-center rounded-full"
                            style={{ background: "var(--bg-surface-sunken)" }}
                        >
                            <CalendarX size={24} style={{ color: "var(--text-muted)" }} />
                        </div>
                        <p style={{ color: "var(--text-secondary)" }}>
                            No events available at the moment
                        </p>
                        <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>
                            Check back soon for upcoming events
                        </p>
                    </div>
                )}

                {/* Events Grid */}
                {!loading && !error && events.length > 0 && (
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
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
            className="group flex flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            style={{
                background: "var(--bg-surface-raised)",
                border: "1px solid var(--border-default)",
            }}
        >
            {/* Event Poster */}
            <div
                className="relative h-44 w-full overflow-hidden sm:h-48"
                style={{ background: "var(--bg-surface-sunken)" }}
            >
                {event.poster_image ? (
                    <ImageProxy
                        imageKey={event.poster_image}
                        alt={event.event_name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center">
                        <Calendar size={32} style={{ color: "var(--text-muted)" }} />
                    </div>
                )}

                {/* Date badge */}
                {event?.schedules && event.schedules.length > 0 && (
                    <div
                        className="absolute left-3 top-3 rounded-lg px-2.5 py-1.5 text-center shadow-sm backdrop-blur-sm"
                        style={{ background: "rgba(255,255,255,0.92)" }}
                    >
                        <p className="text-[10px] font-semibold uppercase leading-none text-gray-500">
                            {new Date(event.schedules[0].date_time).toLocaleDateString('en-US', { month: 'short' })}
                        </p>
                        <p className="mt-0.5 text-sm font-bold leading-none text-gray-900">
                            {new Date(event.schedules[0].date_time).toLocaleDateString('en-US', { day: 'numeric' })}
                        </p>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex flex-1 flex-col p-4 sm:p-5">
                {/* Event Name */}
                <h3
                    className="line-clamp-2 text-base font-semibold leading-snug sm:text-lg"
                    style={{ color: "var(--text-primary)" }}
                >
                    {event.event_name}
                </h3>

                {/* Description */}
                <p
                    className="mt-1.5 line-clamp-2 text-sm leading-relaxed"
                    style={{ color: "var(--text-muted)" }}
                >
                    {event.description}
                </p>

                {/* Meta Info */}
                {event?.schedules && event.schedules.length > 0 && (
                    <div
                        className="mt-3 flex items-center gap-1.5 text-xs sm:text-sm"
                        style={{ color: "var(--text-secondary)" }}
                    >
                        <Calendar size={15} className="flex-shrink-0" />
                        <span>
                            {new Date(event.schedules[0].date_time)
                                .toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                        </span>
                    </div>
                )}

                <div
                    className="mt-4 flex flex-1 items-end justify-between pt-3"
                    style={{ borderTop: "1px solid var(--border-default)" }}
                >
                    <span
                        className="text-xs font-semibold sm:text-sm"
                        style={{ color: "var(--color-accent)" }}
                    >
                        View Event
                    </span>
                    <ArrowRight
                        size={16}
                        className="transition-transform group-hover:translate-x-1"
                        style={{ color: "var(--color-accent)" }}
                    />
                </div>
            </div>
        </Link>
    );
}

function EventCardSkeleton() {
    return (
        <div
            className="overflow-hidden rounded-2xl"
            style={{
                background: "var(--bg-surface-raised)",
                border: "1px solid var(--border-default)",
            }}
        >
            <div
                className="h-44 w-full animate-pulse sm:h-48"
                style={{ background: "var(--bg-surface-sunken)" }}
            />
            <div className="space-y-3 p-4 sm:p-5">
                <div
                    className="h-4 w-3/4 animate-pulse rounded"
                    style={{ background: "var(--bg-surface-sunken)" }}
                />
                <div
                    className="h-3 w-full animate-pulse rounded"
                    style={{ background: "var(--bg-surface-sunken)" }}
                />
                <div
                    className="h-3 w-2/3 animate-pulse rounded"
                    style={{ background: "var(--bg-surface-sunken)" }}
                />
                <div
                    className="mt-4 h-3 w-1/3 animate-pulse rounded"
                    style={{ background: "var(--bg-surface-sunken)" }}
                />
            </div>
        </div>
    );
}