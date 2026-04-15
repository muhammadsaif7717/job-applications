'use client'

import { signIn, useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Briefcase, CheckCircle2, Loader2, ShieldCheck, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SignInPage() {
  const router = useRouter()
  const { status } = useSession()
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'
  const postLogin = searchParams.get('postLogin') === '1'
  const success = status === 'authenticated' && postLogin

  useEffect(() => {
    if (success) {
      const timeout = window.setTimeout(() => {
        router.push(callbackUrl)
      }, 1200)

      return () => window.clearTimeout(timeout)
    }
  }, [callbackUrl, router, success])

  const handleGoogleSignin = async () => {
    setLoading(true)
    const redirectUrl = `/auth/sign-in?callbackUrl=${encodeURIComponent(callbackUrl)}&postLogin=1`
    await signIn('google', { callbackUrl: redirectUrl })
  }

  return (
    <div className="app-shell flex items-center justify-center">
      <div className="page-wrap grid w-full max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="glass-panel rise-in hidden min-h-[620px] flex-col justify-between overflow-hidden p-8 lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(38,93,255,0.18),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.95),rgba(244,248,255,0.82))] dark:bg-[radial-gradient(circle_at_top_right,rgba(61,115,255,0.22),transparent_28%),linear-gradient(135deg,rgba(15,23,42,0.94),rgba(20,30,48,0.82))]" />
          <div className="relative z-10">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-slate-500 shadow-sm dark:bg-slate-900/80 dark:text-slate-300">
              <Sparkles className="h-4 w-4 text-blue-500" />
              Built for focused job hunts
            </div>
            <h1 className="max-w-xl text-5xl font-black leading-[1.05] tracking-tight text-slate-900 dark:text-slate-50">
              Keep applications, interviews, and momentum in one clean place.
            </h1>
            <p className="mt-5 max-w-lg text-base leading-7 text-slate-600 dark:text-slate-300">
              Sign in to track every role, spot bottlenecks faster, and keep your search feeling calm instead of chaotic.
            </p>
          </div>

          <div className="relative z-10 grid gap-4">
            {[
              'Fast overview of applications by stage',
              'Cleaner editing flow for notes and priorities',
              'One place to review next interviews and follow-ups',
            ].map((item) => (
              <div key={item} className="flex items-start gap-3 rounded-2xl border border-white/80 bg-white/75 px-4 py-4 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
                <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-500" />
                <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-panel rise-in relative overflow-hidden p-5 sm:p-8 lg:p-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(67,131,255,0.15),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.92),rgba(250,248,242,0.96))] dark:bg-[radial-gradient(circle_at_top,rgba(67,131,255,0.2),transparent_24%),linear-gradient(180deg,rgba(15,23,42,0.9),rgba(17,24,39,0.96))]" />
          <div className="relative z-10">
            <div className="mb-8 flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-[1.75rem] bg-[linear-gradient(135deg,#265dff,#2aa6ff_55%,#43c49d)] shadow-xl shadow-blue-500/20">
                <Briefcase className="h-8 w-8 text-white" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">Welcome back</p>
                <h1 className="mt-1 text-3xl font-black tracking-tight text-slate-900 dark:text-slate-50">Sign in to continue</h1>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/80 bg-white/85 p-5 shadow-sm dark:border-white/10 dark:bg-slate-900/70">
              <p className="text-sm font-medium leading-6 text-slate-600 dark:text-slate-300">
                Use your Google account to open your dashboard and keep your job search synced.
              </p>

              {success && (
                <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-400/20 dark:bg-emerald-500/10">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="mt-0.5 h-5 w-5 text-emerald-500" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Signed in successfully</p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Redirecting you now...</p>
                    </div>
                  </div>
                </div>
              )}

              <Button
                onClick={handleGoogleSignin}
                disabled={loading || success || status === 'authenticated'}
                className="mt-6 h-14 w-full rounded-2xl bg-slate-900 text-base font-semibold text-white shadow-xl shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Signing in...
                  </>
                ) : success ? (
                  <>Redirecting...</>
                ) : status === 'authenticated' ? (
                  <>Signed in</>
                ) : (
                  <>Continue with Google</>
                )}
              </Button>

              <p className="mt-4 text-xs leading-5 text-slate-500 dark:text-slate-400">
                By continuing, you’ll return to the page you were viewing before sign-in.
              </p>
            </div>

            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to dashboard
            </Link>
          </div>
        </section>
      </div>
    </div>
  )
}
