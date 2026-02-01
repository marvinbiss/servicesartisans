import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/sidebar'

// Admin email whitelist (temporary until profiles table is set up)
const ADMIN_EMAILS = [
  'marvin.bissohong@yeoskin.com',
]

export default async function AdminDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Verify user is authenticated
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/connexion')
  }

  // Check admin access: first try profiles table, then fall back to email whitelist
  let isAdmin = false

  // Try profiles table
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, is_admin')
    .eq('id', user.id)
    .single()

  if (!profileError && profile) {
    isAdmin = profile.role === 'super_admin' ||
              profile.role === 'admin' ||
              profile.role === 'moderator' ||
              profile.is_admin === true
  }

  // Fallback: check email whitelist
  if (!isAdmin && user.email && ADMIN_EMAILS.includes(user.email)) {
    isAdmin = true
  }

  if (!isAdmin) {
    redirect('/?error=unauthorized')
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-gray-50">
        {children}
      </main>
    </div>
  )
}
