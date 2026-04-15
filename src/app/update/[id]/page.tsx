'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react'
import { useParams, usePathname, useRouter } from 'next/navigation'
import { ArrowLeft, CheckCircle2, Loader2, PencilLine, RefreshCcw, ShieldCheck } from 'lucide-react'
import { getJobById, updateJobById } from '@/lib/getAPIs'
import { isJobFormDirty, toJobFormData } from '@/lib/job'
import { JOB_PRIORITIES, JOB_STATUSES, JOB_TYPES, type Job, type JobFormData, type JobStatus, type JobType, type Priority } from '@/types/job'

const inputClassName =
  'w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-blue-300 focus:ring-4 focus:ring-blue-100 dark:border-white/10 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-400 dark:focus:ring-blue-500/20'

function Label({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
      {children}
    </label>
  )
}

function Input({
  id,
  name,
  type = 'text',
  placeholder,
  value,
  onChange,
  required,
}: {
  id: string
  name: string
  type?: string
  placeholder?: string
  value: string
  onChange: (event: ChangeEvent<HTMLInputElement>) => void
  required?: boolean
}) {
  return (
    <input
      id={id}
      name={name}
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      required={required}
      className={inputClassName}
    />
  )
}

function Textarea({
  id,
  name,
  placeholder,
  value,
  onChange,
  rows = 4,
}: {
  id: string
  name: string
  placeholder?: string
  value: string
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void
  rows?: number
}) {
  return (
    <textarea
      id={id}
      name={name}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
      className={`${inputClassName} resize-none`}
    />
  )
}

