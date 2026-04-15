const rawSiteUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.VERCEL_PROJECT_PRODUCTION_URL ||
  process.env.VERCEL_URL ||
  "http://localhost:3000";

function normalizeSiteUrl(url: string) {
  if (url.startsWith("http://") || url.startsWith("https://")) {
    return url;
  }

  return `https://${url}`;
}

export const siteConfig = {
  name: "Job Tracker",
  title: "Job Tracker | Organize Your Job Search",
  description:
    "Track job applications, interviews, offers, and follow-ups in one clean dashboard built to keep your job search organized.",
  keywords: [
    "job tracker",
    "job application tracker",
    "application dashboard",
    "interview tracker",
    "job search organizer",
    "career dashboard",
    "track job applications",
  ],
  url: normalizeSiteUrl(rawSiteUrl),
  ogImage: "/opengraph-image",
  creator: "Job Tracker",
};
