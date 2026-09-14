"use client";

import { APIENDPOINT } from "@/config/Backend";
import { useApiCall } from "@/hooks/useApiCall";
import { Submission } from "@/types/event_types";
import { useRouter } from "next/navigation";
import {
    CheckCircle2,
    Clock,
    ExternalLink,
    UploadCloud,
    X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type DragEvent } from "react";

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
    is_event_started: boolean;
    schedules: Schedule[];
}

interface EventTask {
    instructions: string;
    drive_link: string;
}

interface TimeLeft {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
}

function formatBytes(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function StartedEventView({ event, task }: { event: EventData; task: EventTask | null }) {
    const { makeApiCall } = useApiCall();
    const inputRef = useRef<HTMLInputElement>(null);
    const [files, setFiles] = useState<File[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [saving, setSaving] = useState(false);
    const [submission, setSubmission] = useState<Submission | null>(null);
    const [error, setError] = useState("");

    const addFiles = (incoming: FileList | null) => {
        if (!incoming) return;
        setError("");
        setFiles((current) => [...current, ...Array.from(incoming)]);
    };

    useEffect(() => {
        const fetchSubmission = async () => {
            const result = await makeApiCall("GET", APIENDPOINT.GetSubmission(event.id));
            if (result.success && result.data) {
                setSubmission(result.data);
            }
        };

        fetchSubmission();
    }, [event.id, makeApiCall]);

    const saveDraft = async () => {
        setSaving(true);
        setError("");

        try {
            const formData = new FormData();
            files.forEach((file) => formData.append("files", file));
            const result = await makeApiCall("POST", APIENDPOINT.SaveSubmissionDraft(event.id), formData);
            if (!result.success) {
                setError(result.message || "Could not save draft.");
                return false;
            }

            setSubmission(result.data);
            setFiles([]);
            return true;
        } catch {
            setError("Something went wrong while saving the draft.");
            return false;
        } finally {
            setSaving(false);
        }
    };

    const submitWork = async () => {
        if (files.length > 0 && !(await saveDraft())) return;
        setSaving(true);
        setError("");
        const result = await makeApiCall("POST", APIENDPOINT.SubmitSubmission(event.id));
        setSaving(false);
        if (!result.success) {
            setError(result.message || "Save a draft with files before submitting.");
            return;
        }
        setSubmission(result.data);
    };

    const isSubmitted = submission?.status === "submitted";

    return (
        <section className="min-h-screen w-full bg-[var(--bg-page)] px-4 py-8 sm:px-6 lg:px-10">
            <div className="mx-auto max-w-[1100px]">
                <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <span className="badge badge-success">
                            <span className="dot dot-success" />
                            Submissions open
                        </span>
                        <h1 className="mt-3 text-[24px] font-semibold leading-tight text-[var(--text-primary)] sm:text-[28px]">
                            {event.event_name}
                        </h1>
                        <p className="mt-1 max-w-[620px] text-[14px] text-[var(--text-secondary)]">
                            Follow the instructions and submit your completed work.
                        </p>
                    </div>
                    <div className="flex items-center gap-2 rounded-[10px] border border-[var(--border-default)] bg-[var(--bg-surface-raised)] px-3.5 py-2.5">
                        <Clock size={16} className="text-[var(--text-muted)]" />
                        <span className="text-[13px] font-medium text-[var(--text-primary)]">Event started</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    <div className="flex flex-col gap-6 lg:col-span-2">
                        <div className="card">
                            <h2 className="mb-4 text-[15px] font-semibold text-[var(--text-primary)]">Instructions</h2>
                            {task ? (
                                <p className="whitespace-pre-line text-[14px] leading-7 text-[var(--text-secondary)]">{task.instructions}</p>
                            ) : (
                                <p className="text-[14px] text-[var(--text-muted)]">Instructions are not available yet.</p>
                            )}
                        </div>

                        {task?.drive_link && (
                            <div className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <h2 className="text-[15px] font-semibold text-[var(--text-primary)]">Event resources</h2>
                                    <p className="mt-1 text-[13px] text-[var(--text-secondary)]">Open the shared Drive folder to access the required resources.</p>
                                </div>
                                <a href={task.drive_link} target="_blank" rel="noreferrer" className="btn btn-primary justify-center gap-2 whitespace-nowrap">
                                    Open Drive <ExternalLink size={15} />
                                </a>
                            </div>
                        )}
                    </div>

                    <div className="lg:col-span-1">
                        <div className="card lg:sticky lg:top-8">
                            <h2 className="mb-1 text-[15px] font-semibold text-[var(--text-primary)]">Submit your work</h2>
                            <p className="mb-4 text-[13px] text-[var(--text-secondary)]">Upload your final files here.</p>

                            {error && <div className="status-bg-danger mb-4 rounded-[8px] px-3 py-2 text-[13px]">{error}</div>}
                            {isSubmitted && (
                                <div className="status-bg-success mb-4 flex items-center gap-2 rounded-[8px] px-3 py-2 text-[13px]">
                                    <CheckCircle2 size={15} /> Submitted successfully. Further uploads are disabled.
                                </div>
                            )}

                            <div
                                onDragOver={(event) => { event.preventDefault(); setIsDragging(true); }}
                                onDragLeave={() => setIsDragging(false)}
                                onDrop={(event: DragEvent<HTMLDivElement>) => { event.preventDefault(); setIsDragging(false); addFiles(event.dataTransfer.files); }}
                                onClick={() => { if (!isSubmitted) inputRef.current?.click(); }}
                                className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[10px] border-2 border-dashed px-4 py-8 text-center transition-colors ${isDragging ? "border-[var(--color-accent)] bg-[var(--color-accent-light)]" : "border-[var(--border-strong)] hover:bg-[var(--bg-hover)]"}`}
                            >
                                <UploadCloud size={22} className="text-[var(--text-muted)]" />
                                <p className="text-[13px] text-[var(--text-secondary)]"><span className="font-medium text-[var(--text-link)]">Click to upload</span> or drag files in</p>
                                <p className="text-[12px] text-[var(--text-muted)]">PNG, JPG, PDF or ZIP</p>
                                <input disabled={isSubmitted} ref={inputRef} type="file" multiple className="hidden" onChange={(event: ChangeEvent<HTMLInputElement>) => { addFiles(event.target.files); event.target.value = ""; }} />
                            </div>

                            {files.length > 0 && (
                                <div className="mt-4 flex flex-col gap-2">
                                    {files.map((file, index) => (
                                        <div key={`${file.name}-${index}`} className="flex items-center justify-between gap-2 rounded-[8px] bg-[var(--bg-surface-sunken)] px-3 py-2">
                                            <div className="min-w-0">
                                                <p className="truncate text-[12.5px] font-medium text-[var(--text-primary)]">{file.name}</p>
                                                <p className="text-[11px] text-[var(--text-muted)]">{formatBytes(file.size)}</p>
                                            </div>
                                            <button type="button" onClick={() => setFiles((current) => current.filter((_, fileIndex) => fileIndex !== index))} className="flex-shrink-0 text-[var(--text-muted)] hover:text-[var(--text-primary)]" aria-label={`Remove ${file.name}`}>
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {submission?.files?.length ? (
                                <p className="mt-3 text-[12px] text-[var(--text-muted)]">
                                    {submission.files.length} saved file{submission.files.length === 1 ? "" : "s"} in draft.
                                </p>
                            ) : null}

                            <div className="mt-4 grid grid-cols-2 gap-2">
                                <button type="button" onClick={saveDraft} disabled={saving || isSubmitted} className="btn btn-secondary justify-center py-2.5">
                                    {saving ? "Saving..." : "Save draft"}
                                </button>
                                <button type="button" onClick={submitWork} disabled={saving || isSubmitted} className="btn btn-primary justify-center py-2.5">
                                    {saving ? "Submitting..." : "Submit work"}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default function TimerPage() {
    const [event, setEvent] = useState<EventData | null>(null);
    const [eventId, setEventId] = useState("");
    const [slug, setSlug] = useState("");
    const [loading, setLoading] = useState(true);
    const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);
    const [task, setTask] = useState<EventTask | null>(null);

    const { makeApiCall } = useApiCall();
    const router = useRouter();

    useEffect(() => {
        const fetchMe = async () => {
            try {
                const res = await makeApiCall("GET", APIENDPOINT.ME);

                if (res.success && res.data) {
                    const eventSlug = res.data.user?.event_slug ?? "";
                    const authenticatedEventId = res.data.user?.event_id ?? "";
                    setEventId(authenticatedEventId);
                    setSlug(eventSlug);
                    setLoading(false);
                    return;
                }

                if (res.status === 401 || res.status === 403) {
                    window.sessionStorage.removeItem("session_token");
                    router.replace("/events/login");
                } else {
                    setLoading(false);
                }
            } catch (error) {
                console.error("Error fetching user:", error);
                setLoading(false);
            }
        };

        fetchMe();
    }, [makeApiCall, router]);

    useEffect(() => {
        if (!eventId && !slug) return;

        const fetchEvent = async () => {
            setLoading(true);

            try {
                const endpoint = eventId
                    ? APIENDPOINT.GetEventByID(eventId)
                    : APIENDPOINT.GetEventBySlug(slug);
                const res = await makeApiCall("GET", endpoint);

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
    }, [eventId, slug, makeApiCall]);

    useEffect(() => {
        if (!event?.is_event_started) return;

        const fetchTask = async () => {
            const res = await makeApiCall("GET", APIENDPOINT.GetEventTask(event.id));
            if (res.success && res.data) setTask(res.data);
        };

        fetchTask();
    }, [event, makeApiCall]);

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

    if (event.is_event_started) {
        return <StartedEventView event={event} task={task} />;
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
