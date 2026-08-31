import { Calendar, Clock, MapPin, Users } from "lucide-react";

export default function EventDetailPage() {
    return (
        <main className="min-h-screen" style={{ background: "var(--bg-page)" }}>
            <section className="mx-auto max-w-7xl px-6 py-10 lg:px-8">
                <div
                    className="h-80 w-full rounded-2xl bg-cover bg-center"
                    style={{
                        backgroundImage: "url('/banner.png')",
                        border: "1px solid var(--border-default)",
                    }}
                />

                <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-[1fr_360px]">
                    <div className="space-y-10">
                        <div>
                            <span className="badge badge-info">Video Editing</span>

                            <h1
                                className="mt-3 text-4xl font-bold tracking-tight"
                                style={{ color: "var(--text-primary)" }}
                            >
                                Cut & Create
                            </h1>

                            <div className="mt-6 space-y-3">
                                <div
                                    className="flex items-center gap-2"
                                    style={{ color: "var(--text-secondary)" }}
                                >
                                    <Calendar size={18} style={{ color: "var(--text-muted)" }} />
                                    <span>September 20, 2026</span>
                                </div>
                                <div
                                    className="flex items-center gap-2"
                                    style={{ color: "var(--text-secondary)" }}
                                >
                                    <Clock size={18} style={{ color: "var(--text-muted)" }} />
                                    <span>9:00 AM - 6:00 PM</span>
                                </div>
                                <div
                                    className="flex items-center gap-2"
                                    style={{ color: "var(--text-secondary)" }}
                                >
                                    <MapPin size={18} style={{ color: "var(--text-muted)" }} />
                                    <span>Bangalore, India</span>
                                </div>
                            </div>
                        </div>

                        <section>
                            <h2
                                className="text-2xl font-semibold"
                                style={{ color: "var(--text-primary)" }}
                            >
                                About the event
                            </h2>

                            <p
                                className="mt-4 leading-7"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                Cut & Create is IEEE SB VAST's flagship video editing competition, designed to bring out the storyteller and technical creative in every participant. Whether you're a seasoned editor or just getting started with timelines and transitions, this is your chance to showcase your creativity, technical skill, and unique visual voice.
                            </p>
                            <p
                                className="mt-4 leading-7"
                                style={{ color: "var(--text-secondary)" }}
                            >
                                Participants will be given a theme or raw footage and a limited time window to edit a compelling video. This tests not just your software skills, but your ability to think on your feet, craft a narrative, and deliver a polished final cut under pressure.
                            </p>
                        </section>

                        <section>
                            <h2
                                className="text-2xl font-semibold"
                                style={{ color: "var(--text-primary)" }}
                            >
                                Schedule
                            </h2>

                            <div className="card mt-5 !p-0 overflow-hidden">
                                <div
                                    className="flex gap-8 p-5"
                                    style={{ borderBottom: "1px solid var(--border-default)" }}
                                >
                                    <span className="w-24" style={{ color: "var(--text-muted)" }}>
                                        09:00 AM
                                    </span>
                                    <span style={{ color: "var(--text-primary)" }}>
                                        Registration
                                    </span>
                                </div>

                                <div
                                    className="flex gap-8 p-5"
                                    style={{ borderBottom: "1px solid var(--border-default)" }}
                                >
                                    <span className="w-24" style={{ color: "var(--text-muted)" }}>
                                        10:00 AM
                                    </span>
                                    <span style={{ color: "var(--text-primary)" }}>
                                        Opening keynote
                                    </span>
                                </div>

                                <div className="flex gap-8 p-5">
                                    <span className="w-24" style={{ color: "var(--text-muted)" }}>
                                        11:30 AM
                                    </span>
                                    <span style={{ color: "var(--text-primary)" }}>
                                        Workshop session
                                    </span>
                                </div>
                            </div>
                        </section>

                        {/* <section>
              <h2
                className="text-2xl font-semibold"
                style={{ color: "var(--text-primary)" }}
              >
                Speakers
              </h2>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div
                  className="h-40 rounded-xl"
                  style={{
                    background: "var(--bg-surface-sunken)",
                    border: "1px solid var(--border-default)",
                  }}
                />
                <div
                  className="h-40 rounded-xl"
                  style={{
                    background: "var(--bg-surface-sunken)",
                    border: "1px solid var(--border-default)",
                  }}
                />
                <div
                  className="h-40 rounded-xl"
                  style={{
                    background: "var(--bg-surface-sunken)",
                    border: "1px solid var(--border-default)",
                  }}
                />
              </div>
            </section> */}
                    </div>

                    <aside>
                        <div className="card sticky top-6">
                            <p className="text-sm" style={{ color: "var(--text-muted)" }}>
                                Registration
                            </p>

                            <h3
                                className="mt-2 text-2xl font-semibold"
                                style={{ color: "var(--text-primary)" }}
                            >
                                Free
                            </h3>

                            <div
                                className="my-6"
                                style={{ borderTop: "1px solid var(--border-default)" }}
                            />

                            <p
                                className="flex items-center gap-2 text-sm"
                                style={{ color: "var(--text-muted)" }}
                            >
                                <Clock size={14} />
                                Registration closes September 18, 2026
                            </p>

                            <button className="btn btn-primary mt-6 w-full justify-center py-3">
                                Register now
                            </button>

                            <p
                                className="mt-4 flex items-center justify-center gap-1.5 text-sm"
                                style={{ color: "var(--text-muted)" }}
                            >
                                <Users size={14} />
                                124 people registered
                            </p>
                        </div>
                    </aside>
                </div>
            </section>
        </main>
    );
}