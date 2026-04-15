import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Update Job | Job Tracker",
  description: "Update an existing job application in your private tracker.",
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
    },
  },
};

export default function UpdateJobLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
