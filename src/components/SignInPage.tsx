// app/auth/sign-in/page.tsx - LIGHT MODE ONLY
'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { // ✅ Fixed: Google icon instead of Mail
  Briefcase,
  ArrowLeft, 
  Loader2,
  MailIcon
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function SignInPage() {
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/'

  const handleGoogleSignin = async () => {
    setLoading(true)
    await signIn('google', { callbackUrl })
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50 flex items-center justify-center p-4 relative">
      {/* Light mode background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-400/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
      </div>

      <div className="w-full max-w-sm relative z-10">
        <div className="bg-white/90 backdrop-blur-3xl border border-gray-200/60 rounded-3xl p-8 shadow-2xl shadow-gray-200/40">
          
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl border border-white/30">
              <Briefcase className="w-10 h-10 text-white drop-shadow-lg" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-2">
              Sign In
            </h1>
            <p className="text-gray-600 text-lg font-medium">Continue with Google</p>
          </div>

          <Button
            onClick={handleGoogleSignin}
            disabled={loading}
            className="w-full h-16 rounded-3xl text-lg font-semibold shadow-2xl hover:shadow-3xl hover:-translate-y-1 transition-all duration-300 border-0 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white backdrop-blur-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <MailIcon className="w-6 h-6 mr-3" />
                Continue with Google
              </>
            )}
          </Button>

          <div className="mt-8 pt-6 border-t border-gray-200/50 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 font-medium transition-all duration-200 group"
            >
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
