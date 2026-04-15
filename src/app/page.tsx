'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  ArrowUpDown,
  Briefcase,
  ExternalLink,
  Filter,
  Globe,
  Link2,
  MapPin,
  Pencil,
  Plus,
  Search,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteJobById, getAppliedJobs } from '@/lib/getAPIs'
import {
  FILTER_OPTIONS,
  PRIORITY_LABELS,
  SORT_LABELS,
  STATUS_LABELS,
  TYPE_LABELS,
  formatJobDate,
  sortJobsByDate,
} from '@/lib/job'
import type { DateSortOrder, Job, JobStatus, Priority } from '@/types/job'

const STATUS_STYLES: Record<JobStatus, { badge: string; accent: string }> = {
  applied: {
    badge: 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-500/10 dark:text-blue-200 dark:border-blue-400/20',
    accent: 'bg-blue-500',
  },
  interview: {
    badge: 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-400/20',
    accent: 'bg-amber-500',
  },
  rejected: {
    badge: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-200 dark:border-rose-400/20',
    accent: 'bg-rose-500',
  },
  offer: {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-400/20',
    accent: 'bg-emerald-500',
  },
}

const PRIORITY_STYLES: Record<Priority, string> = {
  high: 'bg-rose-50 text-rose-700 border-rose-100 dark:bg-rose-500/10 dark:text-rose-200 dark:border-rose-400/20',
  medium:
    'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-400/20',
  low: 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-white/10',
}

function StatusBadge({ status }: { status: JobStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${STATUS_STYLES[status].badge}`}
    >
      <span className={`h-2 w-2 rounded-full ${STATUS_STYLES[status].accent}`} />
      {STATUS_LABELS[status]}
    </span>
  )
}

function PriorityBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold ${PRIORITY_STYLES[priority]}`}
    >
      {PRIORITY_LABELS[priority]} priority
    </span>
  )
}

function StatCard({
  label,
  value,
  helper,
}: {
  label: string
  value: number
  helper: string
}) {
  return (
    <div className="soft-panel rise-in hover-lift p-5">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-3 text-4xl font-black tracking-tight text-slate-900 dark:text-slate-50">{value}</p>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{helper}</p>
    </div>
  )
}

