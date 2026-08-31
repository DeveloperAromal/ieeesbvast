export default function Registration() {
    return (
        <section className="flex items-center justify-center h-screen px-2 py-12">
            <div className="w-full max-w-md !p-2">
                <div className="mb-8">
                    <h3 className="text-2xl font-bold text-text-primary">Register for Cut & Create</h3>
                    <p className="mt-1 text-sm text-text-muted">
                        Fill in your details to secure your spot.
                    </p>
                </div>

                <form className="space-y-5">
                    <div className="group">
                        <label
                            htmlFor="first_name"
                            className="block text-xs text-text-muted transition-colors group-focus-within:text-text-primary mb-2"
                        >
                            First Name
                        </label>
                        <input
                            id="first_name"
                            name="first_name"
                            type="text"
                            autoComplete="given-name"
                            required
                            placeholder="Ada"
                            className="input w-full"
                        />
                    </div>

                    <div className="group">
                        <label
                            htmlFor="last_name"
                            className="block text-xs text-text-muted transition-colors group-focus-within:text-text-primary mb-2"
                        >
                            Last Name
                        </label>
                        <input
                            id="last_name"
                            name="last_name"
                            type="text"
                            autoComplete="family-name"
                            required
                            placeholder="Lovelace"
                            className="input w-full"
                        />
                    </div>

                    <div className="group">
                        <label
                            htmlFor="phone_number"
                            className="block text-xs text-text-muted transition-colors group-focus-within:text-text-primary mb-2"
                        >
                            Phone Number
                        </label>
                        <input
                            id="phone_number"
                            name="phone_number"
                            type="tel"
                            autoComplete="tel"
                            required
                            placeholder="+1 (555) 123-4567"
                            className="input w-full"
                        />
                    </div>

                    <div className="group">
                        <label
                            htmlFor="email"
                            className="block text-xs text-text-muted transition-colors group-focus-within:text-text-primary mb-2"
                        >
                            Email
                        </label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            placeholder="you@company.com"
                            className="input w-full"
                        />
                    </div>

                    <div className="group">
                        <label
                            htmlFor="college_name"
                            className="block text-xs text-text-muted transition-colors group-focus-within:text-text-primary mb-2"
                        >
                            College Name
                        </label>
                        <input
                            id="college_name"
                            name="college_name"
                            type="text"
                            autoComplete="organization"
                            required
                            placeholder="Institute of Technology"
                            className="input w-full"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary w-full justify-center !py-3">
                        Register
                    </button>
                </form>
            </div>
        </section>
    )
}