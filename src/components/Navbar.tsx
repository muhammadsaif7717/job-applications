'use client'
import { useSession, signOut } from 'next-auth/react'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Home, 
  Plus, 
  Briefcase, 
  User, 
  LogOut, 
  ChevronDown, 
  Settings,
  Calendar,
  X,
  Menu 
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

const Navbar = () => {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [isClient, setIsClient] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const sidebarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setSidebarOpen(false)
      }
    }

    if (sidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [sidebarOpen])

  const navItems = [
    { href: '/', label: 'Jobs', icon: Briefcase },
    { href: '/add-job', label: 'Add Job', icon: Plus },
    // { href: '/calendar', label: 'Calendar', icon: Calendar },
  ]

  if (!isClient) {
    return (
      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="h-8 w-32 bg-gray-200/50 rounded-xl animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-gray-200/50 rounded-full animate-pulse" />
            <div className="h-8 w-24 bg-gray-200/50 rounded-xl animate-pulse ml-4" />
          </div>
        </div>
      </nav>
    )
  }

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <nav className="bg-white/95 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50 shadow-sm supports-[backdrop-filter:blur()]:bg-white/90">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-all duration-200">
                <Briefcase className="w-5 h-5 text-white drop-shadow-sm" />
              </div>
              <span className="text-xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent tracking-tight hidden md:inline">
                JobTracker
              </span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Button
                    key={item.href}
                    variant={isActive ? "secondary" : "ghost"}
                    asChild
                    className={`
                      rounded-2xl h-11 px-4 gap-2 font-semibold transition-all duration-200
                      ${isActive 
                        ? 'bg-blue-500/10 backdrop-blur-sm border border-blue-200/50 shadow-lg shadow-blue-100/20 text-blue-700 scale-105' 
                        : 'hover:bg-gray-50 hover:border hover:border-gray-200 hover:shadow-md text-gray-700'
                      }
                    `}
                  >
                    <Link href={item.href} className="flex items-center gap-2">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-blue-500' : 'text-gray-600 group-hover:text-blue-500'}`} />
                      {item.label}
                    </Link>
                  </Button>
                )
              })}
            </div>

            {/* Right side - Auth/User + Mobile menu */}
            <div className="flex items-center gap-3">
              {/* Auth Links - Desktop only */}
              {!session && status !== 'loading' && (
                <div className="hidden lg:flex items-center gap-2">
                  <Link 
                    href="/auth/sign-in"
                    className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors px-4 py-2 rounded-xl hover:bg-gray-50"
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/auth/sign-up"
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold px-6 py-2.5 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200 h-11"
                  >
                    Get Started
                  </Link>
                </div>
              )}

              {/* User Dropdown */}
              {session && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild className="outline-none focus:outline-none">
                    <Button 
                      variant="ghost" 
                      className="relative h-11 w-11 rounded-2xl hover:bg-gray-50 p-0 gap-2 shadow-md hover:shadow-lg transition-all duration-200"
                    >
                      <Avatar className="h-10 w-10">
                        <AvatarImage 
                          src={session.user?.image || undefined} 
                          alt={session.user?.name || 'User'}
                        />
                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-indigo-600 text-white font-semibold text-sm">
                          {session.user?.name?.charAt(0).toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                      <ChevronDown className="w-4 h-4 shrink-0 text-gray-500 transition-transform duration-200 group-data-[state=open]:rotate-180" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="w-64 mr-2 bg-white border-gray-200 rounded-2xl p-2 shadow-2xl border shadow-gray-200/50"
                  >
                    <div className="px-4 py-3 border-b border-gray-200/50 mb-2">
                      <div className="font-semibold text-gray-900 truncate">{session.user?.name}</div>
                      <div className="text-sm text-gray-500 truncate">{session.user?.email}</div>
                    </div>
                    
                    <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2.5 hover:bg-gray-50 focus:bg-gray-50">
                      <Link href="/profile" className="flex items-center gap-3 w-full">
                        <User className="w-4 h-4 text-gray-700" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild className="cursor-pointer rounded-xl px-3 py-2.5 hover:bg-gray-50 focus:bg-gray-50">
                      <Link href="/settings" className="flex items-center gap-3 w-full">
                        <Settings className="w-4 h-4 text-gray-700" />
                        Settings
                      </Link>
                    </DropdownMenuItem>

                    <DropdownMenuItem 
                      onClick={() => signOut({ callbackUrl: '/' })}
                      className="cursor-pointer rounded-xl px-3 py-2.5 mt-1 text-red-600 hover:bg-red-50 focus:bg-red-50 border-t border-gray-200/50"
                    >
                      <LogOut className="w-4 h-4 mr-3 shrink-0" />
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                className="lg:hidden p-2 h-11 w-11 rounded-2xl hover:bg-gray-50"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="w-6 h-6 lg:hidden text-gray-700" />
                <X className="w-6 h-6 hidden lg:block text-gray-700" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar - LIGHT MODE */}
      <div 
        ref={sidebarRef}
        className={`
          fixed top-0 left-0 h-full w-72 bg-white/95 backdrop-blur-md border-r border-gray-200/50 
          transform transition-transform duration-300 ease-in-out z-50
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          md:hidden shadow-2xl shadow-gray-200/50
        `}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-200/50">
          <Link href="/" className="flex items-center gap-3 group" onClick={() => setSidebarOpen(false)}>
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Briefcase className="w-5 h-5 text-white drop-shadow-sm" />
            </div>
            <span className="text-xl font-black bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 bg-clip-text text-transparent">
              JobTracker
            </span>
          </Link>
        </div>

        {/* Sidebar Nav */}
        <div className="p-4 space-y-2 pt-6">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 p-4 rounded-2xl transition-all duration-200 group
                  ${isActive 
                    ? 'bg-blue-500/10 backdrop-blur-sm border border-blue-200/50 shadow-lg font-semibold text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 hover:border hover:border-gray-200'
                  }
                `}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-blue-500' : 'text-gray-600 group-hover:text-blue-500'}`} />
                <span className="font-medium">{item.label}</span>
              </Link>
            )
          })}

          {/* Auth Links in Sidebar */}
          {!session && status !== 'loading' && (
            <div className="pt-4 border-t border-gray-200/50 space-y-2">
              <Link 
                href="/auth/sign-in"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 p-4 rounded-2xl text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200"
              >
                Sign In
              </Link>
              <Link 
                href="/auth/sign-up"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold shadow-lg transition-all duration-200"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default Navbar
