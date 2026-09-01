// "use client";

// import { APIENDPOINT } from "@/config/Backend";
// import { useApiCall } from "@/hooks/useApiCall";
// import { AdminSidebar } from "@/components/AdminSidebar";
// import {
//     CalendarClock,
//     ImagePlus,
//     Plus,
//     Trash2,
//     Upload,
//     Users,
//     X,
// } from "lucide-react";
// import {
//     useCallback,
//     useEffect,
//     useRef,
//     useState,
//     type ChangeEvent,
//     type DragEvent,
//     type ReactNode,
// } from "react";

// interface SpeakerForm {
//     name: string;
//     designation: string;
//     company: string;
//     imageFile: File | null;
//     imagePreview: string | null;
// }

// interface ScheduleForm {
//     title: string;
//     dateTime: string;
// }

// interface UploadResponse {
//     key?: string;
// }

// const emptySpeaker = (): SpeakerForm => ({
//     name: "",
//     designation: "",
//     company: "",
//     imageFile: null,
//     imagePreview: null,
// });

// const emptySchedule = (): ScheduleForm => ({
//     title: "",
//     dateTime: "",
// });

// const slugify = (value: string) =>
//     value
//         .toLowerCase()
//         .trim()
//         .replace(/[^a-z0-9\s-]/g, "")
//         .replace(/\s+/g, "-")
//         .replace(/-+/g, "-");

// function FormField({
//     label,
//     htmlFor,
//     required,
//     children,
// }: {
//     label: string;
//     htmlFor?: string;
//     required?: boolean;
//     children: ReactNode;
// }) {
//     return (
//         <div className="flex flex-col gap-2">
//             <label
//                 htmlFor={htmlFor}
//                 className="text-sm font-medium text-text-secondary"
//             >
//                 {label}
//                 {required && (
//                     <span className="ml-1 text-color-accent">*</span>
//                 )}
//             </label>
//             {children}
//         </div>
//     );
// }

// function SectionTitle({
//     icon: Icon,
//     title,
//     description,
// }: {
//     icon: typeof Users;
//     title: string;
//     description?: string;
// }) {
//     return (
//         <div className="mb-7">
//             <div className="flex items-center gap-3">
//                 <Icon className="h-5 w-5 text-color-accent" />

//                 <h2 className="text-xl font-medium tracking-tight text-text-primary">
//                     {title}
//                 </h2>
//             </div>

//             {description && (
//                 <p className="mt-2 text-sm text-text-muted">
//                     {description}
//                 </p>
//             )}
//         </div>
//     );
// }

// function RemoveButton({
//     label,
//     onClick,
// }: {
//     label: string;
//     onClick: () => void;
// }) {
//     return (
//         <button
//             type="button"
//             onClick={onClick}
//             aria-label={label}
//             className="inline-flex h-9 w-9 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-danger-bg hover:text-danger-text"
//         >
//             <Trash2 className="h-4 w-4" />
//         </button>
//     );
// }

// function AddButton({
//     label,
//     onClick,
// }: {
//     label: string;
//     onClick: () => void;
// }) {
//     return (
//         <button
//             type="button"
//             onClick={onClick}
//             className="inline-flex items-center gap-2 py-2 text-sm font-medium text-text-link transition-colors hover:text-text-link-hover"
//         >
//             <Plus className="h-4 w-4" />
//             {label}
//         </button>
//     );
// }

// function ImageUpload({
//     label,
//     file,
//     preview,
//     onSelect,
//     onClear,
//     variant = "wide",
// }: {
//     label: string;
//     file: File | null;
//     preview: string | null;
//     onSelect: (file: File) => void;
//     onClear: () => void;
//     variant?: "wide" | "square" | "poster";
// }) {
//     const inputRef = useRef<HTMLInputElement>(null);
//     const [dragging, setDragging] = useState(false);

//     const dimensions = {
//         wide: "aspect-[16/7]",
//         square: "aspect-square",
//         poster: "aspect-[3/4]",
//     };