function JobCard({ job, onDeleteRequest }: { job: Job; onDeleteRequest: (job: Job) => void }) {
  return (
    <article className="glass-panel rise-in hover-lift overflow-hidden p-5 sm:p-7">
      <div className="flex flex-col gap-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <StatusBadge status={job.status} />
              {!job.isActive && (
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-500 dark:border-white/10 dark:bg-slate-800 dark:text-slate-300">
                  Archived
                </span>
              )}
            </div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50">
              {job.companyName}
            </h2>
            <p className="mt-1 text-base font-semibold text-slate-600 dark:text-slate-300">{job.position}</p>
          </div>

          <PriorityBadge priority={job.priority} />
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl bg-slate-50/90 px-4 py-3 dark:bg-slate-900/80">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              <MapPin className="h-4 w-4" />
              Location
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">{job.location || 'Not set'}</p>
          </div>
          <div className="rounded-2xl bg-slate-50/90 px-4 py-3 dark:bg-slate-900/80">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              <Globe className="h-4 w-4" />
              Work style
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">{TYPE_LABELS[job.jobType]}</p>
          </div>
          <div className="rounded-2xl bg-slate-50/90 px-4 py-3 dark:bg-slate-900/80">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              <ArrowUpDown className="h-4 w-4" />
              Applied
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">{formatJobDate(job.date)}</p>
          </div>
          <div className="rounded-2xl bg-slate-50/90 px-4 py-3 dark:bg-slate-900/80">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
              <Link2 className="h-4 w-4" />
              Source
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-800 dark:text-slate-100">{job.via || 'Not specified'}</p>
          </div>
        </div>

        {job.note && (
          <div className="rounded-[1.6rem] border border-blue-100 bg-blue-50/60 px-5 py-4 dark:border-blue-400/20 dark:bg-blue-500/10">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-200">Notes</p>
            <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-200">{job.note}</p>
          </div>
        )}

        <div className="flex flex-col gap-3 border-t border-slate-200/70 pt-5 dark:border-white/10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              href={`/update/${job._id}`}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
            <button
              type="button"
              onClick={() => onDeleteRequest(job)}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-rose-100 bg-rose-50 px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:-translate-y-0.5 hover:bg-rose-100 dark:border-rose-400/20 dark:bg-rose-950/30 dark:text-rose-300"
            >
              <Trash2 className="h-4 w-4" />
              Delete
            </button>
          </div>

          {job.jobLink ? (
            <a
              href={job.jobLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-blue-700 transition hover:text-blue-900 dark:text-blue-300 dark:hover:text-blue-200"
            >
              Open listing
              <ExternalLink className="h-4 w-4" />
            </a>
          ) : (
            <span className="text-sm text-slate-400 dark:text-slate-500">No listing link saved</span>
          )}
        </div>
      </div>
    </article>
  )
}

function DeleteConfirmDialog({
  job,
  open,
  pending,
  onCancel,
  onConfirm,
}: {
  job: Job | null
  open: boolean
  pending: boolean
  onCancel: () => void
  onConfirm: () => void
}) {
  if (!open || !job) {
    return null
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center px-4">
      <button
        type="button"
        aria-label="Close confirmation dialog"
        className="absolute inset-0 bg-slate-950/50 backdrop-blur-sm"
        onClick={pending ? undefined : onCancel}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        className="glass-panel relative z-10 w-full max-w-md p-6 sm:p-7"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-300">
          <Trash2 className="h-5 w-5" />
        </div>
        <h2 id="delete-dialog-title" className="mt-5 text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50">
          Delete application?
        </h2>
        <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
          This will remove <span className="font-semibold text-slate-900 dark:text-slate-100">{job.companyName}</span> from your tracker.
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
          You can’t undo this action after confirming.
        </p>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-11 rounded-2xl px-4"
            onClick={onCancel}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="h-11 rounded-2xl px-4"
            onClick={onConfirm}
            disabled={pending}
          >
            {pending ? 'Deleting...' : 'Confirm delete'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function Toast({
  message,
  onClose,
}: {
  message: string
  onClose: () => void
}) {
  return (
    <div className="fixed left-1/2 top-4 z-50 w-[min(30rem,calc(100vw-2rem))] -translate-x-1/2 rounded-3xl border border-emerald-200 bg-white px-5 py-4 shadow-2xl dark:border-emerald-400/20 dark:bg-slate-950">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-100 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-200">
          ✓
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 dark:text-slate-50">Application deleted</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">{message}</p>
        </div>
        <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
          ×
        </button>
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  return (
    <div className="grid gap-5">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="glass-panel animate-pulse p-6">
          <div className="h-6 w-24 rounded-full bg-slate-200 dark:bg-slate-800" />
          <div className="mt-5 h-8 w-2/5 rounded-2xl bg-slate-200 dark:bg-slate-800" />
          <div className="mt-3 h-5 w-1/3 rounded-xl bg-slate-100 dark:bg-slate-900" />
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {[...Array(4)].map((__, tile) => (
              <div key={tile} className="h-20 rounded-2xl bg-slate-100 dark:bg-slate-900" />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ filter }: { filter: JobStatus | 'all' }) {
  const title =
    filter === 'all' ? 'No applications yet' : `No ${STATUS_LABELS[filter].toLowerCase()} applications`

  return (
    <div className="glass-panel px-6 py-14 text-center sm:px-10">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[2rem] bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
        <Briefcase className="h-10 w-10" />
      </div>
      <h2 className="mt-6 text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50">{title}</h2>
      <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base dark:text-slate-300">
        {filter === 'all'
          ? 'Add your first application to start tracking progress, priorities, and interview momentum in one place.'
          : 'Try another status filter or add a new application to keep your pipeline moving.'}
      </p>
      <Link
        href="/add-job"
        className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
      >
        <Plus className="h-4 w-4" />
        Add application
      </Link>
    </div>
  )
}

export default function DashboardPage() {
  const { status } = useSession()
  const [jobs, setJobs] = useState<Job[]>([])
  const [filter, setFilter] = useState<JobStatus | 'all'>('applied')
  const [sortOrder, setSortOrder] = useState<DateSortOrder>('desc')
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [jobToDelete, setJobToDelete] = useState<Job | null>(null)
  const [deletePending, setDeletePending] = useState(false)
  const [toast, setToast] = useState<string | null>(null)

  useEffect(() => {
    if (status === 'loading') {
      setLoading(true)
      return
    }

    if (status !== 'authenticated') {
      setJobs([])
      setLoading(false)
      return
    }

    const fetchJobs = async () => {
      setLoading(true)
      try {
        const data = await getAppliedJobs()
        setJobs(data ?? [])
      } catch (error) {
        console.error('Failed to fetch jobs:', error)
        setJobs([])
      } finally {
        setLoading(false)
      }
    }

    void fetchJobs()
  }, [status])

  const handleDelete = useCallback((id: string) => {
    setJobs((current) => current.filter((job) => job._id !== id))
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    if (!jobToDelete) return

    setDeletePending(true)
    try {
      const response = await deleteJobById(jobToDelete._id)
      if (!response?.success) {
        throw new Error(response?.message || 'Delete failed')
      }

      const deletedCompanyName = jobToDelete.companyName
      handleDelete(jobToDelete._id)
      setJobToDelete(null)
      setToast(`${deletedCompanyName} was removed from your tracker.`)
    } catch (error) {
      console.error('Delete error:', error)
      window.alert('Failed to delete the application. Please try again.')
    } finally {
      setDeletePending(false)
    }
  }, [handleDelete, jobToDelete])

  const filteredJobs = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    const filtered = jobs.filter((job) => {
      const matchesFilter = filter === 'all' ? true : job.status === filter
      const matchesSearch = normalizedQuery
        ? job.companyName.toLowerCase().includes(normalizedQuery)
        : true

      return matchesFilter && matchesSearch
    })

    return sortJobsByDate(filtered, sortOrder)
  }, [filter, jobs, searchQuery, sortOrder])

  const stats = useMemo(
    () => ({
      total: jobs.length,
      active: jobs.filter((job) => job.isActive).length,
      interview: jobs.filter((job) => job.status === 'interview').length,
      offer: jobs.filter((job) => job.status === 'offer').length,
    }),
    [jobs],
  )

  return (
    <div className="app-shell">
      <div className="page-wrap space-y-8">
        <section className="grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="glass-panel rise-in overflow-hidden p-6 sm:p-8 lg:p-9">
            <div className="hero-chip">
              <Sparkles className="h-4 w-4" />
              Application command center
            </div>
            <h1 className="mt-5 max-w-3xl text-3xl font-black tracking-tight text-slate-900 sm:text-5xl dark:text-slate-50">
              Keep your search clear, responsive, and ready for the next move.
            </h1>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base dark:text-slate-300">
              Track every application, sort roles by date, and switch between light and dark themes without losing your place.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/add-job"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-xl shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                <Plus className="h-4 w-4" />
                Add application
              </Link>
              <div className="inline-flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/40 px-5 py-3 text-sm font-medium text-slate-500 dark:border-white/10 dark:bg-slate-900/40 dark:text-slate-400">
                Private, personal, and synced to your sign-in
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
            <StatCard label="Total tracked" value={stats.total} helper="Applications currently in your system" />
            <StatCard label="Still active" value={stats.active} helper="Roles still worth following up on" />
            <StatCard label="Interview stage" value={stats.interview} helper="Conversations in progress" />
            <StatCard label="Offers" value={stats.offer} helper="Wins ready to compare" />
          </div>
        </section>

        {status === 'authenticated' ? (
          <>
            <section className="glass-panel rise-in p-5 sm:p-6">
              <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                    <Filter className="h-4 w-4 text-blue-600" />
                    Filter and sort
                  </div>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                    Focus by pipeline stage, then reorder the list by application date.
                  </p>
                </div>

                <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                  <div className="grid gap-3">
                    <label className="control-surface flex items-center gap-3">
                      <Search className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                      <input
                        type="search"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="Search by company name"
                        className="w-full bg-transparent text-sm font-medium outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
                        aria-label="Search applications by company name"
                      />
                    </label>

                    <div className="flex flex-wrap gap-2">
                      {FILTER_OPTIONS.map((item) => {
                        const active = filter === item
                        const label = item === 'all' ? 'All' : STATUS_LABELS[item]

                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => setFilter(item)}
                            className={`rounded-2xl px-4 py-2.5 text-sm font-semibold transition ${
                              active
                                ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/15 dark:bg-white dark:text-slate-900'
                                : 'bg-slate-100/90 text-slate-600 hover:bg-slate-200 hover:text-slate-900 dark:bg-slate-900/80 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                            }`}
                          >
                            {label}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <label className="control-surface flex min-w-[13rem] items-center gap-3">
                    <ArrowUpDown className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <span className="text-sm font-semibold">Sort</span>
                    <select
                      value={sortOrder}
                      onChange={(event) => setSortOrder(event.target.value as DateSortOrder)}
                      className="ml-auto bg-transparent text-sm font-medium outline-none"
                    >
                      {Object.entries(SORT_LABELS).map(([value, label]) => (
                        <option key={value} value={value} className="text-slate-900">
                          {label}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
            </section>

            <section className="space-y-5">
              {loading ? (
                <LoadingSkeleton />
              ) : filteredJobs.length === 0 ? (
                <EmptyState filter={filter} />
              ) : (
                filteredJobs.map((job) => (
                  <JobCard key={job._id} job={job} onDeleteRequest={setJobToDelete} />
                ))
              )}
            </section>
          </>
        ) : (
          <section className="glass-panel rise-in p-6 text-center sm:p-10">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.75rem] bg-slate-900 text-white dark:bg-white dark:text-slate-900">
              <Briefcase className="h-8 w-8" />
            </div>
            <h2 className="mt-5 text-2xl font-black tracking-tight text-slate-900 dark:text-slate-50">
              Sign in to see your applications
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base dark:text-slate-300">
              Your dashboard, sorting controls, and saved applications appear once you sign in with Google.
            </p>
            <Link
              href="/auth/sign-in"
              className="mt-6 inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
            >
              Sign in
            </Link>
          </section>
        )}
      </div>

      <DeleteConfirmDialog
        job={jobToDelete}
        open={Boolean(jobToDelete)}
        pending={deletePending}
        onCancel={() => {
          if (!deletePending) {
            setJobToDelete(null)
          }
        }}
        onConfirm={() => void handleConfirmDelete()}
      />

      {toast && <Toast message={toast} onClose={() => setToast(null)} />}
    </div>
  )
}
