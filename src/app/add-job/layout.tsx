import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Add Job | Job Tracker",
  description: "Add a new job application to your private tracker.",
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

export default function AddJobLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