//     const handleFiles = (files: FileList | null) => {
//         const selectedFile = files?.[0];

//         if (!selectedFile) {
//             return;
//         }

//         if (!selectedFile.type.startsWith("image/")) {
//             return;
//         }

//         if (selectedFile.size > 5 * 1024 * 1024) {
//             return;
//         }

//         onSelect(selectedFile);
//     };

//     const handleDrop = (event: DragEvent<HTMLDivElement>) => {
//         event.preventDefault();
//         setDragging(false);
//         handleFiles(event.dataTransfer.files);
//     };

//     const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
//         handleFiles(event.target.files);
//         event.target.value = "";
//     };

//     return (
//         <div className="flex flex-col gap-2">
//             <span className="text-sm font-medium text-text-secondary">
//                 {label}
//             </span>

//             <div
//                 role="button"
//                 tabIndex={0}
//                 onClick={() => inputRef.current?.click()}
//                 onKeyDown={(event) => {
//                     if (event.key === "Enter" || event.key === " ") {
//                         event.preventDefault();
//                         inputRef.current?.click();
//                     }
//                 }}
//                 onDragOver={(event) => {
//                     event.preventDefault();
//                     setDragging(true);
//                 }}
//                 onDragLeave={() => setDragging(false)}
//                 onDrop={handleDrop}
//                 className={`relative flex ${dimensions[variant]} cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-border-default bg-bg-surface transition-colors ${dragging
//                         ? "ring-2 ring-color-accent ring-offset-2"
//                         : "hover:bg-color-accent-light"
//                     }`}
//             >
//                 {preview ? (
//                     <>
//                         <img
//                             src={preview}
//                             alt={label}
//                             className="h-full w-full object-cover"
//                         />

//                         <button
//                             type="button"
//                             onClick={(event) => {
//                                 event.stopPropagation();
//                                 onClear();
//                             }}
//                             aria-label={`Remove ${label}`}
//                             className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80"
//                         >
//                             <X className="h-4 w-4" />
//                         </button>
//                     </>
//                 ) : (
//                     <div className="flex flex-col items-center gap-2 px-5 text-center">
//                         <ImagePlus className="h-5 w-5 text-color-accent" />

//                         <span className="text-sm font-medium text-text-secondary">
//                             Add image
//                         </span>

//                         <span className="text-xs text-text-muted">
//                             PNG or JPG, maximum 5MB
//                         </span>
//                     </div>
//                 )}
//             </div>

//             <input
//                 ref={inputRef}
//                 type="file"
//                 accept="image/*"
//                 className="hidden"
//                 onChange={handleChange}
//             />

//             {file && (
//                 <span className="truncate text-xs text-text-muted">
//                     {file.name}
//                 </span>
//             )}
//         </div>
//     );
// }

// export default function CreateEvent() {
//     const { makeApiCall, isLoading } = useApiCall();

//     const [eventName, setEventName] = useState("");
//     const [eventSlug, setEventSlug] = useState("");
//     const [slugTouched, setSlugTouched] = useState(false);
//     const [description, setDescription] = useState("");

//     const [bannerFile, setBannerFile] = useState<File | null>(null);
//     const [bannerPreview, setBannerPreview] = useState<string | null>(null);

//     const [posterFile, setPosterFile] = useState<File | null>(null);
//     const [posterPreview, setPosterPreview] = useState<string | null>(null);

//     const [speakers, setSpeakers] = useState<SpeakerForm[]>([
//         emptySpeaker(),
//     ]);

//     const [schedules, setSchedules] = useState<ScheduleForm[]>([
//         emptySchedule(),
//     ]);

//     const [error, setError] = useState<string | null>(null);
//     const [successMessage, setSuccessMessage] = useState<string | null>(null);
//     const [isUploading, setIsUploading] = useState(false);

//     useEffect(() => {
//         return () => {
//             if (bannerPreview) {
//                 URL.revokeObjectURL(bannerPreview);
//             }

