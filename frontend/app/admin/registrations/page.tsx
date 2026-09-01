// "use client";

// import { APIENDPOINT } from "@/config/Backend";
// import { useApiCall } from "@/hooks/useApiCall";
// import { AdminSidebar } from "@/components/AdminSidebar";
// import { Event } from "@/types/event_types";
// import { Mail, Phone, Building2, ChevronLeft, ChevronRight } from "lucide-react";
// import { useEffect, useState } from "react";

// interface Registration {
//     id: string;
//     fname: string;
//     lname: string;
//     email: string;
//     phonenumber: string;
//     collage_name: string;
//     event_id: string;
// }

// const ITEMS_PER_PAGE = 10;

// export default function RegistrationsPage() {
//     const { makeApiCall } = useApiCall();

//     const [events, setEvents] = useState<Event[]>([]);
//     const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
//     const [registrations, setRegistrations] = useState<Registration[]>([]);
//     const [loading, setLoading] = useState(false);
//     const [currentPage, setCurrentPage] = useState(1);

//     // Fetch all events
//     useEffect(() => {
//         const fetchEvents = async () => {
//             const res = await makeApiCall("GET", APIENDPOINT.GetAllEvents);
//             if (res.success && res.data) {
//                 setEvents(Array.isArray(res.data) ? res.data : []);
//                 if (Array.isArray(res.data) && res.data.length > 0) {
//                     setSelectedEvent(res.data[0]);
//                 }
//             }
//         };
//         fetchEvents();
//     }, [makeApiCall]);

//     // Fetch registrations for selected event
//     useEffect(() => {
//         if (!selectedEvent) return;

//         const fetchRegistrations = async () => {
//             setLoading(true);
//             setCurrentPage(1);
//             try {
//                 const res = await makeApiCall(
//                     "GET",
//                     APIENDPOINT.GetRegistrationsByEventId(selectedEvent.id)
//                 );

//                 if (res.success && res.data) {
//                     setRegistrations(Array.isArray(res.data) ? res.data : []);
//                 } else {
//                     setRegistrations([]);
//                 }
//             } catch (error) {
//                 console.error("Error fetching registrations:", error);
//                 setRegistrations([]);
//             } finally {
//                 setLoading(false);
//             }
//         };

//         fetchRegistrations();
//     }, [selectedEvent, makeApiCall]);

//     const totalPages = Math.ceil(registrations.length / ITEMS_PER_PAGE);
//     const paginatedRegistrations = registrations.slice(
//         (currentPage - 1) * ITEMS_PER_PAGE,
//         currentPage * ITEMS_PER_PAGE
//     );

//     return (
//         <div className="flex min-h-screen" style={{ background: "var(--bg-page)" }}>
//             <AdminSidebar />

//             <main className="flex-1 px-4 py-8 font-sans text-text-primary sm:px-6 sm:py-12">
//                 <div className="mx-auto max-w-6xl">
//                     {/* Header */}
//                     <div className="mb-8">
//                         <h1 className="text-3xl font-bold" style={{ color: "var(--text-primary)" }}>
//                             Registrations
//                         </h1>
//                         <p className="mt-2" style={{ color: "var(--text-muted)" }}>
//                             View and manage event registrations
//                         </p>
//                     </div>

//                     {/* Event Selection */}
//                     <div className="mb-8 overflow-hidden rounded-lg"
//                         style={{
//                             background: "var(--bg-surface-raised)",
//                             border: "1px solid var(--border-default)"
//                         }}>
//                         <div className="p-6">
//                             <label className="block text-sm font-semibold mb-4"
//                                 style={{ color: "var(--text-secondary)" }}>
//                                 Select Event
//                             </label>
//                             <select
//                                 value={selectedEvent?.id || ""}
//                                 onChange={(e) => {
//                                     const selected = events.find(ev => ev.id === e.target.value);
//                                     setSelectedEvent(selected || null);
//                                 }}
//                                 className="input w-full max-w-sm"
//                             >
//                                 <option value="">-- Choose an event --</option>
//                                 {events.map((event) => (
//                                     <option key={event.id} value={event.id}>
//                                         {event.event_name}
//                                     </option>
//                                 ))}
//                             </select>
//                         </div>
//                     </div>

//                     {/* Registrations Table */}
//                     {selectedEvent && (
//                         <div className="overflow-hidden rounded-lg"
//                             style={{
//                                 background: "var(--bg-surface-raised)",
//                                 border: "1px solid var(--border-default)"
//                             }}>
//                             {/* Table Header */}
//                             <div className="px-6 py-4 border-b"
//                                 style={{ borderColor: "var(--border-default)" }}>
//                                 <div className="flex items-center justify-between">
//                                     <div>
//                                         <h2 className="text-lg font-semibold"
//                                             style={{ color: "var(--text-primary)" }}>
//                                             {selectedEvent.event_name}
//                                         </h2>
//                                         <p className="text-sm mt-1"
//                                             style={{ color: "var(--text-muted)" }}>
//                                             Total registrations: <span className="font-semibold" style={{ color: "var(--color-accent)" }}>
//                                                 {registrations.length}
//                                             </span>
//                                         </p>
//                                     </div>
//                                 </div>
//                             </div>