function PillGroup<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (value: T) => void
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const active = value === option.value

        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
              active
                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/15 dark:bg-white dark:text-slate-900'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
            }`}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

function Toast({
  kind,
  onClose,
}: {
  kind: 'success' | 'reset'
  onClose: () => void
}) {
  const copy =
    kind === 'success'
      ? { title: 'Changes saved', text: 'Your application details have been updated.' }
      : { title: 'Form reset', text: 'Unsaved edits were cleared.' }

  return (
    <div className="fixed left-1/2 top-4 z-50 w-[min(30rem,calc(100vw-2rem))] -translate-x-1/2 rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-2xl dark:border-white/10 dark:bg-slate-950">
      <div className="flex items-start gap-3">
        <CheckCircle2 className={`mt-0.5 h-5 w-5 ${kind === 'success' ? 'text-emerald-500' : 'text-blue-500'}`} />
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{copy.title}</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{copy.text}</p>
        </div>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
          ×
        </button>
      </div>
    </div>
  )
}

function Skeleton() {
  return (
    <div className="glass-panel animate-pulse p-6 sm:p-8">
      <div className="h-8 w-40 rounded-2xl bg-slate-200 dark:bg-slate-800" />
      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="h-12 rounded-2xl bg-slate-100 dark:bg-slate-900" />
        <div className="h-12 rounded-2xl bg-slate-100 dark:bg-slate-900" />
      </div>
      <div className="mt-5 h-12 rounded-2xl bg-slate-100 dark:bg-slate-900" />
      <div className="mt-5 h-28 rounded-[1.6rem] bg-slate-100 dark:bg-slate-900" />
    </div>
  )
}

function ErrorState({ id, onRetry }: { id: string; onRetry: () => void }) {
  return (
    <div className="glass-panel px-6 py-14 text-center sm:px-10">
      <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50">Couldn&apos;t load this application</h2>
      <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
        We couldn&apos;t find the record for <span className="font-mono text-slate-800 dark:text-slate-200">{id}</span>. Try again in a moment.
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 dark:bg-white dark:text-slate-900"
      >
        <RefreshCcw className="h-4 w-4" />
        Retry
      </button>
    </div>
  )
}

export default function UpdateJobPage() {
  const { status } = useSession()
  const params = useParams()
  const router = useRouter()
  const pathname = usePathname()
  const id = typeof params?.id === 'string' ? params.id : ''

  const [job, setJob] = useState<Job | null>(null)
  const [form, setForm] = useState<JobFormData | null>(null)
  const [fetchState, setFetchState] = useState<'loading' | 'error' | 'ready'>('loading')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<'success' | 'reset' | null>(null)

  const fetchJob = useCallback(async () => {
    if (!id) {
      setFetchState('error')
      return
    }

    setFetchState('loading')
    setError(null)

    try {
      const data = await getJobById(id)

      if (!data) {
        setFetchState('error')
        return
      }

      setJob(data)
      setForm(toJobFormData(data))
      setFetchState('ready')
    } catch (fetchError) {
      console.error('Unexpected error in fetchJob:', fetchError)
      setFetchState('error')
    }
  }, [id])

  useEffect(() => {
    if (status === 'loading') {
      setFetchState('loading')
      return
    }

    if (status === 'unauthenticated') {
      router.replace(`/auth/sign-in?callbackUrl=${encodeURIComponent(pathname || `/update/${id}`)}`)
      return
    }

    void fetchJob()
  }, [fetchJob, id, pathname, router, status])

  const set =
    (field: keyof JobFormData) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((current) => (current ? { ...current, [field]: event.target.value } : current))
    }

  const setPill = <K extends keyof JobFormData>(field: K, value: JobFormData[K]) => {
    setForm((current) => (current ? { ...current, [field]: value } : current))
  }

  const dirty = useMemo(() => {
    if (!job || !form) return false
    return isJobFormDirty(job, form)
  }, [form, job])

  const handleReset = () => {
    if (!job) return
    setForm(toJobFormData(job))
    setToast('reset')
    setError(null)
  }

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!job || !form || !dirty) return

    setLoading(true)
    setError(null)

    try {
      const updated = await updateJobById(job._id, form)

      if (!updated) {
        throw new Error('Failed to update job')
      }

      setJob(updated)
      setForm(toJobFormData(updated))
      setToast('success')

      window.setTimeout(() => {
        router.push('/')
      }, 1200)
    } catch (submitError) {
      console.error('Update failed:', submitError)
      setError('We couldn’t save your changes. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="app-shell">
        <div className="page-wrap grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          <section className="glass-panel rise-in p-5 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition hover:text-slate-900 dark:text-slate-300 dark:hover:text-white"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to dashboard
              </Link>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
              >
                Cancel
              </button>
            </div>

            <div className="mt-8">
              <div className="hero-chip">
                <PencilLine className="h-4 w-4" />
                Editing mode
              </div>
              <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl dark:text-slate-50">
                Update this application without losing context.
              </h1>
              <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base dark:text-slate-300">
                Refine notes, move roles through the pipeline, and keep only the applications that still deserve your attention.
              </p>
            </div>

            <div className="mt-8 space-y-3">
              {[
                { icon: ShieldCheck, label: 'Protected records', value: 'Only your own applications can be edited.' },
                { icon: RefreshCcw, label: 'Fast reset', value: 'Clear unsaved edits and return to the last saved version.' },
              ].map((item) => (
                <div key={item.label} className="rounded-2xl border border-slate-200/70 bg-white/75 p-4 dark:border-white/10 dark:bg-slate-900/70">
                  <div className="flex items-start gap-3">
                    <item.icon className="mt-0.5 h-5 w-5 text-blue-600" />
                    <div>
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{item.label}</p>
                      <p className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300">{item.value}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {status !== 'authenticated' ? (
            <section className="glass-panel p-6 sm:p-8">
              <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50">Sign in required</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base dark:text-slate-300">
                This page is protected. Sign in to edit one of your saved applications.
              </p>
            </section>
          ) : fetchState === 'loading' || !form ? (
            <Skeleton />
          ) : fetchState === 'error' ? (
            <ErrorState id={id || 'unknown'} onRetry={() => void fetchJob()} />
          ) : (
            <form onSubmit={handleSubmit} className="glass-panel rise-in p-5 sm:p-8">
              <div className="mb-6 rounded-[1.6rem] border border-blue-200 bg-blue-50/70 px-4 py-4 dark:border-blue-400/20 dark:bg-blue-500/10">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700 dark:text-blue-200">Editing</p>
                <p className="mt-2 text-sm font-semibold text-slate-900 dark:text-slate-50">
                  {job?.companyName} • {job?.position}
                </p>
              </div>

              {error && (
                <div className="mb-6 rounded-[1.6rem] border border-rose-200 bg-rose-50/80 px-4 py-4 text-sm text-rose-700 dark:border-rose-400/20 dark:bg-rose-500/10 dark:text-rose-200">
                  {error}
                </div>
              )}

              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="companyName">Company name</Label>
                  <Input id="companyName" name="companyName" placeholder="Stripe" value={form.companyName} onChange={set('companyName')} required />
                </div>
                <div>
                  <Label htmlFor="position">Position</Label>
                  <Input id="position" name="position" placeholder="Product Designer" value={form.position} onChange={set('position')} required />
                </div>
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="jobLink">Job link</Label>
                  <Input id="jobLink" name="jobLink" type="url" placeholder="https://..." value={form.jobLink} onChange={set('jobLink')} />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" name="location" placeholder="Remote / New York" value={form.location} onChange={set('location')} required />
                </div>
              </div>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <Label htmlFor="date">Application date</Label>
                  <Input id="date" name="date" type="date" value={form.date} onChange={set('date')} />
                </div>
                <div>
                  <Label htmlFor="via">Applied via</Label>
                  <Input id="via" name="via" placeholder="LinkedIn, referral, website" value={form.via} onChange={set('via')} />
                </div>
              </div>

              <div className="mt-6 border-t border-slate-200/80 pt-6 dark:border-white/10">
                <Label htmlFor="jobType">Job type</Label>
                <PillGroup<JobType>
                  value={form.jobType}
                  onChange={(value) => setPill('jobType', value)}
                  options={JOB_TYPES.map((value) => ({
                    value,
                    label: value === 'onsite' ? 'On-site' : value.charAt(0).toUpperCase() + value.slice(1),
                  }))}
                />
              </div>

              <div className="mt-6">
                <Label htmlFor="status">Status</Label>
                <PillGroup<JobStatus>
                  value={form.status}
                  onChange={(value) => setPill('status', value)}
                  options={JOB_STATUSES.map((value) => ({ value, label: value.charAt(0).toUpperCase() + value.slice(1) }))}
                />
              </div>

              <div className="mt-6">
                <Label htmlFor="priority">Priority</Label>
                <PillGroup<Priority>
                  value={form.priority}
                  onChange={(value) => setPill('priority', value)}
                  options={JOB_PRIORITIES.map((value) => ({ value, label: value.charAt(0).toUpperCase() + value.slice(1) }))}
                />
              </div>

              <div className="mt-6">
                <Label htmlFor="note">Notes</Label>
                <Textarea
                  id="note"
                  name="note"
                  placeholder="Interview tips, recruiter names, salary range, or anything worth remembering."
                  value={form.note}
                  onChange={set('note')}
                />
              </div>

              <div className="mt-6 flex flex-col gap-4 rounded-[1.6rem] border border-slate-200 bg-slate-50/80 px-4 py-4 sm:flex-row sm:items-center sm:justify-between dark:border-white/10 dark:bg-slate-900/70">
                <div>
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">Keep this role active</p>
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">Active jobs stay visible in your main workflow.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setForm((current) => (current ? { ...current, isActive: !current.isActive } : current))}
                  className={`relative h-7 w-14 rounded-full transition ${form.isActive ? 'bg-slate-900 dark:bg-white' : 'bg-slate-300 dark:bg-slate-700'}`}
                  aria-pressed={form.isActive}
                >
                  <span
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow-sm transition dark:bg-slate-900 ${
                      form.isActive ? 'left-8 dark:bg-slate-900' : 'left-1'
                    }`}
                  />
                </button>
              </div>

              <div className="mt-8 flex flex-col gap-3 lg:flex-row">
                <button
                  type="submit"
                  disabled={!dirty || loading}
                  className={`inline-flex flex-1 items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                    !dirty || loading
                      ? 'cursor-not-allowed bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      : 'bg-slate-900 text-white shadow-xl shadow-slate-900/15 hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100'
                  }`}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save changes'
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={!dirty || loading}
                  className={`inline-flex items-center justify-center rounded-2xl border px-5 py-3 text-sm font-semibold transition ${
                    !dirty || loading
                      ? 'cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400 dark:border-white/10 dark:bg-slate-900 dark:text-slate-500'
                      : 'border-slate-200 bg-white text-slate-700 shadow-sm hover:-translate-y-0.5 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900'
                  }`}
                >
                  Reset changes
                </button>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 dark:border-white/10 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-900"
                >
                  Back to dashboard
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>

      {toast && <Toast kind={toast} onClose={() => setToast(null)} />}
    </>
  )
}