//             if (posterPreview) {
//                 URL.revokeObjectURL(posterPreview);
//             }

//             speakers.forEach((speaker) => {
//                 if (speaker.imagePreview) {
//                     URL.revokeObjectURL(speaker.imagePreview);
//                 }
//             });
//         };
//     }, [bannerPreview, posterPreview, speakers]);

//     const createPreview = (
//         file: File,
//         previousPreview: string | null,
//     ) => {
//         if (previousPreview) {
//             URL.revokeObjectURL(previousPreview);
//         }

//         return URL.createObjectURL(file);
//     };

//     const handleNameChange = (value: string) => {
//         setEventName(value);

//         if (!slugTouched) {
//             setEventSlug(slugify(value));
//         }
//     };

//     const updateSpeaker = (
//         index: number,
//         patch: Partial<SpeakerForm>,
//     ) => {
//         setSpeakers((currentSpeakers) =>
//             currentSpeakers.map((speaker, speakerIndex) =>
//                 speakerIndex === index
//                     ? { ...speaker, ...patch }
//                     : speaker,
//             ),
//         );
//     };

//     const updateSchedule = (
//         index: number,
//         patch: Partial<ScheduleForm>,
//     ) => {
//         setSchedules((currentSchedules) =>
//             currentSchedules.map((schedule, scheduleIndex) =>
//                 scheduleIndex === index
//                     ? { ...schedule, ...patch }
//                     : schedule,
//             ),
//         );
//     };

//     const addSpeaker = () => {
//         setSpeakers((currentSpeakers) => [
//             ...currentSpeakers,
//             emptySpeaker(),
//         ]);
//     };

//     const removeSpeaker = (index: number) => {
//         setSpeakers((currentSpeakers) => {
//             const speaker = currentSpeakers[index];

//             if (speaker?.imagePreview) {
//                 URL.revokeObjectURL(speaker.imagePreview);
//             }

//             return currentSpeakers.filter(
//                 (_, speakerIndex) => speakerIndex !== index,
//             );
//         });
//     };

//     const addSchedule = () => {
//         setSchedules((currentSchedules) => [
//             ...currentSchedules,
//             emptySchedule(),
//         ]);
//     };

//     const removeSchedule = (index: number) => {
//         setSchedules((currentSchedules) =>
//             currentSchedules.filter(
//                 (_, scheduleIndex) => scheduleIndex !== index,
//             ),
//         );
//     };

//     const uploadImage = useCallback(
//         async (file: File): Promise<string | null> => {
//             const formData = new FormData();
//             formData.append("file", file);

//             const result = await makeApiCall(
//                 "POST",
//                 APIENDPOINT.UploadFile,
//                 formData,
//             );

//             if (!result.success) {
//                 return null;
//             }

//             const uploaded = result.data as UploadResponse | null;

//             return uploaded?.key ?? null;
//         },
//         [makeApiCall],
//     );

//     const resetForm = () => {
//         if (bannerPreview) {
//             URL.revokeObjectURL(bannerPreview);
//         }

//         if (posterPreview) {
//             URL.revokeObjectURL(posterPreview);
//         }

//         speakers.forEach((speaker) => {
//             if (speaker.imagePreview) {
//                 URL.revokeObjectURL(speaker.imagePreview);
//             }
//         });

//         setEventName("");
//         setEventSlug("");
//         setSlugTouched(false);
//         setDescription("");

//         setBannerFile(null);
//         setBannerPreview(null);

//         setPosterFile(null);
//         setPosterPreview(null);

//         setSpeakers([emptySpeaker()]);
//         setSchedules([emptySchedule()]);
//     };

//     const handleSubmit = async (
//         event: React.FormEvent<HTMLFormElement>,
//     ) => {
//         event.preventDefault();

//         setError(null);
//         setSuccessMessage(null);

//         if (!eventName.trim() || !eventSlug.trim()) {
//             setError("Event name and event slug are required.");
//             return;
//         }

