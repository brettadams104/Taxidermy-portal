import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ClientNav } from './client-nav'

export default async function ClientLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-black px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <Link href="/portal" className="font-bold text-lg text-white">B Cuts Taxidermy</Link>
        <ClientNav signOut={signOut} />
      </header>
      <main className="flex-1 max-w-2xl mx-auto w-full p-4">
        {children}
      </main>
    </div>
  )
}
