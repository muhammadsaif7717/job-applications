export const JOB_STATUSES = ["applied", "interview", "rejected", "offer"] as const;
export const JOB_TYPES = ["remote", "hybrid", "onsite"] as const;
export const JOB_PRIORITIES = ["high", "medium", "low"] as const;
export const DATE_SORT_OPTIONS = ["desc", "asc"] as const;

export type JobStatus = (typeof JOB_STATUSES)[number];
export type JobType = (typeof JOB_TYPES)[number];
export type Priority = (typeof JOB_PRIORITIES)[number];
export type DateSortOrder = (typeof DATE_SORT_OPTIONS)[number];

export interface Job {
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

export type JobFormData = Omit<Job, "_id" | "createdAt" | "updatedAt">;

