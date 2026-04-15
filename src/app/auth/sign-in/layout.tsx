import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In | Job Tracker",
  description: "Sign in to access your private job application dashboard.",
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

export default function SignInLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
