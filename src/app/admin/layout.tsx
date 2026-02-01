export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Simple wrapper - auth is handled by (dashboard)/layout.tsx
  return <>{children}</>
}
