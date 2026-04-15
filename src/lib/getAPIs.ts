import axios from "axios";
import type { Job, JobFormData } from "@/types/job";

type ApiResponse<T> = {
  success: boolean;
  data: T;
  message?: string;
};

function logApiError(scope: string, err: unknown) {
  if (axios.isAxiosError(err)) {
    console.error(`${scope}:`, err.response?.data || err.message);
    return;
  }

  console.error(`${scope}:`, err);
}

export async function getAppliedJobs() {
  try {
    const res = await axios.get<ApiResponse<Job[]>>("/api/v1/jobs/get");
    return res.data.success ? res.data.data : null;
  } catch (err) {
    logApiError("Error fetching jobs", err);
    return null;
  }
}

export async function getJobById(id: string) {
  try {
    const res = await axios.get<ApiResponse<Job>>(`/api/v1/jobs/get/${id}`);
    return res.data.success ? res.data.data : null;
  } catch (err) {
    logApiError("Error fetching job", err);
    return null;
  }
}

export async function createJob(data: JobFormData) {
  try {
    const res = await axios.post<ApiResponse<Job>>("/api/v1/jobs/post", data);
    return res.data.success ? res.data.data : null;
  } catch (err) {
    logApiError("createJob error", err);
    return null;
  }
}

export async function updateJobById(id: string, data: JobFormData) {
  try {
    const res = await axios.patch<ApiResponse<Job>>(`/api/v1/jobs/update/${id}`, data);
    return res.data.success ? res.data.data : null;
  } catch (err) {
    logApiError("updateJobById error", err);
    return null;
  }
}

export async function deleteJobById(id: string) {
  try {
    const res = await axios.delete<ApiResponse<null>>(`/api/v1/jobs/delete/${id}`);
    return res.data;
  } catch (err) {
    logApiError("deleteJobById error", err);
    return null;
  }
}
