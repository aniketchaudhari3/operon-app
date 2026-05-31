import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AppSidebar } from '@/components/layout/app-sidebar'
import { SidebarAutoCollapse } from '@/components/layout/sidebar-auto-collapse'
import { SidebarInset, SidebarProvider } from '@/components/ui/sidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const userName =
    (user.user_metadata?.name as string | undefined) ?? user.email?.split('@')[0]

  return (
    <SidebarProvider>
      <AppSidebar userEmail={user.email} userName={userName} />
      <SidebarAutoCollapse />
      <SidebarInset className="flex flex-col">{children}</SidebarInset>
    </SidebarProvider>
  )
}
