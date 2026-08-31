"use client"

import { APIENDPOINT } from "@/config/Backend";
import { useApiCall } from "@/hooks/useApiCall";
import { useImageUrl } from "@/hooks/useImageUrl";
import { BackgroundImage } from "@/components/BackgroundImage";
import { ImageProxy } from "@/components/ImageProxy";
import { Event } from "@/types/event_types";
import { Calendar, Clock, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function EventDetailPage() {
    const { slug } = useParams<{ slug: string }>();
    const { makeApiCall } = useApiCall();

    const [event, setEvent] = useState<Event | null>(null);

    useEffect(() => {
        const fetchEvent = async () => {
            const res = await makeApiCall(
                "GET",
                APIENDPOINT.GetEventBySlug(slug)
            )

            if (res.success && res.data) {
                setEvent(res.data)
            }
        }

        fetchEvent()
    }, [slug, makeApiCall])

    if (!event) {
        return (
            <main
                className="flex min-h-screen items-center justify-center"
                style={{ background: "var(--bg-page)" }}
            >
                <p style={{ color: "var(--text-secondary)" }}>
                    Loading event...
                </p>
            </main>
        );
    }

    return (
        <main className="min-h-screen" style={{ background: "var(--bg-page)" }}>
            <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
                {/* Banner Image with auto-refresh */}
                <BackgroundImage
                    imageKey={event?.banner_image}
                    className="h-80 w-full rounded-2xl"
                    style={{
                        border: "1px solid var(--border-default)",
                    }}
                    refreshInterval={55}
                />

                <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
                    <div className="space-y-10">
                        <div>
                            <span className="badge badge-info">Event</span>

                            <h1
                                className="mt-3 text-4xl font-bold tracking-tight"
                                style={{ color: "var(--text-primary)" }}
                            >
                                {event?.event_name}
                            </h1>

                            <div className="mt-6 space-y-3">
                                <div
                                    className="flex items-center gap-2"
                                    style={{ color: "var(--text-secondary)" }}
                                >
                                    <Calendar size={18} style={{ color: "var(--text-muted)" }} />
                                    <span>September 20, 2026</span>
                                </div>
                                <div
                                    className="flex items-center gap-2"
                                    style={{ color: "var(--text-secondary)" }}
                                >
                                    <Clock size={18} style={{ color: "var(--text-muted)" }} />
                                    <span>9:00 AM - 6:00 PM</span>
                                </div>
                                <div
                                    className="flex items-center gap-2"
                                    style={{ color: "var(--text-secondary)" }}
                                >
                                    <MapPin size={18} style={{ color: "var(--text-muted)" }} />
                                    <span>Bangalore, India</span>
                                </div>
                            </div>
                        </div>

                        <section>
                            <h2
                                className="text-2xl font-semibold"
                                style={{ color: "var(--text-primary)" }}
                            >
                                About the event
                            </h2>

                            <div
                                className="mt-4 whitespace-pre-line leading-7"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                {event?.description}
                            </div>
                        </section>

                        {/* Schedule Section */}
                        {event?.schedules && event.schedules.length > 0 && (
                            <section>
                                <h2
                                    className="text-2xl font-semibold"
                                    style={{ color: "var(--text-primary)" }}
                                >
                                    Schedule
                                </h2>

                                <div className="card mt-5 !p-0 overflow-hidden">
                                    {event.schedules.map((schedule, index) => (
                                        <div
                                            key={schedule.id || index}
                                            className="flex gap-8 p-5"
                                            style={{
                                                borderBottom: index !== event.schedules!.length - 1 ? "1px solid var(--border-default)" : "none"
                                            }}
                                        >
                                            <span className="w-24 flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                                                {schedule.start_time}
                                            </span>
                                            <div>
                                                <span style={{ color: "var(--text-primary)" }}>
                                                    {schedule.title}
                                                </span>
                                                {schedule.end_time && (
                                                    <p style={{ color: "var(--text-muted)", fontSize: "0.875rem" }}>
                                                        Ends at {schedule.end_time}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Speakers Section */}
                        {event?.speakers && event.speakers.length > 0 && (
                            <section>
                                <h2
                                    className="text-2xl font-semibold"
                                    style={{ color: "var(--text-primary)" }}
                                >
                                    Speakers
                                </h2>

                                <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                    {event.speakers.map((speaker) => (
                                        <div
                                            key={speaker.id}
                                            className="rounded-xl overflow-hidden"
                                            style={{
                                                background: "var(--bg-surface-sunken)",
                                                border: "1px solid var(--border-default)",
                                            }}
                                        >
                                            {speaker.image && (
                                                <div className="w-full h-40 overflow-hidden">
                                                    <ImageProxy
                                                        imageKey={speaker.image}
                                                        alt={speaker.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                            )}
                                            <div className="p-4">
                                                <h3
                                                    className="font-semibold"
                                                    style={{ color: "var(--text-primary)" }}
                                                >
                                                    {speaker.name}
                                                </h3>
                                                <p
                                                    className="text-sm"
                                                    style={{ color: "var(--text-muted)" }}
                                                >
                                                    {speaker.designation}
                                                </p>
                                                <p
                                                    className="text-sm"
                                                    style={{ color: "var(--text-secondary)" }}
                                                >
                                                    {speaker.company}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Registration Sidebar */}
                    <aside>
                        <div className="card sticky top-6">
                            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                                Registration
                            </p>

                            <h3
                                className="mt-2 text-2xl font-semibold"
                                style={{ color: "var(--text-primary)" }}
                            >
                                Free
                            </h3>

                            <div
                                className="my-6"
                                style={{ borderTop: "1px solid var(--border-default)" }}
                            />

                            <p
                                className="flex items-center gap-2 text-sm"
                                style={{ color: "var(--text-muted)" }}
                            >
                                <Clock size={14} />
                                Registration closes September 18, 2026
                            </p>

                            <Link
                                href={`/register/${event.id}`}
                                className="btn btn-primary mt-6 w-full justify-center py-3 text-center"
                            >
                                Register now
                            </Link>

                            <p
                                className="mt-4 flex items-center justify-center gap-1.5 text-sm"
                                style={{ color: "var(--text-muted)" }}
                            >
                                <Users size={14} />
                                124 people registered
                            </p>
                        </div>
                    </aside>
                </div>
            </section>
        </main>
    );
}
