'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut, useSession } from 'next-auth/react'
import { useState } from 'react'
import { BriefcaseBusiness, ChevronRight, LogOut, Menu, Plus, User, X } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import ThemeToggle from '@/components/ThemeToggle'

const navItems = [
  { href: '/', authLabel: 'Dashboard', guestLabel: 'Home', icon: BriefcaseBusiness },
  { href: '/add-job', label: 'Add Application', icon: Plus },
]

export default function Navbar() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [mobileOpen, setMobileOpen] = useState(false)

  if (pathname === '/auth/sign-in') {
    return null
  }

  const accountName = session?.user?.name || 'Guest'
  const accountEmail = session?.user?.email || 'Sign in to sync your applications'
  const accountInitial = accountName.charAt(0).toUpperCase() || 'G'

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation overlay"
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <header className="sticky top-0 z-50 px-3 pt-3 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center gap-3 rounded-[28px] border border-white/60 bg-white/72 px-3 py-3 shadow-[0_22px_55px_-30px_rgba(34,55,90,0.45)] backdrop-blur-2xl transition-colors duration-300 sm:px-5 dark:border-white/10 dark:bg-slate-950/72 dark:shadow-[0_22px_55px_-28px_rgba(0,0,0,0.7)]">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#265dff,#2aa6ff_52%,#43c49d)] shadow-lg shadow-blue-500/20">
              <BriefcaseBusiness className="h-5 w-5 text-white" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-[11px] font-black uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                Job Tracker
              </p>
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                Focused search workspace
              </p>
            </div>
          </Link>

          <nav className="ml-auto hidden items-center gap-2 md:flex">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              const label =
                'label' in item
                  ? item.label
                  : session?.user
                    ? item.authLabel
                    : item.guestLabel

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`inline-flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition-all duration-300 ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20 dark:bg-white dark:text-slate-900'
                      : 'text-slate-600 hover:-translate-y-0.5 hover:bg-slate-100/90 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              )
            })}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <ThemeToggle />

            {status === 'loading' ? (
              <div className="h-11 w-32 animate-pulse rounded-2xl bg-slate-200/80 dark:bg-slate-800" />
            ) : session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-auto rounded-2xl border border-slate-200/80 bg-white/85 px-2.5 py-2 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-900/75 dark:hover:bg-slate-800"
                  >
                    <Avatar className="h-10 w-10 border border-white/70 shadow-sm dark:border-white/10">
                      <AvatarImage src={session.user.image || ''} alt={accountName} />
                      <AvatarFallback className="bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                        {accountInitial}
                      </AvatarFallback>
                    </Avatar>
                    <div className="max-w-32 px-2 text-left">
                      <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                        {accountName}
                      </p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {accountEmail}
                      </p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2">
                  <DropdownMenuItem
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="cursor-pointer rounded-xl px-3 py-2 text-sm font-medium"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                href="/auth/sign-in"
                className="inline-flex h-11 items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-lg shadow-slate-900/15 transition hover:-translate-y-0.5 hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100"
              >
                Sign in
              </Link>
            )}
          </div>

          <div className="ml-auto flex items-center gap-2 md:hidden">
            <ThemeToggle compact />
            <button
              type="button"
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white/85 text-slate-700 shadow-sm transition dark:border-white/10 dark:bg-slate-900/75 dark:text-slate-100"
              onClick={() => setMobileOpen((open) => !open)}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-[min(24rem,92vw)] flex-col border-l border-white/50 bg-white/92 p-5 shadow-2xl backdrop-blur-2xl transition-transform duration-300 md:hidden dark:border-white/10 dark:bg-slate-950/92 ${
          mobileOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="mb-8 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              Navigation
            </p>
            <p className="mt-1 text-lg font-bold text-slate-900 dark:text-slate-100">
              Stay organized
            </p>
          </div>
          <button
            type="button"
            aria-label="Close menu"
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            const label =
              'label' in item
                ? item.label
                : session?.user
                  ? item.authLabel
                  : item.guestLabel

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center justify-between rounded-2xl px-4 py-3.5 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                    : 'bg-slate-100/80 text-slate-700 dark:bg-slate-900/80 dark:text-slate-200'
                }`}
              >
                <span className="flex items-center gap-3">
                  <Icon className="h-4 w-4" />
                  {label}
                </span>
                <ChevronRight className="h-4 w-4 opacity-60" />
              </Link>
            )
          })}
        </div>

        <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-slate-900/80">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Theme
          </p>
          <div className="mt-3">
            <ThemeToggle />
          </div>
        </div>

        <div className="mt-4 rounded-3xl border border-slate-200 bg-slate-50/90 p-4 dark:border-white/10 dark:bg-slate-900/80">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Account
          </p>
          <div className="mt-3 flex items-center gap-3">
            <Avatar className="h-11 w-11 border border-white shadow-sm dark:border-slate-800">
              <AvatarImage src={session?.user?.image || ''} alt={accountName} />
              <AvatarFallback className="bg-slate-900 text-white dark:bg-white dark:text-slate-900">
                {accountInitial}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
                {accountName}
              </p>
              <p className="truncate text-xs text-slate-500 dark:text-slate-400">{accountEmail}</p>
            </div>
          </div>

          <div className="mt-4">
            {session?.user ? (
              <button
                type="button"
                className="flex w-full items-center justify-center rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600 dark:bg-rose-950/40 dark:text-rose-300"
                onClick={() => signOut({ callbackUrl: '/' })}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </button>
            ) : (
              <Link
                href="/auth/sign-in"
                onClick={() => setMobileOpen(false)}
                className="flex w-full items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white dark:bg-white dark:text-slate-900"
              >
                <User className="mr-2 h-4 w-4" />
                Sign in
              </Link>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}
