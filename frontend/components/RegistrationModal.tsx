"use client";

import { APIENDPOINT } from "@/config/Backend";
import { useApiCall } from "@/hooks/useApiCall";
import { AlertCircle, Building2, CheckCircle, Mail, Phone } from "lucide-react";
import { useState } from "react";
import type { RegistrationPayload } from "@/types/api_types";

interface RegistrationModalProps {
    isOpen: boolean;
    eventId: string;
    eventName: string;
    onClose: () => void;
}

interface FormError {
    field: string;
    message: string;
}

const semesterOptions = ["S1", "S2", "S3", "S4", "S5", "S6", "S7", "S8"];
const branchOptions = ["CSE", "CIVIL"];

export function RegistrationModal({
    isOpen,
    eventId,
    eventName,
    onClose,
}: RegistrationModalProps) {
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
        event_id: eventId,
        team_name: "",
        team_size: 1,
        team_members: [],
    });

    const validateForm = (): boolean => {
        const errors: FormError[] = [];

        if (!formData.fname.trim()) {
            errors.push({ field: "fname", message: "First name is required" });
        }
        if (!formData.lname.trim()) {
            errors.push({ field: "lname", message: "Last name is required" });
        }
        if (!formData.email.trim()) {
            errors.push({ field: "email", message: "Email is required" });
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.push({ field: "email", message: "Invalid email format" });
        }
        if (!formData.phonenumber.trim()) {
            errors.push({ field: "phonenumber", message: "Phone number is required" });
        }
        if (!formData.collage_name.trim()) {
            errors.push({ field: "collage_name", message: "College name is required" });
        }
        if (!formData.semester.trim()) {
            errors.push({ field: "semester", message: "Semester is required" });
        }
        if (!formData.branch.trim()) {
            errors.push({ field: "branch", message: "Branch is required" });
        }
        if (!formData.team_name.trim()) {
            errors.push({ field: "team_name", message: "Team name is required" });
        }

        setFormErrors(errors);
        return errors.length === 0;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === "team_size" ? parseInt(value) : value
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

        setRegistrationLoading(true);

        try {
            const result = await makeApiCall(
                "POST",
                APIENDPOINT.CreateRegistration,
                {
                    ...formData,
                    event_id: eventId,
                }
            );

            if (result.success) {
                setRegistrationSuccess(true);
                setFormData({
                    fname: "",
                    lname: "",
                    phonenumber: "",
                    email: "",
                    collage_name: "",
                    semester: "",
                    branch: "",
                    event_id: eventId,
                    team_name: "",
                    team_size: 1,
                    team_members: [],
                });
                setTimeout(() => {
                    onClose();
                    setRegistrationSuccess(false);
                }, 2000);
            } else {
                setRegistrationError(result.message || "Failed to register for the event");
            }
        } catch {
            setRegistrationError("An unexpected error occurred during registration");
        } finally {
            setRegistrationLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: "rgba(0, 0, 0, 0.5)" }}>
            <div className="w-full max-w-md rounded-xl shadow-lg"
                style={{ background: "var(--bg-surface-raised)" }}>
                {/* Modal Header */}
                <div className="flex items-center justify-between border-b p-6"
                    style={{ borderColor: "var(--border-default)" }}>
                    <div>
                        <h2 className="text-xl font-semibold"
                            style={{ color: "var(--text-primary)" }}>
                            Register for Event
                        </h2>
                        <p className="text-sm mt-1"
                            style={{ color: "var(--text-muted)" }}>
                            {eventName}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-text-muted hover:text-text-primary text-xl"
                    >
                        ✕
                    </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleSubmitRegistration} className="p-6 space-y-4">
                    {registrationSuccess && (
                        <div className="flex items-center gap-3 rounded-lg p-4"
                            style={{ background: "var(--success-bg)", color: "var(--success-text)" }}>
                            <CheckCircle size={20} />
                            <span>Successfully registered for the event!</span>
                        </div>
                    )}

                    {registrationError && (
                        <div className="flex items-center gap-3 rounded-lg p-4"
                            style={{ background: "var(--danger-bg)", color: "var(--danger-text)" }}>
                            <AlertCircle size={20} />
                            <span>{registrationError}</span>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2"
                                style={{ color: "var(--text-secondary)" }}>
                                First Name <span style={{ color: "var(--color-accent)" }}>*</span>
                            </label>
                            <input
                                type="text"
                                name="fname"
                                value={formData.fname}
                                onChange={handleInputChange}
                                placeholder="John"
                                className="input w-full"
                                style={{
                                    borderColor: formErrors.some(e => e.field === "fname") ? "var(--danger-border)" : "var(--border-default)"
                                }}
                            />
                            {formErrors.find(e => e.field === "fname") && (
                                <p className="mt-1 text-xs" style={{ color: "var(--danger-text)" }}>
                                    {formErrors.find(e => e.field === "fname")?.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2"
                                style={{ color: "var(--text-secondary)" }}>
                                Last Name <span style={{ color: "var(--color-accent)" }}>*</span>
                            </label>
                            <input
                                type="text"
                                name="lname"
                                value={formData.lname}
                                onChange={handleInputChange}
                                placeholder="Doe"
                                className="input w-full"
                                style={{
                                    borderColor: formErrors.some(e => e.field === "lname") ? "var(--danger-border)" : "var(--border-default)"
                                }}
                            />
                            {formErrors.find(e => e.field === "lname") && (
                                <p className="mt-1 text-xs" style={{ color: "var(--danger-text)" }}>
                                    {formErrors.find(e => e.field === "lname")?.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2"
                            style={{ color: "var(--text-secondary)" }}>
                            <div className="flex items-center gap-2">
                                <Mail size={14} />
                                Email <span style={{ color: "var(--color-accent)" }}>*</span>
                            </div>
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="john@example.com"
                            className="input w-full"
                            style={{
                                borderColor: formErrors.some(e => e.field === "email") ? "var(--danger-border)" : "var(--border-default)"
                            }}
                        />
                        {formErrors.find(e => e.field === "email") && (
                            <p className="mt-1 text-xs" style={{ color: "var(--danger-text)" }}>
                                {formErrors.find(e => e.field === "email")?.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2"
                            style={{ color: "var(--text-secondary)" }}>
                            <div className="flex items-center gap-2">
                                <Phone size={14} />
                                Phone Number <span style={{ color: "var(--color-accent)" }}>*</span>
                            </div>
                        </label>
                        <input
                            type="tel"
                            name="phonenumber"
                            value={formData.phonenumber}
                            onChange={handleInputChange}
                            placeholder="+91 98765 43210"
                            className="input w-full"
                            style={{
                                borderColor: formErrors.some(e => e.field === "phonenumber") ? "var(--danger-border)" : "var(--border-default)"
                            }}
                        />
                        {formErrors.find(e => e.field === "phonenumber") && (
                            <p className="mt-1 text-xs" style={{ color: "var(--danger-text)" }}>
                                {formErrors.find(e => e.field === "phonenumber")?.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2"
                            style={{ color: "var(--text-secondary)" }}>
                            <div className="flex items-center gap-2">
                                <Building2 size={14} />
                                College Name <span style={{ color: "var(--color-accent)" }}>*</span>
                            </div>
                        </label>
                        <input
                            type="text"
                            name="collage_name"
                            value={formData.collage_name}
                            onChange={handleInputChange}
                            placeholder="ABC University"
                            className="input w-full"
                            style={{
                                borderColor: formErrors.some(e => e.field === "collage_name") ? "var(--danger-border)" : "var(--border-default)"
                            }}
                        />
                        {formErrors.find(e => e.field === "collage_name") && (
                            <p className="mt-1 text-xs" style={{ color: "var(--danger-text)" }}>
                                {formErrors.find(e => e.field === "collage_name")?.message}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-3 pt-4">
                        <div>
                            <label className="block text-sm font-medium mb-2"
                                style={{ color: "var(--text-secondary)" }}>
                                Semester <span style={{ color: "var(--color-accent)" }}>*</span>
                            </label>
                            <select
                                name="semester"
                                value={formData.semester}
                                onChange={handleInputChange}
                                className="input w-full"
                                style={{
                                    borderColor: formErrors.some(e => e.field === "semester") ? "var(--danger-border)" : "var(--border-default)"
                                }}
                            >
                                <option value="">Select</option>
                                {semesterOptions.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                            {formErrors.find(e => e.field === "semester") && (
                                <p className="mt-1 text-xs" style={{ color: "var(--danger-text)" }}>
                                    {formErrors.find(e => e.field === "semester")?.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2"
                                style={{ color: "var(--text-secondary)" }}>
                                Branch <span style={{ color: "var(--color-accent)" }}>*</span>
                            </label>
                            <select
                                name="branch"
                                value={formData.branch}
                                onChange={handleInputChange}
                                className="input w-full"
                                style={{
                                    borderColor: formErrors.some(e => e.field === "branch") ? "var(--danger-border)" : "var(--border-default)"
                                }}
                            >
                                <option value="">Select</option>
                                {branchOptions.map((option) => (
                                    <option key={option} value={option}>{option}</option>
                                ))}
                            </select>
                            {formErrors.find(e => e.field === "branch") && (
                                <p className="mt-1 text-xs" style={{ color: "var(--danger-text)" }}>
                                    {formErrors.find(e => e.field === "branch")?.message}
                                </p>
                            )}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2"
                            style={{ color: "var(--text-secondary)" }}>
                            Team Name <span style={{ color: "var(--color-accent)" }}>*</span>
                        </label>
                        <input
                            type="text"
                            name="team_name"
                            value={formData.team_name}
                            onChange={handleInputChange}
                            placeholder="Your Team Name"
                            className="input w-full"
                            style={{
                                borderColor: formErrors.some(e => e.field === "team_name") ? "var(--danger-border)" : "var(--border-default)"
                            }}
                        />
                        {formErrors.find(e => e.field === "team_name") && (
                            <p className="mt-1 text-xs" style={{ color: "var(--danger-text)" }}>
                                {formErrors.find(e => e.field === "team_name")?.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2"
                            style={{ color: "var(--text-secondary)" }}>
                            Team Size <span style={{ color: "var(--color-accent)" }}>*</span>
                        </label>
                        <select
                            name="team_size"
                            value={formData.team_size}
                            onChange={handleInputChange}
                            className="input w-full"
                        >
                            <option value={1}>1 (Solo)</option>
                            <option value={2}>2</option>
                            <option value={3}>3</option>
                            <option value={4}>4</option>
                        </select>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-secondary flex-1"
                            disabled={registrationLoading}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary flex-1"
                            disabled={registrationLoading || registrationSuccess}
                        >
                            {registrationLoading ? "Registering..." : "Register"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
