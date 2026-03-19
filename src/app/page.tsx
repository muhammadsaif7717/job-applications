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
  BriefcaseIcon,
  ExternalLink 
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
  applied:   { label: "Applied",   bg: "bg-sky-500/10 border-sky-200/30",    text: "text-sky-700",    dot: "bg-sky-500"    },
  interview: { label: "Interview", bg: "bg-amber-500/10 border-amber-200/30",  text: "text-amber-700",  dot: "bg-amber-500"  },
  rejected:  { label: "Rejected",  bg: "bg-rose-500/10 border-rose-200/30",   text: "text-rose-700",   dot: "bg-rose-500"   },
  offer:     { label: "Offer",     bg: "bg-emerald-500/10 border-emerald-200/30",text: "text-emerald-700",dot: "bg-emerald-500" },
};

const PRIORITY_CONFIG: Record<Priority, { label: string; color: string; bg: string }> = {
  high:   { label: "High",   color: "text-rose-600", bg: "bg-rose-100/80"   },
  medium: { label: "Medium", color: "text-amber-600", bg: "bg-amber-100/80"  },
  low:    { label: "Low",    color: "text-gray-500", bg: "bg-gray-100/80"  },
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
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm ${c.bg} ${c.text} backdrop-blur-sm border-opacity-50`}>
      <span className={`w-2 h-2 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
};

