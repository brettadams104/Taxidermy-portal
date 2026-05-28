import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

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
      <header className="bg-white border-b px-4 py-3 flex items-center justify-between sticky top-0 z-10">
        <Link href="/portal" className="font-bold text-lg">My Skulls</Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/portal/profile" className="text-gray-600 hover:text-gray-900">Profile</Link>
          <form action={signOut}>
            <button type="submit" className="text-gray-400 hover:text-gray-900">Sign Out</button>
          </form>
        </nav>
      </header>
      <main className="flex-1 max-w-2xl mx-auto w-full p-4">
        {children}
      </main>
    </div>
  )
}
