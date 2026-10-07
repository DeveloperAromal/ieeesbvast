"use client";

import { APIENDPOINT } from "@/config/Backend";
import { useApiCall } from "@/hooks/useApiCall";
import { AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import type { RegistrationPayload } from "@/types/api_types";

interface FormError {
    field: string;
    message: string;
}

const semesterOptions = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"];
const branchOptions = ["CSE", "CIVIL", "MECH", "ECE", "AI/ML", "CYBERSECURITY"];

export default function RegisterPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();
    const { makeApiCall } = useApiCall();

    const [registrationLoading, setRegistrationLoading] = useState(false);
    const [registrationSuccess, setRegistrationSuccess] = useState(false);
    const [registrationError, setRegistrationError] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<FormError[]>([]);

    const [formData, setFormData] = useState<RegistrationPayload>({
        fname: "",
        lname: "",
        phonenumber: "",
        email: "",
        collage_name: "",
        semester: "",
        branch: "",
        event_id: id ?? "",
    });

    const validateForm = (): boolean => {
        const errors: FormError[] = [];

        if (!formData.fname.trim()) errors.push({ field: "fname", message: "First name required" });
        if (!formData.lname.trim()) errors.push({ field: "lname", message: "Last name required" });
        if (!formData.email.trim()) {
            errors.push({ field: "email", message: "Email required" });
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.push({ field: "email", message: "Invalid email" });
        }
        if (!formData.phonenumber.trim()) errors.push({ field: "phonenumber", message: "Phone required" });
        if (!formData.collage_name.trim()) errors.push({ field: "collage_name", message: "College required" });
        if (!formData.semester.trim()) errors.push({ field: "semester", message: "Semester required" });
        if (!formData.branch.trim()) errors.push({ field: "branch", message: "Branch required" });
        // if (!formData.team_name.trim()) errors.push({ field: "team_name", message: "Team name required" });
        // formData.team_members.forEach((member, index) => {
        //     if (!member.name.trim()) errors.push({ field: `member-${index}-name`, message: "Member name required" });
        //     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email)) errors.push({ field: `member-${index}-email`, message: "Valid member email required" });
        // });

        setFormErrors(errors);
        return errors.length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setFormErrors(prev => prev.filter(err => err.field !== name));
    };

    // const updateTeamSize = (teamSize: number) => {
    //     setFormData(prev => ({
    //         ...prev,
    //         team_size: teamSize,
    //         team_members: Array.from({ length: teamSize - 1 }, (_, index) => prev.team_members[index] ?? { name: "", email: "" }),
    //     }));
    //     setFormErrors(prev => prev.filter(error => !error.field.startsWith("member-") && error.field !== "team_name"));
    // };

    // const updateTeamMember = (index: number, field: keyof TeamMemberPayload, value: string) => {
    //     setFormData(prev => ({
    //         ...prev,
    //         team_members: prev.team_members.map((member, memberIndex) => memberIndex === index ? { ...member, [field]: value } : member),
    //     }));
    //     setFormErrors(prev => prev.filter(error => error.field !== `member-${index}-${field}`));
    // };

    const handleSubmitRegistration = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setRegistrationError(null);
        setRegistrationSuccess(false);

        if (!validateForm()) return;

        const eventId = Array.isArray(id) ? id[0] : id;
        if (!eventId) {
            setRegistrationError("Event ID is missing. Please go back and try again.");
            return;
        }

        setRegistrationLoading(true);

        try {
            const result = await makeApiCall("POST", APIENDPOINT.CreateRegistration, {
                ...formData,
                event_id: eventId,
            });

            if (result.success) {
                setRegistrationSuccess(true);
                setTimeout(() => router.push("/events"), 2000);
            } else {
                setRegistrationError(result.message);
            }
        } catch {
            setRegistrationError("An error occurred");
        } finally {
            setRegistrationLoading(false);
        }
    };

    if (!id) {
        return (
            <main className="min-h-screen flex items-center justify-center" style={{ background: "var(--bg-page)" }}>
                <div className="text-center">
                    <p style={{ color: "var(--text-secondary)" }}>Invalid event ID</p>
                    <Link href="/events" className="text-sm font-medium mt-4 inline-block" style={{ color: "var(--text-link)" }}>
                        ← Back to events
                    </Link>
                </div>
            </main>
        );
    }

    const fieldClass =
        "w-full bg-transparent text-base py-2.5 px-2 outline-none border-0 border-b transition-colors duration-150 placeholder:text-[var(--text-muted)]";

    const fieldStyle = (field: string) => ({
        borderColor: formErrors.some(e => e.field === field) ? "var(--danger-border)" : "var(--border-default)",
        color: "var(--text-primary)",
    });

    return (
        <main className="min-h-screen" style={{ background: "var(--bg-page)" }}>
            <div className="max-w-lg mx-auto px-6 pt-10 pb-24">
                <Link
                    href="/events"
                    className="inline-flex items-center gap-2 text-sm font-medium mb-16"
                    style={{ color: "var(--text-link)" }}
                >
                    <ArrowLeft size={16} />
                    Back
                </Link>

                <h1 className="text-4xl font-semibold tracking-tight mb-2" style={{ color: "var(--text-primary)" }}>
                    Register for the event
                </h1>
                <p className="text-base mb-12" style={{ color: "var(--text-muted)" }}>
                    A few details and you are in.
                </p>

                <form onSubmit={handleSubmitRegistration} className="space-y-10">
                    {registrationSuccess && (
                        <div className="flex items-center gap-3 text-sm" style={{ color: "var(--success-text)" }}>
                            <CheckCircle size={18} />
                            <div>
                                <p className="font-medium">Registration successful</p>
                                <p className="text-xs" style={{ color: "var(--text-muted)" }}>Redirecting…</p>
                            </div>
                        </div>
                    )}

                    {registrationError && (
                        <div className="flex items-start gap-3 text-sm" style={{ color: "var(--danger-text)" }}>
                            <AlertCircle size={18} className="shrink-0 mt-0.5" />
                            <p>{registrationError}</p>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-x-6 gap-y-8">
                        <div>
                            <input
                                type="text"
                                name="fname"
                                value={formData.fname}
                                onChange={handleInputChange}
                                placeholder="First name"
                                className={fieldClass}
                                style={fieldStyle("fname")}
                            />
                            {formErrors.find(e => e.field === "fname") && (
                                <p className="text-xs mt-1.5" style={{ color: "var(--danger-text)" }}>
                                    {formErrors.find(e => e.field === "fname")?.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <input
                                type="text"
                                name="lname"
                                value={formData.lname}
                                onChange={handleInputChange}
                                placeholder="Last name"
                                className={fieldClass}
                                style={fieldStyle("lname")}
                            />
                            {formErrors.find(e => e.field === "lname") && (
                                <p className="text-xs mt-1.5" style={{ color: "var(--danger-text)" }}>
                                    {formErrors.find(e => e.field === "lname")?.message}
                                </p>
                            )}
                        </div>

                        <div className="col-span-2">
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Email address"
                                className={fieldClass}
                                style={fieldStyle("email")}
                            />
                            {formErrors.find(e => e.field === "email") && (
                                <p className="text-xs mt-1.5" style={{ color: "var(--danger-text)" }}>
                                    {formErrors.find(e => e.field === "email")?.message}
                                </p>
                            )}
                        </div>

                        <div className="col-span-2">
                            <input
                                type="tel"
                                name="phonenumber"
                                value={formData.phonenumber}
                                onChange={handleInputChange}
                                placeholder="Phone number"
                                className={fieldClass}
                                style={fieldStyle("phonenumber")}
                            />
                            {formErrors.find(e => e.field === "phonenumber") && (
                                <p className="text-xs mt-1.5" style={{ color: "var(--danger-text)" }}>
                                    {formErrors.find(e => e.field === "phonenumber")?.message}
                                </p>
                            )}
                        </div>

                        <div className="col-span-2">
                            <input
                                type="text"
                                name="collage_name"
                                value={formData.collage_name}
                                onChange={handleInputChange}
                                placeholder="College / university"
                                className={fieldClass}
                                style={fieldStyle("collage_name")}
                            />
                            {formErrors.find(e => e.field === "collage_name") && (
                                <p className="text-xs mt-1.5" style={{ color: "var(--danger-text)" }}>
                                    {formErrors.find(e => e.field === "collage_name")?.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <select
                                name="semester"
                                value={formData.semester}
                                onChange={handleInputChange}
                                className={fieldClass}
                                style={fieldStyle("semester")}
                            >
                                <option value="">Semester</option>
                                {semesterOptions.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                            {formErrors.find(e => e.field === "semester") && (
                                <p className="text-xs mt-1.5" style={{ color: "var(--danger-text)" }}>
                                    {formErrors.find(e => e.field === "semester")?.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <select
                                name="branch"
                                value={formData.branch}
                                onChange={handleInputChange}
                                className={fieldClass}
                                style={fieldStyle("branch")}
                            >
                                <option value="">Branch</option>
                                {branchOptions.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                            {formErrors.find(e => e.field === "branch") && (
                                <p className="text-xs mt-1.5" style={{ color: "var(--danger-text)" }}>
                                    {formErrors.find(e => e.field === "branch")?.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* <section className="space-y-6 border-t pt-8" style={{ borderColor: "var(--border-default)" }}>
                        <div>
                            <h2 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>Team details</h2>
                            <p className="mt-1 text-sm" style={{ color: "var(--text-muted)" }}>You are the team captain. Add the rest of your team below.</p>
                        </div>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Team name</label>
                                <input name="team_name" value={formData.team_name} onChange={handleInputChange} placeholder="Byte Benders" className={fieldClass} style={fieldStyle("team_name")} />
                                {formErrors.find(error => error.field === "team_name") && <p className="mt-1.5 text-xs" style={{ color: "var(--danger-text)" }}>Team name required</p>}
                            </div>
                            <div>
                                <label className="mb-2 block text-sm font-medium" style={{ color: "var(--text-secondary)" }}>Team size</label>
                                <select value={formData.team_size} onChange={(e) => updateTeamSize(Number(e.target.value))} className={fieldClass} style={fieldStyle("team_size")}>
                                    {[1, 2, 3, 4].map(size => <option key={size} value={size}>{size} {size === 1 ? "member" : "members"}</option>)}
                                </select>
                            </div>
                        </div>
                        {formData.team_members.map((member, index) => <div key={index} className="rounded-lg border p-4" style={{ borderColor: "var(--border-default)", background: "var(--bg-surface)" }}>
                            <p className="mb-4 text-sm font-medium" style={{ color: "var(--text-primary)" }}>Team member {index + 2}</p>
                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                                <div><input value={member.name} onChange={(e) => updateTeamMember(index, "name", e.target.value)} placeholder="Full name" className={fieldClass} style={fieldStyle(`member-${index}-name`)} />{formErrors.find(error => error.field === `member-${index}-name`) && <p className="mt-1.5 text-xs" style={{ color: "var(--danger-text)" }}>Member name required</p>}</div>
                                <div><input type="email" value={member.email} onChange={(e) => updateTeamMember(index, "email", e.target.value)} placeholder="Email address" className={fieldClass} style={fieldStyle(`member-${index}-email`)} />{formErrors.find(error => error.field === `member-${index}-email`) && <p className="mt-1.5 text-xs" style={{ color: "var(--danger-text)" }}>Valid email required</p>}</div>
                            </div>
                        </div>)}
                    </section> */}

                    <button
                        type="submit"
                        disabled={registrationLoading || registrationSuccess}
                        className="btn btn-primary w-full py-3 text-sm font-semibold mt-4 flex items-center justify-center gap-2"
                    >
                        {registrationLoading ? (
                            <>
                                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Registering…
                            </>
                        ) : (
                            "Complete registration"
                        )}
                    </button>

                    <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                        By registering, you agree to our event terms.
                    </p>
                </form>
            </div>
        </main>
    );
}