const PriorityFlag = ({ priority }: { priority: Priority }) => {
  const c = PRIORITY_CONFIG[priority];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm ${c.bg} ${c.color}`}>
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
      p-2.5 rounded-2xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-all duration-200 hover:shadow-md hover:scale-105 backdrop-blur-sm
      ${variant === "destructive" ? "hover:text-rose-500 hover:bg-rose-50" : ""}
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
      group/card relative rounded-3xl border p-8 flex flex-col gap-6 h-fit shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-3 hover:border-blue-200/50 backdrop-blur-sm
      bg-white/80 border-gray-200/50 ${!job.isActive && "opacity-70 bg-gray-50/80 border-gray-100/50"}
    `}>
      {/* Gradient accent bar */}
      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-3xl" />
      
      {/* Top row */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-2xl font-black text-gray-900 leading-tight truncate group-hover/card:text-blue-600">
            {job.companyName}
          </h3>
          <p className="text-gray-700 text-lg mt-1 font-semibold truncate">{job.position}</p>
        </div>
        <StatusBadge status={job.status} />
      </div>

      {/* Meta grid */}
      <div className="grid grid-cols-2 gap-6 text-sm text-gray-600">
        <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-2xl backdrop-blur-sm">
          <MapPin className="w-5 h-5 text-blue-500 flex-shrink-0" />
          <span className="font-medium">{job.location}</span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-2xl backdrop-blur-sm">
          <Globe className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          <span className="font-medium">{TYPE_CONFIG[job.jobType].label}</span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-2xl backdrop-blur-sm">
          <Link2 className="w-5 h-5 text-purple-500 flex-shrink-0" />
          <span>via {job.via}</span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-2xl backdrop-blur-sm">
          <Calendar className="w-5 h-5 text-amber-500 flex-shrink-0" />
          <span className="font-medium">{job.date}</span>
        </div>
      </div>

      {/* Note */}
      {job.note && (
        <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 border border-blue-100/50 rounded-2xl p-6 backdrop-blur-sm shadow-inner">
          <p className="text-gray-700 italic leading-relaxed text-base">"{job.note}"</p>
        </div>
      )}

      {/* Action row */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-200/50">
        <PriorityFlag priority={job.priority} />
        <div className="flex items-center gap-2">
          <ActionButton icon={Edit3} onClick={() => window.location.href = `/update/${job._id}`} />
          <ActionButton icon={Trash2} onClick={handleDelete} variant="destructive" />
        </div>
        <a
          href={job.jobLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-base text-blue-600 hover:text-blue-700 font-semibold transition-all duration-200 group-hover/card:translate-x-2 bg-blue-50/50 hover:bg-blue-100 px-4 py-2.5 rounded-2xl backdrop-blur-sm hover:shadow-md"
        >
          View Listing 
          <ExternalLink className="w-4 h-4 group-hover/card:translate-y-0.5 transition-transform duration-200" />
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
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8 p-8 bg-gradient-to-r from-gray-50 to-blue-50/30 rounded-3xl border border-gray-200/50 shadow-xl backdrop-blur-sm">
      {(["applied", "interview", "rejected", "offer"] as JobStatus[]).map(s => {
        const c = STATUS_CONFIG[s];
        const count = counts[s] as number;
        return (
          <div 
            key={s} 
            className="group relative flex flex-col items-center gap-3 p-6 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg hover:-translate-y-1 bg-white/60 backdrop-blur-sm border border-gray-200/30"
          >
            <div className={`w-4 h-4 rounded-full ${c.dot} absolute -top-2 -right-2 shadow-lg ring-2 ring-white/50`} />
            <div className={`text-3xl md:text-4xl font-black ${c.text} group-hover:scale-110 transition-all duration-300`}>
              {count}
            </div>
            <span className="text-xs text-gray-600 uppercase tracking-wider font-semibold text-center">
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
  <div className="flex flex-wrap gap-4 mb-12 p-6 bg-white/70 rounded-3xl border border-gray-200/50 shadow-lg backdrop-blur-sm">
    <div className="flex items-center gap-3 text-sm text-gray-700 font-semibold mb-4">
      <Filter className="w-5 h-5 text-blue-500" />
      Filter by status
    </div>
    <div className="flex flex-wrap gap-3">
      {ALL_STATUSES.map(s => {
        const isActive = s === active;
        const label = s === "all" ? "All Jobs" : STATUS_CONFIG[s as JobStatus].label;
        return (
          <button
            key={s}
            onClick={() => onChange(s)}
            className={`px-6 py-3 rounded-2xl text-sm font-bold transition-all duration-300 shadow-md backdrop-blur-sm border-2
              ${isActive
                ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-xl hover:shadow-2xl hover:scale-105 border-blue-300"
                : "bg-gray-100/80 text-gray-700 hover:bg-gray-200 hover:text-gray-900 hover:shadow-lg hover:border-gray-300 border-gray-200/50"
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
  <div className="space-y-6">
    {[...Array(4)].map((_, i) => (
      <div key={i} className="animate-pulse bg-white/70 rounded-3xl p-8 shadow-xl border border-gray-200/50">
        <div className="h-8 bg-gray-200/50 rounded-2xl w-3/4 mb-6"></div>
        <div className="grid grid-cols-2 gap-6 mb-8">
          <div className="h-12 bg-gray-200/30 rounded-2xl"></div>
          <div className="h-12 bg-gray-200/30 rounded-2xl"></div>
        </div>
        <div className="h-20 bg-gradient-to-r from-blue-50/50 to-indigo-50/50 rounded-2xl mb-8"></div>
        <div className="h-12 bg-gray-100/50 rounded-2xl w-40 flex items-center justify-center">
          <div className="w-8 h-8 bg-gray-200/50 rounded-full animate-spin"></div>
        </div>
      </div>
    ))}
  </div>
);

const EmptyState = ({ filter }: { filter: string }) => (
  <div className="text-center py-24 px-12 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-3xl border-2 border-dashed border-gray-200 shadow-xl">
    <div className="w-28 h-28 bg-gradient-to-br from-gray-100 to-blue-100/50 rounded-3xl flex items-center justify-center mx-auto mb-8 backdrop-blur-sm shadow-lg border border-gray-200/50">
      <Briefcase className="w-14 h-14 text-gray-400" />
    </div>
    <h3 className="text-3xl font-black text-gray-900 mb-4">No jobs {filter !== 'all' ? `in "${filter}"` : 'yet'}</h3>
    <p className="text-gray-600 text-lg max-w-lg mx-auto mb-8 font-medium leading-relaxed">
      {filter !== 'all' 
        ? `No jobs match the "${filter}" filter. Try adjusting your filter above or add a new application.`
        : "Get started by adding your first job application using the + button in the top nav."
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 text-gray-900 p-8 relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-blue-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse"></div>
        <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-emerald-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute bottom-1/4 left-1/2 w-80 h-80 bg-indigo-200/30 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16 pt-16">
          <div className="inline-flex items-center gap-6 mb-8 px-12 py-8 bg-white/80 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-2xl">
            <div className="w-4 h-16 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 rounded-3xl shadow-xl" />
            <div>
              <h1 className="text-5xl md:text-6xl font-black bg-gradient-to-r from-gray-900 via-blue-600 to-indigo-700 bg-clip-text text-transparent tracking-tight">
                Job Tracker
              </h1>
              <p className="text-gray-600 text-xl mt-3 font-semibold">
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
        <div className="space-y-8">
          {loading ? (
            <LoadingSkeleton />
          ) : filteredJobs.length === 0 ? (
            <EmptyState filter={filter} />
          ) : (
            <div className="grid md:grid-cols-2 gap-8">
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
