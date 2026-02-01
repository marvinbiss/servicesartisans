import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Verify user is authenticated and has admin role
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/connexion?redirect=/admin')
  }

  // Check if user has admin role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, is_admin')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.role === 'super_admin' ||
                  profile?.role === 'admin' ||
                  profile?.role === 'moderator' ||
                  profile?.is_admin === true

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
