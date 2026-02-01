import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // En mode développement, autoriser l'accès sans authentification
  const isDev = process.env.NODE_ENV === 'development'

  if (!user && !isDev) {
    redirect('/connexion')
  }

  // Check if user is admin
  // Admins: emails dans ADMIN_EMAILS ou @servicesartisans.fr
  const adminEmails = process.env.ADMIN_EMAILS?.split(',') || ['admin@servicesartisans.fr']
  const isAdmin = isDev ||
    adminEmails.includes(user?.email || '') ||
    user?.email?.endsWith('@servicesartisans.fr')

  if (!isAdmin && !isDev) {
    redirect('/espace-artisan')
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
