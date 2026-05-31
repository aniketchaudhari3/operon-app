'use client'

import { useMemo, useState } from 'react'
import { Loader2, Plus, Search } from 'lucide-react'
import type { Project } from '@/actions/projects'
import { useCreateProject, useProjects } from '@/hooks/use-projects'
import { ProjectTable } from '@/components/projects/project-table'
import { ProjectsEmptyState } from '@/components/projects/projects-empty-state'
import { AppModal } from '@/components/ui/app-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type ProjectsPageClientProps = {
  userId: string
  initialProjects: Project[]
}

export function ProjectsPageClient({
  userId,
  initialProjects,
}: ProjectsPageClientProps) {
  const { data: projects = initialProjects } = useProjects(userId, initialProjects)
  const createProject = useCreateProject(userId)
  const [query, setQuery] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')

  const filtered = useMemo(
    () =>
      projects.filter((p) =>
        p.name.toLowerCase().includes(query.toLowerCase())
      ),
    [projects, query]
  )

  const handleCreate = () => {
    const trimmed = newName.trim()
    if (!trimmed) return
    createProject.mutate(trimmed, {
      onSuccess: () => {
        setCreateOpen(false)
        setNewName('')
      },
    })
  }

  return (
    <div className="w-full px-6 py-8">
      <div className="mb-8">
        <h1 className="text-page-title">Projects</h1>
        <p className="mt-1 text-page-subtitle">
          Build and validate workflow pipelines
        </p>
      </div>

      <div className="mb-6 flex items-center gap-3">
        <div className="relative max-w-md flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search projects"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button className="ml-auto shrink-0" onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 size-4" />
          New project
        </Button>
      </div>

      {filtered.length === 0 ? (
        <ProjectsEmptyState
          variant={projects.length === 0 ? 'empty' : 'no-results'}
          onCreateClick={() => setCreateOpen(true)}
          onClearSearch={() => setQuery('')}
        />
      ) : (
        <ProjectTable userId={userId} projects={filtered} />
      )}

      <AppModal
        open={createOpen}
        onOpenChange={setCreateOpen}
        title="Create project"
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!newName.trim() || createProject.isPending}
            >
              {createProject.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              Create
            </Button>
          </>
        }
      >
        <div className="space-y-2">
          <Label htmlFor="new-project-name">Name</Label>
          <Input
            id="new-project-name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="My workflow"
            onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
          />
        </div>
      </AppModal>
    </div>
  )
}
