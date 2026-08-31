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

    // Update event_id when id param changes
    useEffect(() => {
        if (id) {
            setFormData(prev => ({
                ...prev,
                event_id: id
            }));
        }
    }, [id]);

    const validateForm = (): boolean => {
        const errors: FormError[] = [];

        if (!formData.fname.trim()) {
            errors.push({ field: "fname", message: "First name required" });
        }
        if (!formData.lname.trim()) {
            errors.push({ field: "lname", message: "Last name required" });
        }
        if (!formData.email.trim()) {
            errors.push({ field: "email", message: "Email required" });
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.push({ field: "email", message: "Invalid email" });
        }
        if (!formData.phonenumber.trim()) {
            errors.push({ field: "phonenumber", message: "Phone required" });
        }
        if (!formData.collage_name.trim()) {
            errors.push({ field: "collage_name", message: "College required" });
        }

        setFormErrors(errors);
        return errors.length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setFormErrors(prev => prev.filter(err => err.field !== name));
    };

    const handleSubmitRegistration = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setRegistrationError(null);
        setRegistrationSuccess(false);

        if (!validateForm()) {
            return;
        }

        if (!formData.event_id || formData.event_id === "") {
            setRegistrationError("Event ID is missing. Please go back and try again.");
            return;
        }

        setRegistrationLoading(true);

        try {
            console.log("Submitting registration:", formData);
            
            const result = await makeApiCall(
                "POST",
                APIENDPOINT.CreateRegistration,
                formData
            );

            if (result.success) {
                setRegistrationSuccess(true);
                setTimeout(() => {
                    router.push("/events");
                }, 2000);
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
            <main className="min-h-screen flex items-center justify-center"
                style={{ background: "var(--bg-page)" }}>
                <div className="text-center">
                    <p style={{ color: "var(--text-secondary)" }}>Invalid event ID</p>
                    <Link href="/events" className="text-color-accent hover:underline mt-4 inline-block">
                        ← Back to Events
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen" style={{ background: "var(--bg-page)" }}>
            <div className="min-h-screen flex flex-col">
                {/* Header */}
                <div className="border-b" style={{ borderColor: "var(--border-default)" }}>
                    <div className="max-w-md mx-auto px-6 py-4">
                        <Link
                            href="/events"
                            className="inline-flex items-center gap-2 text-sm font-medium"
                            style={{ color: "var(--text-link)" }}
                        >
                            <ArrowLeft size={16} />
                            Back
                        </Link>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 flex items-center justify-center px-6 py-12">
                    <div className="w-full max-w-md">
                        {/* Title */}
                        <div className="text-center mb-8">
                            <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
                                Register
                            </h1>
                            <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
                                Join us for this event
                            </p>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmitRegistration} className="space-y-5">
                            {registrationSuccess && (
                                <div className="flex items-center gap-3 rounded-lg p-3 text-sm"
                                    style={{ background: "var(--success-bg)", color: "var(--success-text)" }}>
                                    <CheckCircle size={18} />
                                    <div>
                                        <p className="font-semibold">Registration successful</p>
                                        <p className="text-xs">Redirecting...</p>
                                    </div>
                                </div>
                            )}

                            {registrationError && (
                                <div className="flex items-start gap-3 rounded-lg p-3 text-sm"
                                    style={{ background: "var(--danger-bg)", color: "var(--danger-text)" }}>
                                    <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                                    <p>{registrationError}</p>
                                </div>
                            )}

                            {/* Name Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <input
                                        type="text"
                                        name="fname"
                                        value={formData.fname}
                                        onChange={handleInputChange}
                                        placeholder="First name"
                                        className="input w-full text-sm"
                                        style={{
                                            borderColor: formErrors.some(e => e.field === "fname") ? "var(--danger-border)" : "var(--border-default)"
                                        }}
                                    />
                                    {formErrors.find(e => e.field === "fname") && (
                                        <p className="text-xs mt-1" style={{ color: "var(--danger-text)" }}>
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
                                        className="input w-full text-sm"
                                        style={{
                                            borderColor: formErrors.some(e => e.field === "lname") ? "var(--danger-border)" : "var(--border-default)"
                                        }}
                                    />
                                    {formErrors.find(e => e.field === "lname") && (
                                        <p className="text-xs mt-1" style={{ color: "var(--danger-text)" }}>
                                            {formErrors.find(e => e.field === "lname")?.message}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Email */}
                            <div>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    placeholder="Email address"
                                    className="input w-full text-sm"
                                    style={{
                                        borderColor: formErrors.some(e => e.field === "email") ? "var(--danger-border)" : "var(--border-default)"
                                    }}
                                />
                                {formErrors.find(e => e.field === "email") && (
                                    <p className="text-xs mt-1" style={{ color: "var(--danger-text)" }}>
                                        {formErrors.find(e => e.field === "email")?.message}
                                    </p>
                                )}
                            </div>

                            {/* Phone */}
                            <div>
                                <input
                                    type="tel"
                                    name="phonenumber"
                                    value={formData.phonenumber}
                                    onChange={handleInputChange}
                                    placeholder="Phone number"
                                    className="input w-full text-sm"
                                    style={{
                                        borderColor: formErrors.some(e => e.field === "phonenumber") ? "var(--danger-border)" : "var(--border-default)"
                                    }}
                                />
                                {formErrors.find(e => e.field === "phonenumber") && (
                                    <p className="text-xs mt-1" style={{ color: "var(--danger-text)" }}>
                                        {formErrors.find(e => e.field === "phonenumber")?.message}
                                    </p>
                                )}
                            </div>

                            {/* College */}
                            <div>
                                <input
                                    type="text"
                                    name="collage_name"
                                    value={formData.collage_name}
                                    onChange={handleInputChange}
                                    placeholder="College / University"
                                    className="input w-full text-sm"
                                    style={{
                                        borderColor: formErrors.some(e => e.field === "collage_name") ? "var(--danger-border)" : "var(--border-default)"
                                    }}
                                />
                                {formErrors.find(e => e.field === "collage_name") && (
                                    <p className="text-xs mt-1" style={{ color: "var(--danger-text)" }}>
                                        {formErrors.find(e => e.field === "collage_name")?.message}
                                    </p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={registrationLoading || registrationSuccess}
                                className="btn btn-primary w-full py-2.5 text-sm font-semibold mt-6"
                            >
                                {registrationLoading ? (
                                    <span className="inline-flex items-center gap-2">
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Registering...
                                    </span>
                                ) : (
                                    "Complete Registration"
                                )}
                            </button>
                        </form>

                        {/* Footer text */}
                        <p className="text-xs text-center mt-6" style={{ color: "var(--text-muted)" }}>
                            By registering, you agree to our event terms
                        </p>
                    </div>
                </div>
            </div>
        </main>
    );
}
