'use client'
import axios from "axios";
import { useState, type ChangeEvent, type FormEvent } from "react";

// ── Types ────────────────────────────────────────────────────────────────────

type JobStatus = "applied" | "interview" | "rejected" | "offer";
type JobType   = "remote" | "hybrid" | "onsite";
type Priority  = "high" | "medium" | "low";

interface JobFormData {
  companyName: string;
  position: string;
  jobLink: string;
  location: string;
  jobType: JobType;
  status: JobStatus;
  via: string;
  priority: Priority;
  date: string;
  note: string;
  isActive: boolean;
}

const INITIAL_FORM: JobFormData = {
  companyName: "",
  position: "",
  jobLink: "",
  location: "",
  jobType: "remote",
  status: "applied",
  via: "",
  priority: "medium",
  date: new Date().toISOString().split("T")[0],
  note: "",
  isActive: true,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

// ── Small UI Atoms ────────────────────────────────────────────────────────────

const Label = ({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) => (
  <label
    htmlFor={htmlFor}
    className="block text-xs font-semibold text-gray-600 uppercase tracking-widest mb-1.5"
  >
    {children}
  </label>
);

const inputBase =
  "w-full bg-white/70 border border-gray-200/60 text-gray-900 text-sm rounded-xl px-4 py-2.5 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/50 transition-all duration-200 shadow-sm";

const Input = ({
  id, name, type = "text", placeholder, value, onChange, required,
}: {
  id: string; name: string; type?: string; placeholder?: string;
  value: string; onChange: (e: ChangeEvent<HTMLInputElement>) => void; required?: boolean;
}) => (
  <input
    id={id} name={name} type={type} placeholder={placeholder}
    value={value} onChange={onChange} required={required}
    className={inputBase}
  />
);

const Textarea = ({
  id, name, placeholder, value, onChange, rows = 3,
}: {
  id: string; name: string; placeholder?: string;
  value: string; onChange: (e: ChangeEvent<HTMLTextAreaElement>) => void; rows?: number;
}) => (
  <textarea
    id={id} name={name} placeholder={placeholder}
    value={value} onChange={onChange} rows={rows}
    className={`${inputBase} resize-none`}
  />
);

// ── Pill Toggle Group ─────────────────────────────────────────────────────────

function PillGroup<T extends string>({
  options, value, onChange, colorMap,
}: {
  options: { value: T; label: string; icon?: string }[];
  value: T;
  onChange: (v: T) => void;
  colorMap?: Record<T, string>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map(opt => {
        const active = value === opt.value;
        const accent = colorMap?.[opt.value];
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 shadow-sm
              ${active
                ? accent
                  ? `${accent} border-transparent shadow-lg scale-105`
                  : "bg-white/80 text-gray-900 border-transparent shadow-lg scale-105"
                : "bg-gray-100 text-gray-700 border-gray-200/50 hover:bg-gray-200 hover:text-gray-900"
              }`}
          >
            {opt.icon && <span className="mr-1">{opt.icon}</span>}
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

// ── Success Toast ─────────────────────────────────────────────────────────────

const SuccessToast = ({ id, onClose }: { id: string; onClose: () => void }) => (
  <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-emerald-500/95 border border-emerald-400/50 text-white px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur-sm animate-fade-in">
    <span className="text-lg">✅</span>
    <div>
      <p className="text-sm font-bold">Job added!</p>
      <p className="text-xs font-mono">{id}</p>
    </div>
    <button onClick={onClose} className="ml-2 text-white/80 hover:text-white transition-colors text-lg leading-none">×</button>
  </div>
);

// ── Main Form Component ───────────────────────────────────────────────────────

export default function AddJobForm({
  onSubmit,
}: {
  onSubmit?: (job: JobFormData & {  createdAt: string; updatedAt: string }) => void;
}) {
  const [form, setForm]       = useState<JobFormData>(INITIAL_FORM);
  const [toast, setToast]     = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (field: keyof JobFormData) =>
    (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
      setForm(prev => ({ ...prev, [field]: e.target.value }));

  const setPill = <K extends keyof JobFormData>(field: K, value: JobFormData[K]) =>
    setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // simulate delay (optional)
      await new Promise((r) => setTimeout(r, 700));

      const now = new Date().toISOString().split("T")[0];
      const newJob = { ...form, createdAt: now, updatedAt: now };

      // 🔹 Axios POST request
      const res = await axios.post("/api/v1/jobs/post", newJob);

      if (res.data.success) {
        console.log("✅ New Job Submitted:", res.data.data);
        setToast(`${res.data.data.companyName} added successfully!`);
        
        // reset form
        setForm(INITIAL_FORM);

        // optional: call parent submit callback
        onSubmit?.(res.data.data);
      } else {
        console.error("❌ Submission failed:", res.data.message);
        setToast("Submission failed");
      }
    } catch (err) {
      console.error("❌ Error submitting job:", err);
      setToast("Error submitting job");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,700;0,900;1,400&display=swap"
        rel="stylesheet"
      />

      <div
        className="min-h-screen bg-gray-50 flex items-start justify-center p-6 py-10"
        style={{ fontFamily: "'DM Sans', sans-serif" }}
      >
        <div className="w-full max-w-2xl">

          {/* Header */}
          <div className="mb-8 flex items-center gap-3">
            <div className="w-2 h-9 rounded-full bg-gradient-to-b from-blue-400 to-indigo-500" />
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">Add Application</h1>
              <p className="text-gray-600 text-sm font-medium">Track a new job you've applied to</p>
            </div>
          </div>

          {/* Card */}
          <form
            onSubmit={handleSubmit}
            className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 flex flex-col gap-6 shadow-xl"
          >

            {/* Row 1: Company + Position */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="companyName">Company Name *</Label>
                <Input id="companyName" name="companyName" placeholder="e.g. Google" value={form.companyName} onChange={set("companyName")} required />
              </div>
              <div>
                <Label htmlFor="position">Position *</Label>
                <Input id="position" name="position" placeholder="e.g. Frontend Engineer" value={form.position} onChange={set("position")} required />
              </div>
            </div>

            {/* Row 2: Link + Location */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="jobLink">Job Link</Label>
                <Input id="jobLink" name="jobLink" type="url" placeholder="https://..." value={form.jobLink} onChange={set("jobLink")} />
              </div>
              <div>
                <Label htmlFor="location">Location *</Label>
                <Input id="location" name="location" placeholder="e.g. Remote / Berlin" value={form.location} onChange={set("location")} required />
              </div>
            </div>

            {/* Row 3: Date + Via */}
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <Label htmlFor="date">Application Date</Label>
                <Input id="date" name="date" type="date" value={form.date} onChange={set("date")} />
              </div>
              <div>
                <Label htmlFor="via">Applied Via</Label>
                <Input id="via" name="via" placeholder="e.g. LinkedIn, Indeed, Referral" value={form.via} onChange={set("via")} />
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200" />

            {/* Job Type */}
            <div>
              <Label htmlFor="jobType">Job Type</Label>
              <PillGroup<JobType>
                options={[
                  { value: "remote", label: "Remote", icon: "🌐" },
                  { value: "hybrid", label: "Hybrid", icon: "🔀" },
                  { value: "onsite", label: "Onsite", icon: "🏢" },
                ]}
                value={form.jobType}
                onChange={v => setPill("jobType", v)}
              />
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status">Status</Label>
              <PillGroup<JobStatus>
                options={[
                  { value: "applied",   label: "Applied"   },
                  { value: "interview", label: "Interview" },
                  { value: "rejected",  label: "Rejected"  },
                  { value: "offer",     label: "Offer"     },
                ]}
                value={form.status}
                onChange={v => setPill("status", v)}
                colorMap={{
                  applied:   "bg-sky-500/20 text-sky-700 border-sky-300/50",
                  interview: "bg-amber-500/20 text-amber-700 border-amber-300/50",
                  rejected:  "bg-rose-500/20 text-rose-700 border-rose-300/50",
                  offer:     "bg-emerald-500/20 text-emerald-700 border-emerald-300/50",
                }}
              />
            </div>

            {/* Priority */}
            <div>
              <Label htmlFor="priority">Priority</Label>
              <PillGroup<Priority>
                options={[
                  { value: "high",   label: "⚑ High"   },
                  { value: "medium", label: "⚑ Medium" },
                  { value: "low",    label: "⚑ Low"    },
                ]}
                value={form.priority}
                onChange={v => setPill("priority", v)}
                colorMap={{
                  high:   "bg-rose-500/20 text-rose-700 border-rose-300/50",
                  medium: "bg-amber-500/20 text-amber-700 border-amber-300/50",
                  low:    "bg-gray-200 text-gray-700 border-gray-300",
                }}
              />
            </div>

            {/* Divider */}
            <div className="border-t border-gray-200" />

            {/* Note */}
            <div>
              <Label htmlFor="note">Notes</Label>
              <Textarea id="note" name="note" placeholder="Any extra context — interview tips, recruiter name, deadline..." value={form.note} onChange={set("note")} rows={3} />
            </div>

            {/* Active toggle */}
            <div className="flex items-center justify-between bg-gray-50/50 rounded-xl px-4 py-3 border border-gray-200/50 shadow-sm">
              <div>
                <p className="text-sm font-semibold text-gray-900">Mark as Active</p>
                <p className="text-xs text-gray-600 mt-0.5">Active jobs appear highlighted in the tracker</p>
              </div>
              <button
                type="button"
                onClick={() => setForm(p => ({ ...p, isActive: !p.isActive }))}
                className={`relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none shadow-sm
                  ${form.isActive ? "bg-blue-500" : "bg-gray-300"}`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow-md transition-all duration-300
                    ${form.isActive ? "left-7" : "left-1"}`}
                />
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-2xl font-bold text-sm tracking-wide transition-all duration-300 shadow-lg
                ${loading
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-400 hover:to-indigo-400 hover:shadow-xl hover:shadow-blue-500/25 active:scale-[0.98]"
                }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                  </svg>
                  Saving...
                </span>
              ) : (
                "＋ Add Application"
              )}
            </button>

          </form>
        </div>
      </div>

      {/* Toast */}
      {toast && <SuccessToast id={toast} onClose={() => setToast(null)} />}
    </>
  );
}
