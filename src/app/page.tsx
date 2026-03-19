'use client'
import { deleteJobById, getAppliedJobs } from "@/lib/getAPIs";
import { useEffect, useState, useCallback } from "react";
import { 
  Briefcase, 
  MapPin, 
  Globe, 
  Calendar, 
  Link2, 
  Edit3, 
  Trash2,
  Filter,
  BriefcaseIcon 
} from "lucide-react";

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
  applied:   { label: "Applied",   bg: "bg-sky-500/10 border-sky-500/20",    text: "text-sky-400",    dot: "bg-sky-400"    },
  interview: { label: "Interview", bg: "bg-amber-500/10 border-amber-500/20",  text: "text-amber-400",  dot: "bg-amber-400"  },
  rejected:  { label: "Rejected",  bg: "bg-rose-500/10 border-rose-500/20",   text: "text-rose-400",   dot: "bg-rose-400"   },
  offer:     { label: "Offer",     bg: "bg-emerald-500/10 border-emerald-500/20",text: "text-emerald-400",dot: "bg-emerald-400" },
};

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string }> = {
  high:   { label: "High",   color: "text-rose-400", bg: "bg-rose-500/10"   },
  medium: { label: "Medium", color: "text-amber-400", bg: "bg-amber-500/10"  },
  low:    { label: "Low",    color: "text-slate-400", bg: "bg-slate-500/10"  },
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
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${c.bg} ${c.text} backdrop-blur-sm`}>
      <span className={`w-2 h-2 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
};

