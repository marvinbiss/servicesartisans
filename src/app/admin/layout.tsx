import { AdminSidebar } from '@/components/admin/sidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // TEMPORAIRE: Acces ouvert pour configuration initiale
  // TODO: Reactiver l'authentification apres configuration
  // import { redirect } from 'next/navigation'
  // import { createClient } from '@/lib/supabase/server'
  // const supabase = createClient()
  // const { data: { user } } = await supabase.auth.getUser()
  // if (!user) redirect('/connexion')

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 bg-gray-50">
        {children}
      </main>
    </div>
  )
}
