"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { getJobById, updateJobById } from "@/lib/getAPIs";

// ── Types ────────────────────────────────────────────────────────────────────

type JobStatus = "applied" | "interview" | "rejected" | "offer";
type JobType   = "remote" | "hybrid" | "onsite";
type Priority  = "high" | "medium" | "low";

interface Job {
  _id: string;
  date: string;
  companyName: string;
  jobLink: string;
  location: string;
  position: string;
  jobType: JobType;
  status: JobStatus;
  via: string;
  note: string;
  isActive: boolean;
  priority: Priority;
  createdAt: string;
  updatedAt: string;
}

type JobFormData = Omit<Job, "_id" | "createdAt" | "updatedAt">;

// ── Helpers ───────────────────────────────────────────────────────────────────

const toFormData = (job: Job): JobFormData => ({
  date: job.date,
  companyName: job.companyName,
  jobLink: job.jobLink,
  location: job.location,
  position: job.position,
  jobType: job.jobType,
  status: job.status,
  via: job.via,
  note: job.note,
  isActive: job.isActive,
  priority: job.priority,
});

const isDirty = (original: Job, current: JobFormData): boolean =>
  (Object.keys(current) as (keyof JobFormData)[]).some(
    (key) => String(current[key]) !== String(original[key as keyof Job])
  );

// ── UI Atoms ──────────────────────────────────────────────────────────────────