//         setIsUploading(true);

//         try {
//             const [bannerKey, posterKey] = await Promise.all([
//                 bannerFile
//                     ? uploadImage(bannerFile)
//                     : Promise.resolve(null),
//                 posterFile
//                     ? uploadImage(posterFile)
//                     : Promise.resolve(null),
//             ]);

//             if (bannerFile && !bannerKey) {
//                 setError("Unable to upload the banner image.");
//                 return;
//             }

//             if (posterFile && !posterKey) {
//                 setError("Unable to upload the poster image.");
//                 return;
//             }

//             const eventResult = await makeApiCall(
//                 "POST",
//                 APIENDPOINT.CreateEvent,
//                 {
//                     event_name: eventName.trim(),
//                     event_slug: eventSlug.trim(),
//                     description: description.trim(),

//                     banner_image: bannerKey ?? "",
//                     poster_image: posterKey ?? "",
//                 },
//             );

//             if (!eventResult.success) {
//                 setError(
//                     eventResult.message ??
//                     "Unable to create the event.",
//                 );
//                 return;
//             }

//             const createdEvent = eventResult.data as {
//                 id?: string;
//             } | null;

//             const eventId = createdEvent?.id;

//             if (!eventId) {
//                 setError(
//                     "The event was created but no event ID was returned.",
//                 );
//                 return;
//             }

//             const speakerRequests = speakers
//                 .filter((speaker) => speaker.name.trim())
//                 .map(async (speaker) => {
//                     const imageKey = speaker.imageFile
//                         ? await uploadImage(speaker.imageFile)
//                         : null;

//                     if (speaker.imageFile && !imageKey) {
//                         return {
//                             success: false,
//                             message: `Unable to upload the image for ${speaker.name}.`,
//                         };
//                     }

//                     return makeApiCall(
//                         "POST",
//                         APIENDPOINT.CreateSpeaker,
//                         {
//                             event_id: eventId,
//                             name: speaker.name.trim(),
//                             designation: speaker.designation.trim(),
//                             company: speaker.company.trim(),

//                             image: imageKey ?? "",
//                         },
//                     );
//                 });

//             const scheduleRequests = schedules
//                 .filter((schedule) => schedule.title.trim())
//                 .map((schedule) =>
//                     makeApiCall(
//                         "POST",
//                         APIENDPOINT.CreateSchedule,
//                         {
//                             event_id: eventId,
//                             title: schedule.title.trim(),
//                             date_time: schedule.dateTime,
//                         },
//                     ),
//                 );

//             const results = await Promise.all([
//                 ...speakerRequests,
//                 ...scheduleRequests,
//             ]);

//             const failedRequests = results.filter(
//                 (result) => !result.success,
//             );

//             if (failedRequests.length > 0) {
//                 setError(
//                     `Event created, but ${failedRequests.length} related item(s) could not be saved.`,
//                 );
//                 return;
//             }

//             setSuccessMessage("Event created successfully.");
//             resetForm();
//         } catch {
//             setError(
//                 "Something went wrong while creating the event.",
//             );
//         } finally {
//             setIsUploading(false);
//         }
//     };

//     const submitting = isLoading || isUploading;

//     return (
//         <div className="flex min-h-screen" style={{ background: "var(--bg-page)" }}>
//             <AdminSidebar />
//             <main className="flex-1 px-4 py-8 font-sans text-text-primary sm:px-6 sm:py-12">
//                 <div className="mx-auto max-w-3xl">
//                     <div className="mb-8 overflow-hidden rounded-xl border border-card-border bg-bg-surface-raised shadow-sm">
//                         <div className="h-2 bg-color-accent" />

//                         <div className="px-6 py-7 sm:px-9">
//                             <p className="text-xs font-semibold uppercase tracking-[0.16em] text-color-accent">
//                                 Event management
//                             </p>

//                             <h1 className="mt-3 text-3xl font-semibold tracking-tight text-text-primary">
//                                 Create event
//                             </h1>

