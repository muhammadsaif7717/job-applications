// app/auth/sign-in/page.tsx - ✅ FIXED
import SignInPage from '@/components/SignInPage'
import { Suspense } from 'react'


export default function SigninPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInPage/>
    </Suspense>
  )
}
