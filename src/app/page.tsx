'use client'
import { getAppliedJobs } from "@/lib/getAPIs";
import { useEffect, useState } from "react";

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


// ── Config Maps ──────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<
  JobStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  applied:   { label: "Applied",   bg: "bg-sky-950/60",    text: "text-sky-300",    dot: "bg-sky-400"    },
  interview: { label: "Interview", bg: "bg-amber-950/60",  text: "text-amber-300",  dot: "bg-amber-400"  },
  rejected:  { label: "Rejected",  bg: "bg-rose-950/60",   text: "text-rose-300",   dot: "bg-rose-400"   },
  offer:     { label: "Offer",     bg: "bg-emerald-950/60",text: "text-emerald-300",dot: "bg-emerald-400" },
};

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string }> = {
  high:   { label: "High",   color: "text-rose-400"   },
  medium: { label: "Medium", color: "text-amber-400"  },
  low:    { label: "Low",    color: "text-slate-400"  },
};

const TYPE_CONFIG: Record<JobType, { label: string; icon: string }> = {
  remote: { label: "Remote", icon: "🌐" },
  hybrid: { label: "Hybrid", icon: "🔀" },
  onsite: { label: "Onsite", icon: "🏢" },
};

// ── Sub-components ───────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: JobStatus }) => {
  const c = STATUS_CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${c.bg} ${c.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
};

const PriorityFlag = ({ priority }: { priority: Priority }) => {
  const c = PRIORITY_CONFIG[priority];
  return (
    <span className={`text-xs font-bold uppercase tracking-widest ${c.color}`}>
      ⚑ {c.label}
    </span>
  );
};

const JobCard = ({ job }: { job: Job }) => (
  <div
  onClick={() => window.location.href = `/update/${job._id}`}
    className={`
      relative rounded-2xl border p-5 flex flex-col gap-4
      transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl
      ${job.isActive
        ? "bg-slate-900 border-slate-700/60 hover:border-slate-500/80"
        : "bg-slate-900/40 border-slate-800/40 opacity-60"}
    `}
  >
    {/* Top row */}
    <div className="flex items-start justify-between gap-3">
      <div>
        <h3 className="text-white font-bold text-base leading-snug">
          {job.companyName}
        </h3>
        <p className="text-slate-400 text-sm mt-0.5">{job.position}</p>
      </div>
      <StatusBadge status={job.status} />
    </div>

    {/* Meta row */}
    <div className="flex flex-wrap gap-3 text-xs text-slate-400">
      <span>📍 {job.location}</span>
      <span>{TYPE_CONFIG[job.jobType].icon} {TYPE_CONFIG[job.jobType].label}</span>
      <span>🔗 via {job.via}</span>
      <span>📅 {job.date}</span>
    </div>

    {/* Note */}
    {job.note && (
      <p className="text-xs text-slate-500 bg-slate-800/60 rounded-lg px-3 py-2 italic border border-slate-700/40">
        "{job.note}"
      </p>
    )}

    {/* Bottom row */}
    <div className="flex items-center justify-between pt-1 border-t border-slate-800">
      <PriorityFlag priority={job.priority} />
      <a
        href={job.jobLink}
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-slate-400 hover:text-sky-400 transition-colors underline underline-offset-2"
      >
        View Listing →
      </a>
    </div>
  </div>
);

// ── Stats Bar ────────────────────────────────────────────────────────────────

const StatsBar = ({ jobs }: { jobs: Job[] }) => {
  const counts = {
    total:     jobs.length,
    applied:   jobs.filter(j => j.status === "applied").length,
    interview: jobs.filter(j => j.status === "interview").length,
    rejected:  jobs.filter(j => j.status === "rejected").length,
    offer:     jobs.filter(j => j.status === "offer").length,
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {(["applied", "interview", "rejected", "offer"] as JobStatus[]).map(s => {
        const c = STATUS_CONFIG[s];
        return (
          <div key={s} className={`rounded-xl p-4 border border-transparent ${c.bg} flex flex-col gap-1`}>
            <span className={`text-2xl font-black ${c.text}`}>
              {counts[s]}
            </span>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-medium">
              {c.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

// ── Filter Bar ───────────────────────────────────────────────────────────────

const ALL_STATUSES: (JobStatus | "all")[] = ["all", "applied", "interview", "rejected", "offer"];

const FilterBar = ({
  active,
  onChange,
}: {
  active: JobStatus | "all";
  onChange: (s: JobStatus | "all") => void;
}) => (
  <div className="flex flex-wrap gap-2 mb-5">
    {ALL_STATUSES.map(s => {
      const isActive = s === active;
      const label = s === "all" ? "All" : STATUS_CONFIG[s].label;
      return (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200
            ${isActive
              ? "bg-white text-slate-900 shadow-md scale-105"
              : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white"
            }`}
        >
          {label}
        </button>
      );
    })}
  </div>
);

// ── Main Component ───────────────────────────────────────────────────────────

export default function AppliedJobs() {
   const [jobs, setJobs] = useState<Job[]>([]);
  const [filter, setFilter] = useState<JobStatus | "all">("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      setLoading(true);
      const data = await getAppliedJobs();
      if (data) setJobs(data);
      setLoading(false);
    };
    fetchJobs();
  }, []);

 const filteredJobs =filter === "all" ? jobs : jobs.filter(j => j.status === filter);

  return (
    <div
      className="min-h-screen bg-slate-950 text-white p-6"
      style={{ fontFamily: "'DM Sans', sans-serif" }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700;900&display=swap"
        rel="stylesheet"
      />

      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-2 h-8 rounded-full bg-gradient-to-b from-sky-400 to-indigo-500" />
            <h1 className="text-2xl font-black tracking-tight">Job Tracker</h1>
          </div>
          <p className="text-slate-500 text-sm ml-5">
            {jobs.length} applications · Updated {new Date().toLocaleDateString()}
          </p>
        </div>

        {/* Stats */}
        <StatsBar jobs={jobs} />

        {/* Filters */}
        <FilterBar active={filter} onChange={setFilter} />

        {/* Cards */}
        {filteredJobs.length === 0 ? (
          <div className="text-center py-16 text-slate-600">
            <p className="text-4xl mb-3">📭</p>
            <p className="text-sm">No jobs match this filter.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {filteredJobs.map(job => (
              <JobCard key={job._id} job={job} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}