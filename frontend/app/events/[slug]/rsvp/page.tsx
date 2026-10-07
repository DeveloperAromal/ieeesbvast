'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { submitRSVP, checkExistingRSVP } from '@/lib/api/rsvp';
import { maskPhoneNumber, isValidIndianPhoneNumber } from '@/lib/phone';
import { APIENDPOINT } from '@/config/Backend';
import { useApiCall } from '@/hooks/useApiCall';
import { Event } from '@/types/event_types';

export default function RSVP() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;
    const { makeApiCall } = useApiCall();

    const [event, setEvent] = useState<Event | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        phonenumber: '',
        semester: '',
        branch: '',
    });

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    const [phoneError, setPhoneError] = useState('');

    // Fetch event details on mount
    useEffect(() => {
        const fetchEvent = async () => {
            try {
                const res = await makeApiCall(
                    'GET',
                    APIENDPOINT.GetEventBySlug(slug)
                );

                if (res.success && res.data) {
                    setEvent(res.data);
                } else {
                    setError('Event not found');
                }
            } catch (err) {
                const errorMessage = err instanceof Error ? err.message : 'Failed to load event';
                setError(errorMessage);
            } finally {
                setPageLoading(false);
            }
        };

        if (slug) {
            fetchEvent();
        }
    }, [slug, makeApiCall]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        setError('');

        // Validate phone number on change
        if (name === 'phonenumber') {
            if (value && !isValidIndianPhoneNumber(value)) {
                setPhoneError('Please enter a valid Indian phone number (10 digits starting with 6-9)');
            } else {
                setPhoneError('');
            }
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            // Validate form
            if (!formData.name.trim()) {
                throw new Error('Name is required');
            }
            if (!formData.phonenumber.trim()) {
                throw new Error('Phone number is required');
            }
            if (!isValidIndianPhoneNumber(formData.phonenumber)) {
                throw new Error('Please enter a valid Indian phone number');
            }
            if (!formData.semester) {
                throw new Error('Semester is required');
            }
            if (!formData.branch) {
                throw new Error('Branch is required');
            }

            if (!event?.id) {
                throw new Error('Event not found');
            }

            // Check if user already RSVP'd
            const existingRSVP = await checkExistingRSVP(event.id, formData.phonenumber);
            if (existingRSVP) {
                throw new Error('You have already confirmed your attendance for this event');
            }

            const response = await submitRSVP({
                ...formData,
                event_id: event.id,
            });

            setSuccess(true);
            setFormData({
                name: '',
                phonenumber: '',
                semester: '',
                branch: '',
            });

            // Redirect after success
            setTimeout(() => {
                router.push(`/events/${slug}`);
            }, 2000);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to submit RSVP. Please try again.';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (pageLoading) {
        return (
            <section className="flex items-center justify-center min-h-screen px-2 py-12">
                <div className="w-full max-w-md">
                    <div className="flex flex-col items-center gap-3">
                        <div
                            className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
                            style={{ borderColor: "var(--border-default)", borderTopColor: "transparent" }}
                        />
                        <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                            Loading event...
                        </p>
                    </div>
                </div>
            </section>
        );
    }

    if (!event) {
        return (
            <section className="flex items-center justify-center min-h-screen px-2 py-12">
                <div className="w-full max-w-md text-center">
                    <p style={{ color: "var(--text-primary)" }}>
                        Event not found
                    </p>
                </div>
            </section>
        );
    }

    return (
        <section className="flex items-center justify-center min-h-screen px-2 py-12">
            <div className="w-full max-w-md !p-2">
                <div className="mb-8">
                    <h3 className="text-2xl font-bold text-text-primary">RSVP for {event.event_name}</h3>
                    <p className="mt-1 text-sm text-text-muted">
                        Confirm your attendance by filling in your details.
                    </p>
                </div>

                {success && (
                    <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-800 rounded">
                        <p className="font-semibold">RSVP Confirmed!</p>
                        <p className="text-sm">Redirecting you back to the event...</p>
                    </div>
                )}

                {error && (
                    <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-800 rounded">
                        <p className="font-semibold">Error</p>
                        <p className="text-sm">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="group">
                        <label
                            htmlFor="name"
                            className="block text-xs text-text-muted transition-colors group-focus-within:text-text-primary mb-2"
                        >
                            Full Name
                        </label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            required
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                            disabled={loading}
                            className="input w-full"
                        />
                    </div>

                    <div className="group">
                        <label
                            htmlFor="phonenumber"
                            className="block text-xs text-text-muted transition-colors group-focus-within:text-text-primary mb-2"
                        >
                            Phone Number (India)
                        </label>
                        <input
                            id="phonenumber"
                            name="phonenumber"
                            type="tel"
                            required
                            placeholder="****3210"
                            value={formData.phonenumber}
                            onChange={handleChange}
                            disabled={loading}
                            className={`input w-full ${phoneError ? 'border-red-500' : ''}`}
                        />
                        {phoneError && (
                            <p className="text-xs text-red-500 mt-1">{phoneError}</p>
                        )}
                    </div>

                    <div className="group">
                        <label
                            htmlFor="semester"
                            className="block text-xs text-text-muted transition-colors group-focus-within:text-text-primary mb-2"
                        >
                            Semester
                        </label>
                        <select
                            id="semester"
                            name="semester"
                            required
                            value={formData.semester}
                            onChange={handleChange}
                            disabled={loading}
                            className="input w-full"
                        >
                            <option value="">Select Semester</option>
                            <option value="1">1st Semester</option>
                            <option value="2">2nd Semester</option>
                            <option value="3">3rd Semester</option>
                            <option value="4">4th Semester</option>
                            <option value="5">5th Semester</option>
                            <option value="6">6th Semester</option>
                            <option value="7">7th Semester</option>
                            <option value="8">8th Semester</option>
                        </select>
                    </div>

                    <div className="group">
                        <label
                            htmlFor="branch"
                            className="block text-xs text-text-muted transition-colors group-focus-within:text-text-primary mb-2"
                        >
                            Branch
                        </label>
                        <select
                            id="branch"
                            name="branch"
                            required
                            value={formData.branch}
                            onChange={handleChange}
                            disabled={loading}
                            className="input w-full"
                        >
                            <option value="">Select Branch</option>
                            <option value="CSE">Computer Science Engineering</option>
                            <option value="ECE">Electronics and Communication Engineering</option>
                            <option value="EEE">Electrical and Electronics Engineering</option>
                            <option value="MECH">Mechanical Engineering</option>
                            <option value="CIVIL">Civil Engineering</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !!phoneError}
                        className="btn btn-primary w-full justify-center !py-3 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Confirming...' : 'Confirm RSVP'}
                    </button>
                </form>
            </div>
        </section>
    )
}