//                             <p className="mt-3 max-w-xl text-sm leading-6 text-text-muted">
//                                 Add the event information, speakers, images,
//                                 and agenda.
//                             </p>

//                             <div className="mt-6 h-px bg-border-default" />

//                             <p className="mt-4 text-xs text-text-muted">
//                                 <span className="text-color-accent">*</span>{" "}
//                                 Required field
//                             </p>
//                         </div>
//                     </div>

//                     {error && (
//                         <div
//                             role="alert"
//                             className="mb-6 rounded-lg border border-danger-border bg-danger-bg px-5 py-4 text-sm text-danger-text"
//                         >
//                             {error}
//                         </div>
//                     )}

//                     {successMessage && (
//                         <div
//                             role="status"
//                             className="mb-6 rounded-lg border border-success-border bg-success-bg px-5 py-4 text-sm text-success-text"
//                         >
//                             {successMessage}
//                         </div>
//                     )}

//                     <form
//                         onSubmit={handleSubmit}
//                         className="overflow-hidden rounded-xl border border-card-border bg-bg-surface-raised shadow-sm"
//                     >
//                         <section className="px-6 py-8 sm:px-9">
//                             <SectionTitle
//                                 icon={Upload}
//                                 title="Event details"
//                                 description="Provide the core information for this event."
//                             />

//                             <div className="flex flex-col gap-7">
//                                 <FormField
//                                     label="Event name"
//                                     htmlFor="event-name"
//                                     required
//                                 >
//                                     <input
//                                         id="event-name"
//                                         type="text"
//                                         value={eventName}
//                                         onChange={(event) =>
//                                             handleNameChange(
//                                                 event.target.value,
//                                             )
//                                         }
//                                         placeholder="Annual Tech Summit"
//                                         required
//                                         className="input w-full"
//                                     />
//                                 </FormField>

//                                 <FormField
//                                     label="Event slug"
//                                     htmlFor="event-slug"
//                                     required
//                                 >
//                                     <input
//                                         id="event-slug"
//                                         type="text"
//                                         value={eventSlug}
//                                         onChange={(event) => {
//                                             setSlugTouched(true);
//                                             setEventSlug(
//                                                 event.target.value,
//                                             );
//                                         }}
//                                         placeholder="annual-tech-summit"
//                                         required
//                                         className="input w-full"
//                                     />
//                                 </FormField>

//                                 <FormField
//                                     label="Description"
//                                     htmlFor="event-description"
//                                 >
//                                     <textarea
//                                         id="event-description"
//                                         value={description}
//                                         onChange={(event) =>
//                                             setDescription(
//                                                 event.target.value,
//                                             )
//                                         }
//                                         placeholder="What is this event about?"
//                                         rows={4}
//                                         className="input w-full resize-y"
//                                     />
//                                 </FormField>

//                                 <div className="grid gap-7 sm:grid-cols-[2fr_1fr]">
//                                     <ImageUpload
//                                         label="Banner image"
//                                         file={bannerFile}
//                                         preview={bannerPreview}
//                                         onSelect={(file) => {
//                                             setBannerFile(file);
//                                             setBannerPreview(
//                                                 createPreview(
//                                                     file,
//                                                     bannerPreview,
//                                                 ),
//                                             );
//                                         }}
//                                         onClear={() => {
//                                             if (bannerPreview) {
//                                                 URL.revokeObjectURL(
//                                                     bannerPreview,
//                                                 );
//                                             }

//                                             setBannerFile(null);
//                                             setBannerPreview(null);
//                                         }}
//                                     />

//                                     <ImageUpload
//                                         label="Poster image"
//                                         file={posterFile}
//                                         preview={posterPreview}
//                                         variant="poster"
//                                         onSelect={(file) => {
//                                             setPosterFile(file);
//                                             setPosterPreview(
//                                                 createPreview(
//                                                     file,
//                                                     posterPreview,
//                                                 ),
//                                             );
//                                         }}
//                                         onClear={() => {
//                                             if (posterPreview) {
//                                                 URL.revokeObjectURL(
//                                                     posterPreview,
//                                                 );
//                                             }

