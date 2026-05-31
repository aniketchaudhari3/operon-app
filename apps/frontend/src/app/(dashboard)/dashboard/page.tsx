import { listProjects } from '@/actions/projects'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { ProjectsPageClient } from '@/components/projects/projects-page-client'
import { createClient } from '@/lib/supabase/server'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const projects = await listProjects()

  return (
    <>
      <DashboardHeader />
      <ProjectsPageClient userId={user.id} initialProjects={projects} />
    </>
  )
}
