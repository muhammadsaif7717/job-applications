import {
  DATE_SORT_OPTIONS,
  JOB_PRIORITIES,
  JOB_STATUSES,
  JOB_TYPES,
  type DateSortOrder,
  type Job,
  type JobFormData,
  type JobStatus,
} from "@/types/job";

export const STATUS_LABELS: Record<JobStatus, string> = {
  applied: "Applied",
  interview: "Interview",
  rejected: "Rejected",
  offer: "Offer",
};

export const TYPE_LABELS = {
  remote: "Remote",
  hybrid: "Hybrid",
  onsite: "On-site",
} as const;

export const PRIORITY_LABELS = {
  high: "High",
  medium: "Medium",
  low: "Low",
} as const;

export const FILTER_OPTIONS: Array<JobStatus | "all"> = ["all", ...JOB_STATUSES];

export const SORT_LABELS: Record<DateSortOrder, string> = {
  desc: "Newest first",
  asc: "Oldest first",
};

export const INITIAL_JOB_FORM: JobFormData = {
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

export function createInitialJobForm(): JobFormData {
  return {
    ...INITIAL_JOB_FORM,
    date: new Date().toISOString().split("T")[0],
  };
}

export function isJobStatus(value: unknown): value is JobStatus {
  return typeof value === "string" && JOB_STATUSES.includes(value as JobStatus);
}

export function isJobType(value: unknown): value is (typeof JOB_TYPES)[number] {
  return typeof value === "string" && JOB_TYPES.includes(value as (typeof JOB_TYPES)[number]);
}

export function isPriority(value: unknown): value is (typeof JOB_PRIORITIES)[number] {
  return typeof value === "string" && JOB_PRIORITIES.includes(value as (typeof JOB_PRIORITIES)[number]);
}

export function isDateSortOrder(value: unknown): value is DateSortOrder {
  return typeof value === "string" && DATE_SORT_OPTIONS.includes(value as DateSortOrder);
}

export function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeOptionalUrl(value: unknown) {
  const normalized = normalizeText(value);
  return normalized;
}

export function normalizeDate(value: unknown) {
  const normalized = normalizeText(value);
  if (!normalized) {
    return new Date().toISOString().split("T")[0];
  }

  const parsed = new Date(normalized);
  if (Number.isNaN(parsed.getTime())) {
    return new Date().toISOString().split("T")[0];
  }

  return parsed.toISOString().split("T")[0];
}

export function formatJobDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value || "Not set";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(parsed);
}

function toSortableTimestamp(value: string | undefined) {
  if (!value) {
    return Number.NaN;
  }

  const normalized = value.trim();
  if (!normalized) {
    return Number.NaN;
  }

  const isoDayMatch = normalized.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoDayMatch) {
    const [, year, month, day] = isoDayMatch;
    return Date.UTC(Number(year), Number(month) - 1, Number(day));
  }

  const parsed = new Date(normalized).getTime();
  if (!Number.isNaN(parsed)) {
    return parsed;
  }

  const slashMatch = normalized.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (slashMatch) {
    const [, first, second, year] = slashMatch;
    const firstNum = Number(first);
    const secondNum = Number(second);

    // Prefer month/day/year, but fall back to day/month/year when month would be invalid.
    const month = firstNum <= 12 ? firstNum : secondNum;
    const day = firstNum <= 12 ? secondNum : firstNum;

    return Date.UTC(Number(year), month - 1, day);
  }

  return Number.NaN;
}

export function sortJobsByDate(jobs: Job[], direction: DateSortOrder) {
  const multiplier = direction === "asc" ? 1 : -1;

  return [...jobs].sort((left, right) => {
    const leftTime = toSortableTimestamp(left.date) || toSortableTimestamp(left.createdAt);
    const rightTime = toSortableTimestamp(right.date) || toSortableTimestamp(right.createdAt);

    if (Number.isNaN(leftTime) && Number.isNaN(rightTime)) {
      return left.companyName.localeCompare(right.companyName);
    }

    if (Number.isNaN(leftTime)) {
      return 1;
    }

    if (Number.isNaN(rightTime)) {
      return -1;
    }

    const timeDifference = (leftTime - rightTime) * multiplier;
    if (timeDifference !== 0) {
      return timeDifference;
    }

    const createdAtDifference =
      (toSortableTimestamp(left.createdAt) - toSortableTimestamp(right.createdAt)) * multiplier;

    if (!Number.isNaN(createdAtDifference) && createdAtDifference !== 0) {
      return createdAtDifference;
    }

    return left.companyName.localeCompare(right.companyName);
  });
}

export function toJobFormData(job: Job): JobFormData {
  return {
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
  };
}

export function isJobFormDirty(original: Job, current: JobFormData) {
  return (Object.keys(current) as (keyof JobFormData)[]).some(
    (key) => String(current[key]) !== String(original[key as keyof Job]),
  );
}

export function sanitizeJobPayload(payload: unknown): JobFormData | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const data = payload as Record<string, unknown>;
  const companyName = normalizeText(data.companyName);
  const position = normalizeText(data.position);
  const location = normalizeText(data.location);

  if (!companyName || !position || !location) {
    return null;
  }

  return {
    companyName,
    position,
    jobLink: normalizeOptionalUrl(data.jobLink),
    location,
    jobType: isJobType(data.jobType) ? data.jobType : "remote",
    status: isJobStatus(data.status) ? data.status : "applied",
    via: normalizeText(data.via),
    note: normalizeText(data.note),
    priority: isPriority(data.priority) ? data.priority : "medium",
    date: normalizeDate(data.date),
    isActive: typeof data.isActive === "boolean" ? data.isActive : true,
  };
}
