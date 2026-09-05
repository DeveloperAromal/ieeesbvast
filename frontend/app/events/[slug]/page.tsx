"use client"

import { APIENDPOINT } from "@/config/Backend";
import { useApiCall } from "@/hooks/useApiCall";
import { BackgroundImage } from "@/components/BackgroundImage";
import { ImageProxy } from "@/components/ImageProxy";
import { Event } from "@/types/event_types";
import { Calendar, Clock, MapPin, Users, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EventDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const { makeApiCall } = useApiCall();

    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvent = async () => {
            setLoading(true);
            try {
                const res = await makeApiCall(
                    "GET",
                    APIENDPOINT.GetEventBySlug(slug)
                )

                if (res.success && res.data) {
                    setEvent(res.data)
                }
            } catch (error) {
                console.error("Error fetching event:", error);
            } finally {
                setLoading(false);
            }
        }

        if (slug) {
            fetchEvent()
        }
    }, [slug, makeApiCall])

    if (loading) {
        return (
            <main
                className="flex min-h-screen items-center justify-center px-4"
                style={{ background: "var(--bg-page)" }}
            >
                <div className="flex flex-col items-center gap-3">
                    <div
                        className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
                        style={{ borderColor: "var(--border-default)", borderTopColor: "transparent" }}
                    />
                    <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                        Loading event...
                    </p>
                </div>
            </main>
        );
    }

    if (!event) {
        return (
            <main
                className="flex min-h-screen items-center justify-center px-4"
                style={{ background: "var(--bg-page)" }}
            >
                <p style={{ color: "var(--text-secondary)" }}>
                    Event not found
                </p>
            </main>
        );
    }

    const firstSchedule = event?.schedules?.[0];

    return (
        <main
            className="min-h-screen pb-28 lg:pb-0"
            style={{ background: "var(--bg-page)" }}
        >
            <section className="mx-auto max-w-6xl px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
                {/* Hero banner */}
                <div className="relative">
                    <BackgroundImage
                        imageKey={event?.banner_image}
                        className="h-40 w-full rounded-xl sm:h-56 sm:rounded-2xl lg:h-72"
                        refreshInterval={55}
                    />
                    <div
                        className="pointer-events-none absolute inset-0 rounded-xl sm:rounded-2xl"
                        style={{
                            background:
                                "linear-gradient(to top, rgba(0,0,0,0.45), rgba(0,0,0,0) 55%)",
                        }}
                    />
                </div>

                <div className="mt-6 grid grid-cols-1 gap-8 sm:mt-8 sm:gap-10 lg:grid-cols-[1fr_360px] lg:gap-12">
                    <div className="min-w-0 space-y-8 sm:space-y-10">
                        <div>
                            <span
                                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold tracking-wide uppercase"
                                style={{
                                    background: "var(--bg-accent-subtle, rgba(99,102,241,0.12))",
                                    color: "var(--text-accent, #6366f1)",
                                }}
                            >
                                Event
                            </span>

                            <h1
                                className="mt-4 text-2xl font-bold leading-tight tracking-tight sm:text-3xl lg:text-4xl"
                                style={{ color: "var(--text-primary)" }}
                            >
                                {event?.event_name}
                            </h1>

                            <div className="mt-5 flex flex-wrap gap-x-6 gap-y-3 text-sm sm:text-base">
                                <div
                                    className="flex items-center gap-2"
                                    style={{ color: "var(--text-secondary)" }}
                                >
                                    <MapPin size={17} className="flex-shrink-0" />
                                    <span>{event?.mode || "Online"}</span>
                                </div>

                                {firstSchedule && (
                                    <div
                                        className="flex items-center gap-2"
                                        style={{ color: "var(--text-secondary)" }}
                                    >
                                        <Calendar size={17} className="flex-shrink-0" />
                                        <span>
                                            {new Date(firstSchedule.date_time)
                                                .toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                        </span>
                                    </div>
                                )}

                                {firstSchedule && (
                                    <div
                                        className="flex items-center gap-2"
                                        style={{ color: "var(--text-secondary)" }}
                                    >
                                        <Clock size={17} className="flex-shrink-0" />
                                        <span>
                                            {new Date(firstSchedule.date_time)
                                                .toLocaleTimeString('en-US', {
                                                    hour: '2-digit',
                                                    minute: '2-digit',
                                                    hour12: true
                                                })}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* About */}
                        <section>
                            <h2
                                className="text-lg font-semibold sm:text-xl"
                                style={{ color: "var(--text-primary)" }}
                            >
                                About the event
                            </h2>

                            <div
                                className="mt-3 whitespace-pre-line text-sm leading-7 sm:text-base"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                {event?.description}
                            </div>
                        </section>

                        {/* Schedule */}
                        <section>
                            <h2
                                className="text-lg font-semibold sm:text-xl"
                                style={{ color: "var(--text-primary)" }}
                            >
                                Schedule
                            </h2>

                            {event?.schedules && Array.isArray(event.schedules) && event.schedules.length > 0 ? (
                                <div className="mt-5">
                                    {[...event.schedules]
                                        .sort((a, b) => new Date(a.date_time).getTime() - new Date(b.date_time).getTime())
                                        .map((schedule, index, sortedSchedules) => {
                                            const isLast = index === sortedSchedules.length - 1;
                                            const d = new Date(schedule.date_time);
                                            return (
                                                <div
                                                    key={schedule.id || index}
                                                    className="relative flex gap-4 sm:gap-6"
                                                >
                                                    {/* Rail: dot + connecting line */}
                                                    <div className="flex flex-col items-center">
                                                        <div
                                                            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[11px] font-bold sm:h-9 sm:w-9 sm:text-xs"
                                                            style={{
                                                                background: index === 0
                                                                    ? "var(--text-accent, #6366f1)"
                                                                    : "var(--bg-surface-sunken)",
                                                                color: index === 0
                                                                    ? "#fff"
                                                                    : "var(--text-secondary)",
                                                                border: index === 0
                                                                    ? "none"
                                                                    : "1px solid var(--border-default)",
                                                            }}
                                                        >
                                                            {index + 1}
                                                        </div>
                                                        {!isLast && (
                                                            <div
                                                                className="w-px flex-1"
                                                                style={{
                                                                    background: "var(--border-default)",
                                                                    minHeight: "24px",
                                                                }}
                                                            />
                                                        )}
                                                    </div>

                                                    {/* Content */}
                                                    <div
                                                        className={`min-w-0 ${isLast ? "pb-0" : "pb-6 sm:pb-8"}`}
                                                    >
                                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                                            <span
                                                                className="text-xs font-semibold sm:text-sm"
                                                                style={{ color: "var(--text-accent, #6366f1)" }}
                                                            >
                                                                {d.toLocaleTimeString(undefined, {
                                                                    hour: "2-digit",
                                                                    minute: "2-digit",
                                                                })}
                                                            </span>
                                                            <span
                                                                className="text-xs sm:text-sm"
                                                                style={{ color: "var(--text-muted)" }}
                                                            >
                                                                {d.toLocaleDateString(undefined, {
                                                                    month: "short",
                                                                    day: "numeric",
                                                                })}
                                                            </span>
                                                        </div>
                                                        <p
                                                            className="mt-1 text-sm font-medium leading-snug sm:text-base"
                                                            style={{ color: "var(--text-primary)" }}
                                                        >
                                                            {schedule.title}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                </div>
                            ) : (
                                <p
                                    className="mt-3 text-sm"
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    No schedules available
                                </p>
                            )}
                        </section>

                        <section>
                            <h2
                                className="text-lg font-semibold sm:text-xl"
                                style={{ color: "var(--text-primary)" }}
                            >
                                Speakers
                            </h2>

                            {event?.speakers && Array.isArray(event.speakers) && event.speakers.length > 0 ? (
                                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3">
                                    {event.speakers.map((speaker) => (
                                        <div
                                            key={speaker.id}
                                            className="overflow-hidden rounded-xl transition-transform duration-150 hover:-translate-y-0.5 sm:rounded-2xl"
                                            style={{
                                                background: "var(--bg-surface-sunken)",
                                                border: "1px solid var(--border-default)",
                                            }}
                                        >
                                            {speaker.image ? (
                                                <div className="aspect-square w-full overflow-hidden sm:aspect-[4/3]">
                                                    <ImageProxy
                                                        imageKey={speaker.image}
                                                        alt={speaker.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                            ) : (
                                                <div
                                                    className="flex aspect-square w-full items-center justify-center sm:aspect-[4/3]"
                                                    style={{ background: "var(--bg-page)" }}
                                                >
                                                    <Users size={28} style={{ color: "var(--text-muted)" }} />
                                                </div>
                                            )}
                                            <div className="p-3 sm:p-4">
                                                <h3
                                                    className="truncate text-sm font-semibold sm:text-base"
                                                    style={{ color: "var(--text-primary)" }}
                                                >
                                                    {speaker.name}
                                                </h3>
                                                {speaker.designation && (
                                                    <p
                                                        className="mt-0.5 truncate text-xs sm:text-sm"
                                                        style={{ color: "var(--text-muted)" }}
                                                    >
                                                        {speaker.designation}
                                                    </p>
                                                )}
                                                {speaker.company && (
                                                    <p
                                                        className="truncate text-xs sm:text-sm"
                                                        style={{ color: "var(--text-secondary)" }}
                                                    >
                                                        {speaker.company}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p
                                    className="mt-3 text-sm"
                                    style={{ color: "var(--text-muted)" }}
                                >
                                    No speakers available
                                </p>
                            )}
                        </section>
                    </div>

                    {/* Registration Sidebar — desktop */}
                    <aside className="hidden lg:block">
                        <div
                            className="sticky top-6 rounded-2xl p-6 shadow-sm"
                            style={{
                                background: "var(--bg-surface)",
                                border: "1px solid var(--border-default)",
                            }}
                        >
                            <p className="text-sm font-medium" style={{ color: "var(--text-muted)" }}>
                                Registration
                            </p>

                            <div className="mt-2 flex items-baseline gap-2">
                                <h3
                                    className="text-3xl font-bold"
                                    style={{ color: "var(--text-primary)" }}
                                >
                                    Free
                                </h3>
                            </div>

                            <p className="mt-2 text-sm" style={{ color: "var(--text-secondary)" }}>
                                Secure your spot — limited seats available.
                            </p>

                            <div
                                className="my-6"
                                style={{ borderTop: "1px solid var(--border-default)" }}
                            />

                            {event.is_reg_closed ? (
                                <button
                                    disabled
                                    className="btn btn-primary flex w-full cursor-not-allowed items-center justify-center gap-2 py-3 text-center font-semibold opacity-50"
                                >
                                    Registration Closed
                                </button>
                            ) : (
                                <Link
                                    href={`/register/${event.id}`}
                                    className="btn btn-primary flex w-full items-center justify-center gap-2 py-3 text-center font-semibold"
                                >
                                    Register now
                                    <ArrowRight size={16} />
                                </Link>
                            )}

                            <p className="mt-4 text-center text-xs" style={{ color: "var(--text-muted)" }}>
                                No payment required
                            </p>
                        </div>
                    </aside>
                </div>
            </section>

            <div
                className="fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-4 border-t px-4 py-3 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] lg:hidden"
                style={{
                    background: "var(--bg-surface, var(--bg-page))",
                    borderColor: "var(--border-default)",
                }}
            >
                <div className="min-w-0">
                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        Registration
                    </p>
                    <p className="text-lg font-bold" style={{ color: "var(--text-primary)" }}>
                        Free
                    </p>
                </div>
                {event.is_reg_closed ? (
                    <button
                        disabled
                        className="btn btn-primary flex shrink-0 items-center gap-2 px-6 py-2.5 font-semibold cursor-not-allowed opacity-50"
                    >
                        Registration Closed
                    </button>
                ) : (
                    <Link
                        href={`/register/${event.id}`}
                        className="btn btn-primary flex shrink-0 items-center gap-2 px-6 py-2.5 font-semibold"
                    >
                        Register now
                        <ArrowRight size={16} />
                    </Link>
                )}
            </div>
        </main>
    );
}