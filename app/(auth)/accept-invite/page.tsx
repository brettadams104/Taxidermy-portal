'use client'

import { Suspense } from 'react'
import AcceptInviteForm from './accept-invite-form'

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><p className="text-gray-600">Loading...</p></div>}>
      <AcceptInviteForm />
    </Suspense>
  )
}
