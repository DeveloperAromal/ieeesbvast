"use client";

import { APIENDPOINT } from "@/config/Backend";
import { useApiCall } from "@/hooks/useApiCall";
import {
    CalendarClock,
    FileText,
    ImagePlus,
    Plus,
    Trash2,
    Users,
    X,
} from "lucide-react";
import { useCallback, useRef, useState } from "react";
import type { ComponentType, SVGProps } from "react";

interface SpeakerForm {
    name: string;
    designation: string;
    company: string;
    imageFile: File | null;
    imagePreview: string | null;
}

interface ScheduleForm {
    title: string;
    startTime: string;
    endTime: string;
}

const emptySpeaker = (): SpeakerForm => ({
    name: "",
    designation: "",
    company: "",
    imageFile: null,
    imagePreview: null,
});

const emptySchedule = (): ScheduleForm => ({
    title: "",
    startTime: "",
    endTime: "",
});

const slugify = (value: string) =>
    value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");

const DUMMY_UPLOAD_ENDPOINT = `${APIENDPOINT.CreateEvent.replace(
    "/events",
    "/uploads",
)}`;

function SectionCard({
    icon: Icon,
    title,
    description,
    children,
}: {
    icon: ComponentType<SVGProps<SVGSVGElement>>;
    title: string;
    description?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="rounded-2xl border border-border bg-[var(--bg-surface)] p-8 shadow-[var(--card-shadow)]">
            <div className="mb-6 flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--color-accent-light)] text-[var(--color-accent)]">
                    <Icon className="h-[18px] w-[18px]" />
                </div>
                <div>
                    <h2 className="text-base font-semibold text-foreground">{title}</h2>
                    {description && (
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            {description}
                        </p>
                    )}
                </div>
            </div>
            {children}
        </div>
    );
}

function Field({
    label,
    htmlFor,
    children,
    required,
}: {
    label: string;
    htmlFor?: string;
    children: React.ReactNode;
    required?: boolean;
}) {
    return (
        <div className="flex flex-col gap-1.5">
            <label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
                {label}
                {required && <span className="ml-0.5 text-destructive">*</span>}
            </label>
            {children}
        </div>
    );
}

function IndexBadge({ index }: { index: number }) {
    return (
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[var(--color-accent-light)] text-xs font-semibold text-[var(--color-accent)]">
            {index + 1}
        </span>
    );
}

function IconButton({
    onClick,
    label,
}: {
    onClick: () => void;
    label: string;
}) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-[var(--danger-bg)] hover:text-[var(--danger-text)]"
        >
            <Trash2 className="h-4 w-4" />
        </button>
    );
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
        >
            <Plus className="h-4 w-4" />
            {label}
        </button>
    );
}

function ImageUploadWidget({
    label,
    file,
    preview,
    onSelect,
    onClear,
    aspect = "aspect-video",
}: {
    label: string;
    file: File | null;
    preview: string | null;
    onSelect: (file: File) => void;
    onClear: () => void;
    aspect?: string;
}) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const handleFiles = (files: FileList | null) => {
        const selected = files?.[0];
        if (selected && selected.type.startsWith("image/")) {
            onSelect(selected);
        }
    };

    return (
        <div className="flex flex-col gap-1.5">
            <span className="text-sm font-medium text-foreground">{label}</span>
            <div
                onClick={() => inputRef.current?.click()}
                onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    handleFiles(e.dataTransfer.files);
                }}
                className={`relative flex ${aspect} w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border transition-colors ${isDragging
                    ? "border-[var(--color-accent)] bg-[var(--color-accent-light)]"
                    : "border-border bg-[var(--bg-surface-sunken)] hover:border-[var(--border-strong)]"
                    }`}
            >
                {preview ? (
                    <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={preview}
                            alt={label}
                            className="h-full w-full object-cover"
                        />
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                onClear();
                            }}
                            className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-background"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </>
                ) : (
                    <div className="flex flex-col items-center gap-2 px-4 text-center">
                        <ImagePlus className="h-5 w-5 text-muted-foreground" />
                        <span className="text-sm font-medium text-muted-foreground">
                            Click or drop an image
                        </span>
                        <span className="text-xs text-muted-foreground/70">
                            PNG, JPG up to 5MB
                        </span>
                    </div>
                )}
            </div>
            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFiles(e.target.files)}
            />
            {file && (
                <span className="truncate text-xs text-muted-foreground">
                    {file.name}
                </span>
            )}
        </div>
    );
}

