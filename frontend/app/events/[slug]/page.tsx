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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEvent = async () => {
            setLoading(true);
            try {
                const res = await makeApiCall(
                    "GET",
                    APIENDPOINT.GetEventBySlug(slug)
                )

                console.log("Event API Response:", res);

                if (res.success && res.data) {
                    console.log("Event Data:", res.data);
                    console.log("Schedules:", res.data.schedules);
                    console.log("Speakers:", res.data.speakers);
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
                className="flex min-h-screen items-center justify-center"
                style={{ background: "var(--bg-page)" }}
            >
                <p style={{ color: "var(--text-secondary)" }}>
                    Loading event...
                </p>
            </main>
        );
    }

    if (!event) {
        return (
            <main
                className="flex min-h-screen items-center justify-center"
                style={{ background: "var(--bg-page)" }}
            >
                <p style={{ color: "var(--text-secondary)" }}>
                    Event not found
                </p>
            </main>
        );
    }

    return (
        <main className="h-screen" style={{ background: "var(--bg-page)" }}>
            <section className="mx-auto max-w-7xl px-6 py-6 lg:px-6">
                <BackgroundImage
                    imageKey={event?.banner_image}
                    className="h-80 w-full rounded-2xl"
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
                                {/* Mode - shows "Online" or value from event.mode */}
                                <div className="flex items-center gap-2">
                                    <MapPin size={18} />
                                    <span>{event?.mode || "Online"}</span>
                                </div>

                                {/* Date - extracted from first schedule */}
                                {event?.schedules && event.schedules.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <Calendar size={18} />
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

                                {/* Time - extracted from first schedule */}
                                {event?.schedules && event.schedules.length > 0 && (
                                    <div className="flex items-center gap-2">
                                        <Clock size={18} />
                                        <span>
                                            {new Date(event.schedules[0].date_time)
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
                        {event?.schedules && Array.isArray(event.schedules) && event.schedules.length > 0 ? (
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
                                            <span className="w-40 flex-shrink-0" style={{ color: "var(--text-muted)" }}>
                                                {new Date(schedule.date_time).toLocaleString()}
                                            </span>
                                            <div>
                                                <span style={{ color: "var(--text-primary)" }}>
                                                    {schedule.title}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ) : (
                            <div style={{ color: "var(--text-muted)" }}>
                                No schedules available
                            </div>
                        )}

                        {/* Speakers Section */}
                        {event?.speakers && Array.isArray(event.speakers) && event.speakers.length > 0 ? (
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
                        ) : (
                            <div style={{ color: "var(--text-muted)" }}>
                                No speakers available
                            </div>
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

                            <Link
                                href={`/register/${event.id}`}
                                className="btn btn-primary mt-6 w-full justify-center py-3 text-center"
                            >
                                Register now
                            </Link>
                        </div>
                    </aside>
                </div>
            </section>
        </main>
    );
}