//                                             setPosterFile(null);
//                                             setPosterPreview(null);
//                                         }}
//                                     />
//                                 </div>
//                             </div>
//                         </section>

//                         <div className="mx-6 h-px bg-border-default sm:mx-9" />

//                         <section className="px-6 py-8 sm:px-9">
//                             <SectionTitle
//                                 icon={Users}
//                                 title="Speakers"
//                                 description="Add people who will speak at the event."
//                             />

//                             <div className="flex flex-col">
//                                 {speakers.map((speaker, index) => (
//                                     <div
//                                         key={index}
//                                         className="border-b border-border-default py-7 first:pt-0 last:border-b-0"
//                                     >
//                                         <div className="mb-6 flex items-center justify-between">
//                                             <p className="text-sm font-medium text-text-muted">
//                                                 Speaker {index + 1}
//                                             </p>

//                                             {speakers.length > 1 && (
//                                                 <RemoveButton
//                                                     label={`Remove speaker ${index + 1}`}
//                                                     onClick={() =>
//                                                         removeSpeaker(index)
//                                                     }
//                                                 />
//                                             )}
//                                         </div>

//                                         <div className="grid gap-7 sm:grid-cols-[150px_1fr]">
//                                             <ImageUpload
//                                                 label="Photo"
//                                                 file={speaker.imageFile}
//                                                 preview={
//                                                     speaker.imagePreview
//                                                 }
//                                                 variant="square"
//                                                 onSelect={(file) => {
//                                                     updateSpeaker(index, {
//                                                         imageFile: file,
//                                                         imagePreview:
//                                                             createPreview(
//                                                                 file,
//                                                                 speaker.imagePreview,
//                                                             ),
//                                                     });
//                                                 }}
//                                                 onClear={() => {
//                                                     if (
//                                                         speaker.imagePreview
//                                                     ) {
//                                                         URL.revokeObjectURL(
//                                                             speaker.imagePreview,
//                                                         );
//                                                     }

//                                                     updateSpeaker(index, {
//                                                         imageFile: null,
//                                                         imagePreview: null,
//                                                     });
//                                                 }}
//                                             />

//                                             <div className="flex flex-col gap-6">
//                                                 <FormField
//                                                     label="Name"
//                                                     htmlFor={`speaker-name-${index}`}
//                                                 >
//                                                     <input
//                                                         id={`speaker-name-${index}`}
//                                                         type="text"
//                                                         value={speaker.name}
//                                                         onChange={(event) =>
//                                                             updateSpeaker(
//                                                                 index,
//                                                                 {
//                                                                     name: event
//                                                                         .target
//                                                                         .value,
//                                                                 },
//                                                             )
//                                                         }
//                                                         placeholder="Jane Doe"
//                                                         className="input w-full"
//                                                     />
//                                                 </FormField>

//                                                 <FormField
//                                                     label="Designation"
//                                                     htmlFor={`speaker-designation-${index}`}
//                                                 >
//                                                     <input
//                                                         id={`speaker-designation-${index}`}
//                                                         type="text"
//                                                         value={
//                                                             speaker.designation
//                                                         }
//                                                         onChange={(event) =>
//                                                             updateSpeaker(
//                                                                 index,
//                                                                 {
//                                                                     designation:
//                                                                         event
//                                                                             .target
//                                                                             .value,
//                                                                 },
//                                                             )
//                                                         }
//                                                         placeholder="Engineering Lead"
//                                                         className="input w-full"
//                                                     />
//                                                 </FormField>