//                             {/* Table */}
//                             {loading ? (
//                                 <div className="p-8 text-center"
//                                     style={{ color: "var(--text-muted)" }}>
//                                     Loading registrations...
//                                 </div>
//                             ) : registrations.length === 0 ? (
//                                 <div className="p-8 text-center"
//                                     style={{ color: "var(--text-muted)" }}>
//                                     No registrations yet
//                                 </div>
//                             ) : (
//                                 <>
//                                     <div className="overflow-x-auto">
//                                         <table className="w-full">
//                                             <thead>
//                                                 <tr style={{ borderBottom: "1px solid var(--border-default)" }}>
//                                                     <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
//                                                         style={{ color: "var(--text-muted)" }}>
//                                                         Name
//                                                     </th>
//                                                     <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
//                                                         style={{ color: "var(--text-muted)" }}>
//                                                         Email
//                                                     </th>
//                                                     <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
//                                                         style={{ color: "var(--text-muted)" }}>
//                                                         Phone
//                                                     </th>
//                                                     <th className="px-6 py-4 text-left text-xs font-semibold uppercase tracking-wider"
//                                                         style={{ color: "var(--text-muted)" }}>
//                                                         College
//                                                     </th>
//                                                 </tr>
//                                             </thead>
//                                             <tbody>
//                                                 {paginatedRegistrations.map((registration, index) => (
//                                                     <tr
//                                                         key={registration.id}
//                                                         style={{
//                                                             borderBottom: index !== paginatedRegistrations.length - 1 ? "1px solid var(--border-default)" : "none",
//                                                             background: index % 2 === 0 ? "transparent" : "var(--bg-surface)"
//                                                         }}>
//                                                         <td className="px-6 py-4 text-sm"
//                                                             style={{ color: "var(--text-primary)" }}>
//                                                             <div className="font-medium">
//                                                                 {registration.fname} {registration.lname}
//                                                             </div>
//                                                         </td>
//                                                         <td className="px-6 py-4 text-sm"
//                                                             style={{ color: "var(--text-secondary)" }}>
//                                                             <div className="flex items-center gap-2">
//                                                                 <Mail size={14} style={{ color: "var(--text-muted)" }} />
//                                                                 {registration.email}
//                                                             </div>
//                                                         </td>
//                                                         <td className="px-6 py-4 text-sm"
//                                                             style={{ color: "var(--text-secondary)" }}>
//                                                             <div className="flex items-center gap-2">
//                                                                 <Phone size={14} style={{ color: "var(--text-muted)" }} />
//                                                                 {registration.phonenumber}
//                                                             </div>
//                                                         </td>
//                                                         <td className="px-6 py-4 text-sm"
//                                                             style={{ color: "var(--text-secondary)" }}>
//                                                             <div className="flex items-center gap-2">
//                                                                 <Building2 size={14} style={{ color: "var(--text-muted)" }} />
//                                                                 {registration.collage_name}
//                                                             </div>
//                                                         </td>
//                                                     </tr>
//                                                 ))}
//                                             </tbody>
//                                         </table>
//                                     </div>

//                                     {/* Pagination */}
//                                     {totalPages > 1 && (
//                                         <div className="px-6 py-4 border-t flex items-center justify-between"
//                                             style={{ borderColor: "var(--border-default)" }}>
//                                             <p className="text-sm"
//                                                 style={{ color: "var(--text-muted)" }}>
//                                                 Page {currentPage} of {totalPages} • Showing {paginatedRegistrations.length} of {registrations.length}
//                                             </p>
//                                             <div className="flex items-center gap-2">
//                                                 <button
//                                                     onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
//                                                     disabled={currentPage === 1}
//                                                     className="inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-colors disabled:opacity-50"
//                                                     style={{
//                                                         borderColor: "var(--border-default)",
//                                                         background: currentPage === 1 ? "var(--bg-surface)" : "var(--bg-surface-raised)",
//                                                         color: "var(--text-secondary)"
//                                                     }}>
//                                                     <ChevronLeft size={16} />
//                                                 </button>
//                                                 <button
//                                                     onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
//                                                     disabled={currentPage === totalPages}
//                                                     className="inline-flex items-center justify-center w-8 h-8 rounded-lg border transition-colors disabled:opacity-50"
//                                                     style={{
//                                                         borderColor: "var(--border-default)",
//                                                         background: currentPage === totalPages ? "var(--bg-surface)" : "var(--bg-surface-raised)",
//                                                         color: "var(--text-secondary)"
//                                                     }}>
//                                                     <ChevronRight size={16} />
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     )}
//                                 </>
//                             )}
//                         </div>
//                     )}
//                 </div>
//             </main>
//         </div>
//     );
// }


export default function reg() {
    return <></>
}