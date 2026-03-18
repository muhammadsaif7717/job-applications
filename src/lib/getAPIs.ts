import axios from "axios";


const getBaseURL = () => {
  if (typeof window !== "undefined") {
    // Browser: use relative URL is fine
    return "";
  }
  // Server-side: must be absolute
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
};


export const getAppliedJobs = async () => {
  try {
    const res = await axios.get("/api/v1/jobs/get");

    if (res.data.success) {
      // returns array of jobs
      return res.data.data;
    } else {
      console.error("Failed to fetch jobs:", res.data.message);
      return null;
    }
  } catch (err) {
    console.error("Error fetching jobs:", err);
    return null;
  }
};





export async function getJobById(id: string) {
  try {
    const res = await axios.get(`${getBaseURL()}/api/v1/jobs/get/${id}`);
    return res.data;
  } catch (err: any) {
    console.error("Error fetching job:", err.response?.data || err.message);
    return null;  // caller must handle null
  }
}


export async function updateJobById(id: string, data: Record<string, unknown>) {
  try {
    const res = await axios.patch(`/api/v1/jobs/update/${id}`, data);
    return res.data;
  } catch (err: any) {
    console.error("updateJobById error:", err.response?.data || err.message);
    return null;
  }
}
 
 