//                                                 <FormField
//                                                     label="Company"
//                                                     htmlFor={`speaker-company-${index}`}
//                                                 >
//                                                     <input
//                                                         id={`speaker-company-${index}`}
//                                                         type="text"
//                                                         value={speaker.company}
//                                                         onChange={(event) =>
//                                                             updateSpeaker(
//                                                                 index,
//                                                                 {
//                                                                     company:
//                                                                         event
//                                                                             .target
//                                                                             .value,
//                                                                 },
//                                                             )
//                                                         }
//                                                         placeholder="Acme Inc."
//                                                         className="input w-full"
//                                                     />
//                                                 </FormField>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>

//                             <div className="mt-3">
//                                 <AddButton
//                                     label="Add speaker"
//                                     onClick={addSpeaker}
//                                 />
//                             </div>
//                         </section>

//                         <div className="mx-6 h-px bg-border-default sm:mx-9" />

//                         <section className="px-6 py-8 sm:px-9">
//                             <SectionTitle
//                                 icon={CalendarClock}
//                                 title="Schedule"
//                                 description="Create the agenda for your event."
//                             />

//                             <div className="flex flex-col">
//                                 {schedules.map((schedule, index) => (
//                                     <div
//                                         key={index}
//                                         className="border-b border-border-default py-7 first:pt-0 last:border-b-0"
//                                     >
//                                         <div className="mb-6 flex items-center justify-between">
//                                             <p className="text-sm font-medium text-text-muted">
//                                                 Schedule item {index + 1}
//                                             </p>

//                                             {schedules.length > 1 && (
//                                                 <RemoveButton
//                                                     label={`Remove schedule item ${index + 1}`}
//                                                     onClick={() =>
//                                                         removeSchedule(index)
//                                                     }
//                                                 />
//                                             )}
//                                         </div>

//                                         <div className="grid gap-6 sm:grid-cols-[2fr_1fr]">
//                                             <FormField
//                                                 label="Title"
//                                                 htmlFor={`schedule-title-${index}`}
//                                             >
//                                                 <input
//                                                     id={`schedule-title-${index}`}
//                                                     type="text"
//                                                     value={schedule.title}
//                                                     onChange={(event) =>
//                                                         updateSchedule(
//                                                             index,
//                                                             {
//                                                                 title: event
//                                                                     .target
//                                                                     .value,
//                                                             },
//                                                         )
//                                                     }
//                                                     placeholder="Opening keynote"
//                                                     className="input w-full"
//                                                 />
//                                             </FormField>

//                                             <FormField
//                                                 label="Date & Time"
//                                                 htmlFor={`schedule-datetime-${index}`}
//                                             >
//                                                 <input
//                                                     id={`schedule-datetime-${index}`}
//                                                     type="datetime-local"
//                                                     value={
//                                                         schedule.dateTime
//                                                     }
//                                                     onChange={(event) =>
//                                                         updateSchedule(
//                                                             index,
//                                                             {
//                                                                 dateTime:
//                                                                     event
//                                                                         .target
//                                                                         .value,
//                                                             },
//                                                         )
//                                                     }
//                                                     className="input w-full"
//                                                 />
//                                             </FormField>
//                                         </div>
//                                     </div>
//                                 ))}
//                             </div>

//                             <div className="mt-3">
//                                 <AddButton
//                                     label="Add schedule item"
//                                     onClick={addSchedule}
//                                 />
//                             </div>
//                         </section>

//                         <div className="sticky bottom-0 flex items-center justify-between border-t border-border-default bg-bg-surface-raised/95 px-6 py-5 backdrop-blur sm:px-9">
//                             <span className="text-xs text-text-muted">
//                                 Your event will be saved when submitted.
//                             </span>

//                             <button
//                                 type="submit"
//                                 disabled={submitting}
//                                 className="btn btn-primary"
//                             >
//                                 {submitting
//                                     ? isUploading
//                                         ? "Uploading..."
//                                         : "Creating..."
//                                     : "Create event"}
//                             </button>
//                         </div>
//                     </form>
//                 </div>
//             </main>
//         </div>
//     );
// }


export default function Aeg() {
    return <></>
}