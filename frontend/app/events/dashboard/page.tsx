"use client";

import { APIENDPOINT } from "@/config/Backend";
import { useApiCall } from "@/hooks/useApiCall";
import { useEffect, useMemo, useState } from "react";

interface Schedule {
    id: string;
    event_id: string;
    title: string;
    date_time: string;
}

interface EventData {
    id: string;
    event_name: string;
    event_slug: string;
    description: string;
    banner_image: string;
    poster_image: string;
    is_reg_closed: boolean;
    schedules: Schedule[];
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

export default function TimerPage() {
    const [event, setEvent] = useState<EventData | null>(null);
    const [slug, setSlug] = useState("");
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

    const { makeApiCall } = useApiCall();

    useEffect(() => {
        const fetchMe = async () => {
            try {
                const res = await makeApiCall("GET", APIENDPOINT.ME);

                if (res.success && res.data) {
                    const eventSlug = res.data.user?.event_slug ?? "";
                    setSlug(eventSlug);
                }
            } catch (error) {
                console.error("Error fetching user:", error);
            }
        };

        fetchMe();
    }, [makeApiCall]);

    useEffect(() => {
        if (!slug) return;

        const fetchEvent = async () => {
            setLoading(true);

            try {
                const res = await makeApiCall("GET", APIENDPOINT.GetEventBySlug(slug));

                if (res.success && res.data) {
                    setEvent(res.data);
                }
            } catch (error) {
                console.error("Error fetching event:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchEvent();
    }, [slug, makeApiCall]);

    const assetsSchedule = useMemo(() => {
        if (!event?.schedules) {
            return null;
        }

        return event.schedules.find(
            (schedule) => schedule.title.toLowerCase() === "raw assets released"
        );
    }, [event]);

    useEffect(() => {
        if (!assetsSchedule) return;

        const targetTime = new Date(assetsSchedule.date_time).getTime();

        const updateTimer = () => {
            const now = Date.now();
            const difference = targetTime - now;

            if (difference <= 0) {
                setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
                return;
            }

            const totalSeconds = Math.floor(difference / 1000);
            const days = Math.floor(totalSeconds / (60 * 60 * 24));
            const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
            const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
            const seconds = totalSeconds % 60;

            setTimeLeft({ days, hours, minutes, seconds });
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => {
            clearInterval(interval);
        };
    }, [assetsSchedule]);

    if (loading) {
        return (
            <section className="min-h-screen flex items-center justify-center bg-[var(--bg-page)]">
                <p className="text-[14px] text-[var(--text-secondary)]">Loading...</p>
            </section>
        );
    }

    if (!event) {
        return (
            <section className="min-h-screen flex items-center justify-center bg-[var(--bg-page)]">
                <p className="text-[14px] text-[var(--text-secondary)]">Event not found.</p>
            </section>
        );
    }

    if (!assetsSchedule) {
        return (
            <section className="min-h-screen flex items-center justify-center bg-[var(--bg-page)]">
                <p className="text-[14px] text-[var(--text-secondary)]">
                    Assets release schedule not found.
                </p>
            </section>
        );
    }

    const assetsReleased =
        timeLeft &&
        timeLeft.days === 0 &&
        timeLeft.hours === 0 &&
        timeLeft.minutes === 0 &&
        timeLeft.seconds === 0;

    return (
        <section className="min-h-screen flex items-center justify-center bg-[var(--bg-page)] px-4 sm:px-6">
            <div className="w-full max-w-5xl text-center">
                <p className="text-[11px] sm:text-[13px] uppercase tracking-[0.2em] sm:tracking-[0.3em] text-[var(--text-muted)] mb-3 sm:mb-4">
                    {event.event_name}
                </p>

                <h1 className="text-[28px] leading-tight sm:text-4xl md:text-6xl font-bold text-[var(--text-primary)] mb-4">
                    {assetsReleased ? "Assets Are Now Available!" : "Raw Assets Release In"}
                </h1>

                {!assetsReleased && timeLeft && (
                    <div className="card !p-0 max-w-xl mx-auto mt-8 sm:mt-10 overflow-hidden">
                        <div className="flex divide-x divide-[var(--border-default)]">
                            <div className="flex-1 flex flex-col items-center justify-center py-4 sm:py-6 md:py-8 px-1">
                                <div className="text-3xl sm:text-5xl md:text-6xl font-bold tabular-nums text-[var(--text-primary)] leading-none">
                                    {String(timeLeft.days).padStart(2, "0")}
                                </div>
                                <div className="mt-2 text-[10px] sm:text-[12px] uppercase tracking-widest text-[var(--text-muted)]">
                                    Days
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col items-center justify-center py-4 sm:py-6 md:py-8 px-1">
                                <div className="text-3xl sm:text-5xl md:text-6xl font-bold tabular-nums text-[var(--text-primary)] leading-none">
                                    {String(timeLeft.hours).padStart(2, "0")}
                                </div>
                                <div className="mt-2 text-[10px] sm:text-[12px] uppercase tracking-widest text-[var(--text-muted)]">
                                    Hours
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col items-center justify-center py-4 sm:py-6 md:py-8 px-1">
                                <div className="text-3xl sm:text-5xl md:text-6xl font-bold tabular-nums text-[var(--text-primary)] leading-none">
                                    {String(timeLeft.minutes).padStart(2, "0")}
                                </div>
                                <div className="mt-2 text-[10px] sm:text-[12px] uppercase tracking-widest text-[var(--text-muted)]">
                                    Minutes
                                </div>
                            </div>

                            <div className="flex-1 flex flex-col items-center justify-center py-4 sm:py-6 md:py-8 px-1">
                                <div className="text-3xl sm:text-5xl md:text-6xl font-bold tabular-nums text-[var(--color-accent)] leading-none">
                                    {String(timeLeft.seconds).padStart(2, "0")}
                                </div>
                                <div className="mt-2 text-[10px] sm:text-[12px] uppercase tracking-widest text-[var(--text-muted)]">
                                    Seconds
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {assetsReleased && (
                    <div className="mt-8 sm:mt-10">
                        <p className="text-[14px] sm:text-[16px] text-[var(--text-secondary)] px-2">
                            The raw assets for{" "}
                            <span className="font-semibold text-[var(--text-primary)]">
                                {event.event_name}
                            </span>{" "}
                            are now available for download.
                        </p>

                        <button
                            className="btn btn-primary mt-6 sm:mt-8 w-full sm:w-auto justify-center px-6 sm:px-8 py-3 sm:py-4 text-[14px] sm:text-[15px]"
                            onClick={() => {
                                console.log("Download assets");
                            }}
                        >
                            Download Assets
                        </button>
                    </div>
                )}

                <p className="mt-8 sm:mt-10 text-[12px] sm:text-[13px] text-[var(--text-muted)] px-2">
                    Release time: {new Date(assetsSchedule.date_time).toLocaleString()}
                </p>
            </div>
        </section>
    );
}