const Label = ({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) => (
  <label htmlFor={htmlFor} className="block text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1.5">
    {children}
  </label>
);

const inputBase =
  "w-full bg-white/70 border border-gray-200/60 text-gray-900 text-sm rounded-xl px-4 py-2.5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all duration-200 shadow-sm";

const Input = ({ id, name, type = "text", placeholder, value, onChange, required }: {
  id: string; name: string; type?: string; placeholder?: string;
  value: string; onChange: (e: ChangeEvent<HTMLInputElement>) => void; required?: boolean;
}) => (
  <input id={id} name={name} type={type} placeholder={placeholder}
    value={value} onChange={onChange} required={required} className={inputBase} />
);

const Textarea = ({ id, name, placeholder, value, onChange, rows = 3 }: {
  id: string; name: string; placeholder?: string;
  value: string; onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void; rows?: number;
}) => (
  <textarea id={id} name={name} placeholder={placeholder}
    value={value} onChange={onChange} rows={rows} className={`${inputBase} resize-none`} />
);

function PillGroup<T extends string>({ options, value, onChange, colorMap }: {
  options: { value: T; label: string; icon?: string }[];
  value: T;
  onChange: (v: T) => void;
  colorMap?: Record<T, string>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value === opt.value;
        const accent = colorMap?.[opt.value];
        return (
          <button key={opt.value} type="button" onClick={() => onChange(opt.value)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200
              ${active
                ? accent ? `${accent} border-transparent shadow-lg scale-105` : "bg-white/80 text-gray-900 border-transparent shadow-lg scale-105"
                : "bg-gray-100 text-gray-700 border-gray-200/50 hover:bg-gray-200 hover:text-gray-900"
              }`}>
            {opt.icon && <span className="mr-1">{opt.icon}</span>}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

const ChangedDot = () => (
  <span className="ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-blue-400 align-middle" title="Modified" />
);

const Toast = ({ type, id, onClose }: { type: "success" | "reset"; id?: string; onClose: () => void }) => (
  <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-sm border
    ${type === "success" ? "bg-emerald-500/90 border-emerald-400/50 text-white shadow-emerald-500/25" : "bg-gray-500/90 border-gray-400/50 text-white shadow-gray-500/25"}`}>
    <span className="text-lg">{type === "success" ? "✅" : "↺"}</span>
    <div>
      <p className="text-sm font-bold">{type === "success" ? "Job updated!" : "Changes reset"}</p>
      {id && <p className="text-xs opacity-90 font-mono">{id}</p>}
    </div>
    <button onClick={onClose} className="ml-2 opacity-70 hover:opacity-100 transition-opacity text-lg leading-none">×</button>
  </div>
);

const DiffSummary = ({ original, current }: { original: Job; current: JobFormData }) => {
  const changed = (Object.keys(current) as (keyof JobFormData)[]).filter(
    (key) => String(current[key]) !== String(original[key as keyof Job])
  );
  if (changed.length === 0) return null;
  const labels: Record<string, string> = {
    companyName: "Company", position: "Position", jobLink: "Link", location: "Location",
    jobType: "Job Type", status: "Status", via: "Via", priority: "Priority",
    date: "Date", note: "Note", isActive: "Active",
  };
  return (
    <div className="flex items-start gap-2 bg-blue-500/10 border border-blue-200/50 rounded-xl px-4 py-3 text-xs text-blue-700">
      <span className="mt-0.5 shrink-0">✏️</span>
      <span>
        <span className="font-bold">{changed.length} field{changed.length > 1 ? "s" : ""} changed: </span>
        {changed.map((k) => labels[k] ?? k).join(", ")}
      </span>
    </div>
  );
};

// ── Skeleton ──────────────────────────────────────────────────────────────────

const Skeleton = () => (
  <div className="animate-pulse flex flex-col gap-5">
    {[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-xl w-full shadow-sm" />)}
    <div className="h-24 bg-gray-100 rounded-xl w-full shadow-sm" />
    <div className="h-12 bg-gray-100 rounded-2xl w-full shadow-sm" />
  </div>
);

// ── Error State ───────────────────────────────────────────────────────────────

const ErrorState = ({ id, onRetry }: { id: string; onRetry: () => void }) => (
  <div className="flex flex-col items-center justify-center gap-4 py-20 text-center">
    <span className="text-5xl text-yellow-500">⚠️</span>
    <div>
      <p className="text-gray-900 font-bold text-lg">Failed to load job</p>
      <p className="text-gray-600 text-sm mt-1">
        Could not find job with ID{" "}
        <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-800 shadow-sm">{id}</span>
      </p>
      <p className="text-gray-500 text-xs mt-3 max-w-xs mx-auto">
        Make sure <span className="font-mono text-gray-600">NEXT_PUBLIC_BASE_URL</span> is set in{" "}
        <span className="font-mono text-gray-600">.env.local</span> and the route{" "}
        <span className="font-mono text-gray-600">/api/jobs/[id]</span> exists.
      </p>
    </div>
    <button onClick={onRetry}
      className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-900 text-sm font-semibold rounded-xl transition-colors border border-gray-200 shadow-sm hover:shadow-md">
      ↺ Try again
    </button>
  </div>
);

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function UpdateJobPage() {
  const params = useParams();
  const router = useRouter();
  const id     = params?.id as string;

  const [job,        setJob]        = useState<Job | null>(null);
  const [form,       setForm]       = useState<JobFormData | null>(null);
  const [fetchState, setFetchState] = useState<"loading" | "error" | "ready">("loading");
  const [loading,    setLoading]    = useState(false);
  const [toast,      setToast]      = useState<{ type: "success" | "reset" } | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────────

  const fetchJob = async () => {
    setFetchState("loading");
    try {
      const data: Job | null = await getJobById(id);

      if (!data) {
        setFetchState("error");
        return;
      }

      setJob(data);
      setForm(toFormData(data));
      setFetchState("ready");
    } catch (err) {
      console.error("Unexpected error in fetchJob:", err);
      setFetchState("error");
    }
  };

  useEffect(() => {
    if (id) fetchJob();
  }, [id]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const set = (field: keyof JobFormData) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((prev) => prev ? { ...prev, [field]: e.target.value } : prev);

  const setPill = <K extends keyof JobFormData>(field: K, value: JobFormData[K]) =>
    setForm((prev) => prev ? { ...prev, [field]: value } : prev);

  const handleReset = () => {
    if (!job) return;
    setForm(toFormData(job));
    setToast({ type: "reset" });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!job || !form || !isDirty(job, form)) return;

    setLoading(true);
    try {
      const updated = await updateJobById(job._id, form);
      if (!updated) throw new Error("Failed to update job");

      setJob(updated);
      setForm(toFormData(updated));
      setToast({ type: "success" });
    } catch (err) {
      console.error("Update failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const changed = (field: keyof JobFormData) =>
    job && form ? String(form[field]) !== String(job[field as keyof Job]) : false;

  const dirty = job && form ? isDirty(job, form) : false;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;900&display=swap" rel="stylesheet" />

      <div className="min-h-screen bg-gray-50 flex items-start justify-center p-6 py-10"
        style={{ fontFamily: "'DM Sans', sans-serif" }}>
        <div className="w-full max-w-2xl">

          {/* Header */}
          <div className="mb-8 flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-2 h-9 rounded-full bg-gradient-to-b from-blue-400 to-indigo-500" />
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Edit Application</h1>
                <p className="text-gray-600 text-sm font-mono">
                  {fetchState === "ready" ? job?._id : `Loading ID: ${id}`}
                </p>
              </div>
            </div>
            <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900 text-sm transition-colors mt-1 font-medium">
              ✕ Cancel
            </button>
          </div>

          {/* Loading */}
          {fetchState === "loading" && (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-lg">
              <Skeleton />
            </div>
          )}

          {/* Error */}
          {fetchState === "error" && (
            <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-lg">
              <ErrorState id={id} onRetry={fetchJob} />
            </div>
          )}

          {/* Form */}
          {fetchState === "ready" && job && form && (
            <form onSubmit={handleSubmit}
              className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-xl">

              <DiffSummary original={job} current={form} />

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="companyName">Company Name * {changed("companyName") && <ChangedDot />}</Label>
                  <Input id="companyName" name="companyName" placeholder="e.g. Google" value={form.companyName} onChange={set("companyName")} required />
                </div>
                <div>
                  <Label htmlFor="position">Position * {changed("position") && <ChangedDot />}</Label>
                  <Input id="position" name="position" placeholder="e.g. Frontend Engineer" value={form.position} onChange={set("position")} required />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="jobLink">Job Link {changed("jobLink") && <ChangedDot />}</Label>
                  <Input id="jobLink" name="jobLink" type="url" placeholder="https://..." value={form.jobLink} onChange={set("jobLink")} />
                </div>
                <div>
                  <Label htmlFor="location">Location * {changed("location") && <ChangedDot />}</Label>
                  <Input id="location" name="location" placeholder="e.g. Remote / Berlin" value={form.location} onChange={set("location")} required />
                </div>
              </div>

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <Label htmlFor="date">Application Date {changed("date") && <ChangedDot />}</Label>
                  <Input id="date" name="date" type="date" value={form.date} onChange={set("date")} />
                </div>
                <div>
                  <Label htmlFor="via">Applied Via {changed("via") && <ChangedDot />}</Label>
                  <Input id="via" name="via" placeholder="e.g. LinkedIn, Indeed" value={form.via} onChange={set("via")} />
                </div>
              </div>

              <div className="border-t border-gray-200" />

              <div>
                <Label htmlFor="jobType">Job Type {changed("jobType") && <ChangedDot />}</Label>
                <PillGroup<JobType>
                  options={[{ value: "remote", label: "Remote", icon: "🌐" }, { value: "hybrid", label: "Hybrid", icon: "🔀" }, { value: "onsite", label: "Onsite", icon: "🏢" }]}
                  value={form.jobType} onChange={(v) => setPill("jobType", v)}
                />
              </div>

              <div>
                <Label htmlFor="status">Status {changed("status") && <ChangedDot />}</Label>
                <PillGroup<JobStatus>
                  options={[{ value: "applied", label: "Applied" }, { value: "interview", label: "Interview" }, { value: "rejected", label: "Rejected" }, { value: "offer", label: "Offer" }]}
                  value={form.status} onChange={(v) => setPill("status", v)}
                  colorMap={{ 
                    applied: "bg-sky-500/20 text-sky-700 border-sky-300/50", 
                    interview: "bg-amber-500/20 text-amber-700 border-amber-300/50", 
                    rejected: "bg-rose-500/20 text-rose-700 border-rose-300/50", 
                    offer: "bg-emerald-500/20 text-emerald-700 border-emerald-300/50" 
                  }}
                />
              </div>

              <div>
                <Label htmlFor="priority">Priority {changed("priority") && <ChangedDot />}</Label>
                <PillGroup<Priority>
                  options={[{ value: "high", label: "⚑ High" }, { value: "medium", label: "⚑ Medium" }, { value: "low", label: "⚑ Low" }]}
                  value={form.priority} onChange={(v) => setPill("priority", v)}
                  colorMap={{ 
                    high: "bg-rose-500/20 text-rose-700 border-rose-300/50", 
                    medium: "bg-amber-500/20 text-amber-700 border-amber-300/50", 
                    low: "bg-gray-200 text-gray-700 border-gray-300" 
                  }}
                />
              </div>

              <div className="border-t border-gray-200" />

              <div>
                <Label htmlFor="note">Notes {changed("note") && <ChangedDot />}</Label>
                <Textarea id="note" name="note" placeholder="Interview tips, recruiter name, deadline..." value={form.note} onChange={set("note")} rows={3} />
              </div>

              <div className={`flex items-center justify-between rounded-xl px-4 py-3 border transition-colors
                ${changed("isActive") ? "bg-blue-500/10 border-blue-200/50" : "bg-gray-50/50 border-gray-200/50"}`}>
                <div>
                  <p className="text-sm font-semibold text-gray-900 flex items-center gap-1">
                    Mark as Active {changed("isActive") && <ChangedDot />}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">Active jobs appear highlighted in the tracker</p>
                </div>
                <button type="button" onClick={() => setForm((p) => p ? { ...p, isActive: !p.isActive } : p)}
                  className={`relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none shadow-sm ${form.isActive ? "bg-blue-500" : "bg-gray-300"}`}>
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300 ${form.isActive ? "left-7" : "left-1"}`} />
                </button>
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={handleReset} disabled={!dirty}
                  className={`px-5 py-3 rounded-2xl text-sm font-semibold border transition-all duration-200 shadow-sm
                    ${dirty ? "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 hover:text-gray-900 hover:shadow-md" : "bg-gray-50 text-gray-400 border-gray-100 cursor-not-allowed"}`}>
                  ↺ Reset
                </button>
                <button type="submit" disabled={loading || !dirty}
                  className={`flex-1 py-3 rounded-2xl font-bold text-sm tracking-wide transition-all duration-300 shadow-lg
                    ${loading || !dirty ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-400 hover:to-indigo-400 hover:shadow-xl hover:shadow-blue-500/25 active:scale-[0.98]"}`}>
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                      </svg>
                      Saving...
                    </span>
                  ) : !dirty ? "No Changes" : "Save Changes"}
                </button>
              </div>
            </form>
          )}

          {fetchState === "ready" && job && (
            <p className="text-center text-xs text-gray-500 mt-4 font-mono">
              Last updated: {job.updatedAt} · Created: {job.createdAt}
            </p>
          )}
        </div>
      </div>

      {toast && (
        <Toast type={toast.type} id={toast.type === "success" ? job?._id : undefined} onClose={() => setToast(null)} />
      )}
    </>
  );
}