export default function CreateEvent() {
    const { makeApiCall, isLoading } = useApiCall();

    const [eventName, setEventName] = useState("");
    const [eventSlug, setEventSlug] = useState("");
    const [slugTouched, setSlugTouched] = useState(false);
    const [description, setDescription] = useState("");

    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);
    const [posterFile, setPosterFile] = useState<File | null>(null);
    const [posterPreview, setPosterPreview] = useState<string | null>(null);

    const [speakers, setSpeakers] = useState<SpeakerForm[]>([emptySpeaker()]);
    const [schedules, setSchedules] = useState<ScheduleForm[]>([
        emptySchedule(),
    ]);

    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleNameChange = (value: string) => {
        setEventName(value);
        if (!slugTouched) setEventSlug(slugify(value));
    };

    const updateSpeaker = (index: number, patch: Partial<SpeakerForm>) => {
        setSpeakers((prev) =>
            prev.map((s, i) => (i === index ? { ...s, ...patch } : s)),
        );
    };

    const updateSchedule = (index: number, patch: Partial<ScheduleForm>) => {
        setSchedules((prev) =>
            prev.map((s, i) => (i === index ? { ...s, ...patch } : s)),
        );
    };

    const uploadImage = useCallback(
        async (file: File): Promise<string | null> => {
            const formData = new FormData();
            formData.append("file", file);

            const result = await makeApiCall(
                "POST",
                DUMMY_UPLOAD_ENDPOINT,
                formData,
            );

            if (result.success) {
                const uploaded = result.data as { url?: string } | null;
                return uploaded?.url ?? null;
            }
            return null;
        },
        [makeApiCall],
    );

    const addSpeaker = () => setSpeakers((prev) => [...prev, emptySpeaker()]);
    const removeSpeaker = (index: number) =>
        setSpeakers((prev) => prev.filter((_, i) => i !== index));

    const addSchedule = () => setSchedules((prev) => [...prev, emptySchedule()]);
    const removeSchedule = (index: number) =>
        setSchedules((prev) => prev.filter((_, i) => i !== index));

    const resetForm = () => {
        setEventName("");
        setEventSlug("");
        setSlugTouched(false);
        setDescription("");
        setBannerFile(null);
        setBannerPreview(null);
        setPosterFile(null);
        setPosterPreview(null);
        setSpeakers([emptySpeaker()]);
        setSchedules([emptySchedule()]);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (!eventName.trim() || !eventSlug.trim()) {
            setError("Event name and slug are required.");
            return;
        }

        const [bannerUrl, posterUrl] = await Promise.all([
            bannerFile ? uploadImage(bannerFile) : Promise.resolve(null),
            posterFile ? uploadImage(posterFile) : Promise.resolve(null),
        ]);

        const eventResult = await makeApiCall("POST", APIENDPOINT.CreateEvent, {
            event_name: eventName.trim(),
            event_slug: eventSlug.trim(),
            description: description.trim(),
            banner_image: bannerUrl ?? "",
            poster_image: posterUrl ?? "",
        });

        if (!eventResult.success) {
            setError(eventResult.message ?? "Failed to create event.");
            return;
        }

        const createdEvent = eventResult.data as { id?: string } | null;
        const eventId = createdEvent?.id;

        if (!eventId) {
            setError("Event created, but no event ID was returned by the server.");
            return;
        }

        const speakerCalls = speakers
            .filter((s) => s.name.trim())
            .map(async (speaker) => {
                const imageUrl = speaker.imageFile
                    ? await uploadImage(speaker.imageFile)
                    : null;

                return makeApiCall("POST", APIENDPOINT.CreateSpeaker, {
                    event_id: eventId,
                    name: speaker.name.trim(),
                    designation: speaker.designation.trim(),
                    company: speaker.company.trim(),
                    image: imageUrl ?? "",
                });
            });

        const scheduleCalls = schedules
            .filter((s) => s.title.trim())
            .map((schedule) =>
                makeApiCall("POST", APIENDPOINT.CreateSchedule, {
                    event_id: eventId,
                    title: schedule.title.trim(),
                    start_time: schedule.startTime,
                    end_time: schedule.endTime,
                }),
            );

        const results = await Promise.all([...speakerCalls, ...scheduleCalls]);
        const failed = results.filter((r) => !r.success);

        if (failed.length > 0) {
            setError(
                `Event created, but ${failed.length} related item(s) failed to save.`,
            );
            return;
        }

        setSuccessMessage("Event created successfully.");
        resetForm();
    };

    return (
        <section className="flex flex-col gap-8 px-6 py-12 font-sans">
            <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)]">
                    New event
                </span>
                <h1 className="mt-1 text-3xl font-semibold tracking-tight text-foreground">
                    Create event
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Fill in the event details, add speakers and a schedule, then
                    publish.
                </p>
            </div>

            {error && (
                <div className="rounded-xl border border-[var(--danger-border)] bg-[var(--danger-bg)] px-4 py-3 text-sm text-[var(--danger-text)]">
                    {error}
                </div>
            )}
            {successMessage && (
                <div className="rounded-xl border border-[var(--success-border)] bg-[var(--success-bg)] px-4 py-3 text-sm text-[var(--success-text)]">
                    {successMessage}
                </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                <SectionCard icon={FileText} title="Event details">
                    <div className="">
                        <Field label="Event name" htmlFor="event-name" required>
                            <input
                                id="event-name"
                                className="input w-full"
                                value={eventName}
                                onChange={(e) => handleNameChange(e.target.value)}
                                placeholder="Annual Tech Summit"
                                required
                            />
                        </Field>
                    </div>

                    <div className="mt-4">
                        <Field label="Description" htmlFor="event-description">
                            <textarea
                                id="event-description"
                                className="input min-h-[100px] w-full resize-y"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="What is this event about?"
                            />
                        </Field>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <ImageUploadWidget
                            label="Banner image"
                            file={bannerFile}
                            preview={bannerPreview}
                            onSelect={(file) => {
                                setBannerFile(file);
                                setBannerPreview(URL.createObjectURL(file));
                            }}
                            onClear={() => {
                                setBannerFile(null);
                                setBannerPreview(null);
                            }}
                        />
                        <ImageUploadWidget
                            label="Poster image"
                            file={posterFile}
                            preview={posterPreview}
                            onSelect={(file) => {
                                setPosterFile(file);
                                setPosterPreview(URL.createObjectURL(file));
                            }}
                            onClear={() => {
                                setPosterFile(null);
                                setPosterPreview(null);
                            }}
                            aspect="aspect-[3/4]"
                        />
                    </div>
                </SectionCard>

                <SectionCard
                    icon={Users}
                    title="Speakers"
                    description="Add the people speaking at this event."
                >
                    <div className="flex flex-col gap-4">
                        {speakers.map((speaker, index) => (
                            <div
                                key={index}
                                className="rounded-xl border border-border bg-[var(--bg-surface-sunken)] p-4"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <IndexBadge index={index} />
                                        <span className="text-sm font-medium text-muted-foreground">
                                            Speaker
                                        </span>
                                    </div>
                                    {speakers.length > 1 && (
                                        <IconButton
                                            onClick={() => removeSpeaker(index)}
                                            label="Remove speaker"
                                        />
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_2fr]">
                                    <ImageUploadWidget
                                        label="Photo"
                                        file={speaker.imageFile}
                                        preview={speaker.imagePreview}
                                        onSelect={(file) =>
                                            updateSpeaker(index, {
                                                imageFile: file,
                                                imagePreview: URL.createObjectURL(file),
                                            })
                                        }
                                        onClear={() =>
                                            updateSpeaker(index, {
                                                imageFile: null,
                                                imagePreview: null,
                                            })
                                        }
                                        aspect="aspect-square"
                                    />

                                    <div className="flex flex-col gap-3">
                                        <Field label="Name">
                                            <input
                                                className="input w-full"
                                                value={speaker.name}
                                                onChange={(e) =>
                                                    updateSpeaker(index, { name: e.target.value })
                                                }
                                                placeholder="Jane Doe"
                                            />
                                        </Field>
                                        <Field label="Designation">
                                            <input
                                                className="input w-full"
                                                value={speaker.designation}
                                                onChange={(e) =>
                                                    updateSpeaker(index, {
                                                        designation: e.target.value,
                                                    })
                                                }
                                                placeholder="Engineering Lead"
                                            />
                                        </Field>
                                        <Field label="Company">
                                            <input
                                                className="input w-full"
                                                value={speaker.company}
                                                onChange={(e) =>
                                                    updateSpeaker(index, { company: e.target.value })
                                                }
                                                placeholder="Acme Inc."
                                            />
                                        </Field>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <AddButton onClick={addSpeaker} label="Add speaker" />
                    </div>
                </SectionCard>

                <SectionCard
                    icon={CalendarClock}
                    title="Schedule"
                    description="Lay out the agenda for the event."
                >
                    <div className="flex flex-col gap-4">
                        {schedules.map((schedule, index) => (
                            <div
                                key={index}
                                className="rounded-xl border border-border bg-[var(--bg-surface-sunken)] p-4"
                            >
                                <div className="mb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <IndexBadge index={index} />
                                        <span className="text-sm font-medium text-muted-foreground">
                                            Session
                                        </span>
                                    </div>
                                    {schedules.length > 1 && (
                                        <IconButton
                                            onClick={() => removeSchedule(index)}
                                            label="Remove session"
                                        />
                                    )}
                                </div>

                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-[2fr_1fr_1fr]">
                                    <Field label="Title">
                                        <input
                                            className="input w-full"
                                            value={schedule.title}
                                            onChange={(e) =>
                                                updateSchedule(index, { title: e.target.value })
                                            }
                                            placeholder="Opening keynote"
                                        />
                                    </Field>
                                    <Field label="Start time">
                                        <input
                                            type="time"
                                            className="input w-full"
                                            value={schedule.startTime}
                                            onChange={(e) =>
                                                updateSchedule(index, { startTime: e.target.value })
                                            }
                                        />
                                    </Field>
                                    <Field label="End time">
                                        <input
                                            type="time"
                                            className="input w-full"
                                            value={schedule.endTime}
                                            onChange={(e) =>
                                                updateSchedule(index, { endTime: e.target.value })
                                            }
                                        />
                                    </Field>
                                </div>
                            </div>
                        ))}

                        <AddButton onClick={addSchedule} label="Add schedule item" />
                    </div>
                </SectionCard>

                <div className="sticky bottom-0 -mx-6 flex items-center justify-end border-t border-border bg-background/80 px-6 py-4 backdrop-blur">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="btn btn-primary px-6 py-2.5"
                    >
                        {isLoading ? "Creating..." : "Create event"}
                    </button>
                </div>
            </form>
        </section>
    );
}