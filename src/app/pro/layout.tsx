'use client'

import { ProSidebar } from '@/components/pro/ProSidebar'

export default function ProLayout({ children }: { children: React.ReactNode }) {
  // In production, this would come from auth/session
  const mockArtisan = {
    name: 'Jean Dupont',
    avatar: undefined,
    subscription: 'pro' as const,
    unreadNotifications: 3,
    newLeads: 5,
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <ProSidebar
        artisanName={mockArtisan.name}
        artisanAvatar={mockArtisan.avatar}
        subscription={mockArtisan.subscription}
        unreadNotifications={mockArtisan.unreadNotifications}
        newLeads={mockArtisan.newLeads}
      />
      <main className="ml-[280px] min-h-screen">
        {children}
      </main>
    </div>
  )
}