const PriorityFlag = ({ priority }: { priority: Priority }) => {
  const c = PRIORITY_CONFIG[priority];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${c.bg} ${c.color}`}>
      ⚑ {c.label}
    </span>
  );
};

const ActionButton = ({ 
  icon: Icon, 
  onClick, 
  variant = "ghost",
  className = ""
}: {
  icon: any;
  onClick: () => void;
  variant?: "ghost" | "destructive";
  className?: string;
}) => (
  <button
    onClick={onClick}
    className={`
      p-2 rounded-xl text-slate-400 hover:text-white transition-all duration-200 hover:scale-105
      ${variant === "destructive" ? "hover:text-rose-400 hover:bg-rose-500/10" : "hover:bg-slate-800/50"}
      ${className}
    `}
    title={variant === "destructive" ? "Delete" : "Edit"}
  >
    <Icon className="w-4 h-4" />
  </button>
);

const JobCard = ({ job, onDelete }: { job: Job; onDelete: (id: string) => void }) => {
  const handleDelete = async () => {
    const confirmDelete = confirm("Are you sure you want to delete this job?");
    if (!confirmDelete) return;

    try {
      const res = await deleteJobById(job._id);
      if (!res?.success) throw new Error("Delete failed");
      onDelete(job._id);
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete job");
    }
  };

  return (
    <div className={`
      group/card relative rounded-3xl border p-6 flex flex-col gap-4 h-fit
      transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-slate-600/50
      backdrop-blur-sm bg-slate-900/80 border-slate-700/50
      ${!job.isActive && "opacity-60 bg-slate-900/40 border-slate-800/30"}
    `}>
      {/* Gradient accent */}
      <div className="absolute top-4 right-4 w-2 h-20 bg-gradient-to-b from-sky-400 to-indigo-500 rounded-full blur-sm opacity-60" />
      
      {/* Top row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-bold text-lg leading-tight truncate group-hover/card:text-sky-400">
            {job.companyName}
          </h3>
          <p className="text-slate-400 text-sm mt-1 font-medium truncate">{job.position}</p>
        </div>
        <StatusBadge status={job.status} />
      </div>

      {/* Meta grid */}
      <div className="grid grid-cols-2 gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-sky-400 flex-shrink-0" />
          {job.location}
        </div>
        <div className="flex items-center gap-2">
          <Globe className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
          {TYPE_CONFIG[job.jobType].label}
        </div>
        <div className="flex items-center gap-2">
          <Link2 className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
          via {job.via}
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          {job.date}
        </div>
      </div>

      {/* Note */}
      {job.note && (
        <div className="bg-slate-800/50 border border-slate-700/40 rounded-2xl p-4 backdrop-blur-sm">
          <p className="text-sm text-slate-300 italic leading-relaxed">"{job.note}"</p>
        </div>
      )}

      {/* Action row */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
        <PriorityFlag priority={job.priority} />
        <div className="flex items-center gap-1">
          <ActionButton icon={Edit3} onClick={() => window.location.href = `/update/${job._id}`} />
          <ActionButton icon={Trash2} onClick={handleDelete} variant="destructive" />
        </div>
        <a
          href={job.jobLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-sky-400 hover:text-sky-300 font-medium transition-all duration-200 group-hover/card:translate-x-1"
        >
          View Listing 
          <BriefcaseIcon className="w-3.5 h-3.5 group-hover/card:rotate-3 transition-transform duration-200" />
        </a>
      </div>
    </div>
  );
};

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
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 p-6 bg-slate-900/50 rounded-3xl border border-slate-800/50 backdrop-blur-sm">
      {(["applied", "interview", "rejected", "offer"] as JobStatus[]).map(s => {
        const c = STATUS_CONFIG[s];
        const count = counts[s] as number;
        return (
          <div 
            key={s} 
            className="group relative flex flex-col items-center gap-2 p-4 rounded-2xl transition-all duration-200 hover:scale-105 hover:bg-white/5"
          >
            <div className={`w-3 h-3 rounded-full ${c.dot} absolute -top-1 -right-1 shadow-lg`} />
            <div className={`text-3xl font-black ${c.text} group-hover:scale-110 transition-transform`}>
              {count}
            </div>
            <span className="text-xs text-slate-400 uppercase tracking-wider font-medium text-center">
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
  <div className="flex flex-wrap gap-3 mb-8 p-4 bg-slate-900/30 rounded-2xl border border-slate-800/30 backdrop-blur-sm">
    <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
      <Filter className="w-4 h-4" />
      Filter by status
    </div>
    <div className="flex flex-wrap gap-2">
      {ALL_STATUSES.map(s => {
        const isActive = s === active;
        const label = s === "all" ? "All" : STATUS_CONFIG[s as JobStatus].label;
        return (
          <button
            key={s}
            onClick={() => onChange(s)}
            className={`px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all duration-300 backdrop-blur-sm border
              ${isActive
                ? "bg-gradient-to-r from-white to-slate-100 text-slate-900 shadow-xl shadow-white/20 scale-105 border-white/30"
                : "bg-slate-800/50 text-slate-300 hover:bg-slate-700/50 hover:text-white hover:border-slate-600/50 border-slate-700/30 hover:scale-[1.02]"
              }`}
          >
            {label}
          </button>
        );
      })}
    </div>
  </div>
);

// ── Loading & Empty States ───────────────────────────────────────────────────

const LoadingSkeleton = () => (
  <div className="space-y-4">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="animate-pulse bg-slate-900/50 rounded-3xl p-6">
        <div className="h-6 bg-slate-800/50 rounded-xl w-3/4 mb-4"></div>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="h-4 bg-slate-800/30 rounded w-20"></div>
          <div className="h-4 bg-slate-800/30 rounded w-24"></div>
        </div>
        <div className="h-20 bg-slate-800/30 rounded-2xl mb-6"></div>
        <div className="h-10 bg-slate-800/20 rounded-xl w-32"></div>
      </div>
    ))}
  </div>
);

const EmptyState = ({ filter }: { filter: string }) => (
  <div className="text-center py-20 px-8 bg-slate-900/30 rounded-3xl border-2 border-dashed border-slate-700/50">
    <div className="w-24 h-24 bg-gradient-to-br from-slate-800/50 to-transparent rounded-3xl flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
      <Briefcase className="w-12 h-12 text-slate-500" />
    </div>
    <h3 className="text-xl font-bold text-white mb-2">No jobs {filter !== 'all' ? `in "${filter}"` : 'yet'}</h3>
    <p className="text-slate-400 text-sm max-w-md mx-auto mb-6">
      {filter !== 'all' 
        ? `No jobs match the "${filter}" filter. Try adjusting your filter above.`
        : "Get started by adding your first job application."
      }
    </p>
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
      try {
        const data = await getAppliedJobs();
        if (data) setJobs(data);
      } catch (err) {
        console.error("Failed to fetch jobs:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  const handleDelete = useCallback((id: string) => {
    setJobs(prev => prev.filter(job => job._id !== id));
  }, []);

  const filteredJobs = filter === "all" ? jobs : jobs.filter(j => j.status === filter);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white p-6 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-sky-500/20 rounded-full mix-blend-multiply filter blur-xl animate-blob"></div>
        <div className="absolute top-1/2 right-1/4 w-72 h-72 bg-emerald-500/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-72 h-72 bg-rose-500/20 rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000"></div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12 pt-12">
          <div className="inline-flex items-center gap-4 mb-4 px-8 py-4 bg-slate-900/50 backdrop-blur-xl rounded-3xl border border-slate-800/50">
            <div className="w-3 h-12 bg-gradient-to-b from-sky-400 via-indigo-400 to-purple-500 rounded-2xl shadow-lg" />
            <div>
              <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent tracking-tight">
                Job Tracker
              </h1>
              <p className="text-slate-400 text-lg mt-2">
                {jobs.length} applications • {new Date().toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <StatsBar jobs={jobs} />

        {/* Filters */}
        <FilterBar active={filter} onChange={setFilter} />

        {/* Content */}
        <div className="space-y-6">
          {loading ? (
            <LoadingSkeleton />
          ) : filteredJobs.length === 0 ? (
            <EmptyState filter={filter} />
          ) : (
            <div className="grid gap-6">
              {filteredJobs.map(job => (
                <JobCard key={job._id} job={job} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
