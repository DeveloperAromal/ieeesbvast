"use client";

import { APIENDPOINT } from "@/config/Backend";
import { useApiCall } from "@/hooks/useApiCall";
import { AlertCircle, CheckCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { RegistrationPayload } from "@/types/api_types";

interface FormError {
    field: string;
    message: string;
}

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
        event_id: id || "",
    });

    useEffect(() => {
        if (id) {
            setFormData(prev => ({ ...prev, event_id: id }));
        }
    }, [id]);

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

        setFormErrors(errors);
        return errors.length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        setFormErrors(prev => prev.filter(err => err.field !== name));
    };

    const handleSubmitRegistration = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setRegistrationError(null);
        setRegistrationSuccess(false);

        if (!validateForm()) return;

        if (!formData.event_id || formData.event_id === "") {
            setRegistrationError("Event ID is missing. Please go back and try again.");
            return;
        }

        setRegistrationLoading(true);

        try {
            const result = await makeApiCall("POST", APIENDPOINT.CreateRegistration, formData);

            if (result.success) {
                setRegistrationSuccess(true);
                setTimeout(() => router.push("/events"), 2000);
            } else {
                setRegistrationError(result.message || "Registration failed");
            }
        } catch (error) {
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

    // Shared underline-input styling — no boxes, just a bottom rule that
    // brightens on focus and reddens on error.
    const fieldClass =
        "w-full bg-transparent text-base py-2.5 outline-none border-0 border-b transition-colors duration-150 placeholder:text-[var(--text-muted)]";

    const fieldStyle = (field: string) => ({
        borderColor: formErrors.some(e => e.field === field) ? "var(--danger-border)" : "var(--border-default)",
        color: "var(--text-primary)",
    });

    return (
        <main className="min-h-screen" style={{ background: "var(--bg-page)" }}>
            <div className="max-w-lg mx-auto px-6 pt-10 pb-24">
                {/* Back link — no border, just breathing room */}
                <Link
                    href="/events"
                    className="inline-flex items-center gap-2 text-sm font-medium mb-16"
                    style={{ color: "var(--text-link)" }}
                >
                    <ArrowLeft size={16} />
                    Back
                </Link>

                {/* Heading carries the hierarchy — no card around it */}
                <h1 className="text-4xl font-semibold tracking-tight mb-2" style={{ color: "var(--text-primary)" }}>
                    Register for the event
                </h1>
                <p className="text-base mb-12" style={{ color: "var(--text-muted)" }}>
                    A few details and you're in.
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
                            <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
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
                    </div>

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