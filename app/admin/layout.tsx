import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AdminSidebar } from './sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single()
  if (profile?.role !== 'admin') redirect('/portal')

  async function signOut() {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'var(--background)' }}>
      <header className="sticky top-0 z-10 border-b shadow-sm" style={{ backgroundColor: 'var(--primary)', borderColor: 'var(--border)' }}>
        <div className="px-6 py-4">
          <Link href="/admin/dashboard" className="font-bold text-2xl text-white">
            Skull Studio
          </Link>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar signOut={signOut} />
        <main className="flex-1 overflow-y-auto lg:px-8 px-4 py-8" style={{ backgroundColor: 'var(--background)' }}>
          <div className="max-w-6xl mx-auto w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
