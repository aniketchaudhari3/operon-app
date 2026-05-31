'use client'

import { useState } from 'react'
import Link from 'next/link'
import { FolderOpen, Loader2, MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import type { Project } from '@/actions/projects'
import { useDeleteProject, useUpdateProject } from '@/hooks/use-projects'
import { AppModal } from '@/components/ui/app-modal'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

function formatDate(dateStr: string) {
  const d = new Date(dateStr)
  const day = d.getDate().toString().padStart(2, '0')
  const month = d.toLocaleString('en', { month: 'short' })
  const year = d.getFullYear().toString().slice(-2)
  const time = d.toLocaleTimeString('en', { hour12: false })
  return `${day} ${month} ${year} ${time}`
}

function truncateId(id: string) {
  return id.length > 12 ? `${id.slice(0, 8)}…${id.slice(-4)}` : id
}

type ProjectTableProps = {
  userId: string
  projects: Project[]
}

export function ProjectTable({ userId, projects }: ProjectTableProps) {
  const [renameTarget, setRenameTarget] = useState<Project | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const updateProject = useUpdateProject(userId)
  const deleteProject = useDeleteProject(userId)

  const openRename = (project: Project) => {
    setRenameTarget(project)
    setRenameValue(project.name)
  }

  const handleRename = () => {
    if (!renameTarget) return
    const trimmed = renameValue.trim()
    if (!trimmed) return
    updateProject.mutate(
      { id: renameTarget.id, payload: { name: trimmed } },
      { onSuccess: () => setRenameTarget(null) }
    )
  }

  const handleDelete = () => {
    if (!deleteTarget) return
    deleteProject.mutate(deleteTarget.id, {
      onSuccess: () => setDeleteTarget(null),
    })
  }

  return (
    <>
      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="text-section-label">Project</TableHead>
              <TableHead className="text-section-label">Nodes</TableHead>
              <TableHead className="text-section-label">Last updated</TableHead>
              <TableHead className="w-12" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.map((project) => (
              <TableRow key={project.id}>
                <TableCell>
                  <Link
                    href={`/dashboard/projects/${project.id}`}
                    className="block hover:underline"
                  >
                    <span className="font-medium">{project.name}</span>
                    <span className="mt-0.5 block font-mono text-xs text-muted-foreground">
                      {truncateId(project.id)}
                    </span>
                  </Link>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {project.nodes?.length ?? 0}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(project.updated_at)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="size-8">
                        <MoreHorizontal className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/dashboard/projects/${project.id}`}>
                          <FolderOpen className="mr-2 size-4" />
                          Open
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openRename(project)}>
                        <Pencil className="mr-2 size-4" />
                        Rename
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteTarget(project)}
                      >
                        <Trash2 className="mr-2 size-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <AppModal
        open={!!renameTarget}
        onOpenChange={(open) => !open && setRenameTarget(null)}
        title="Rename project"
        footer={
          <>
            <Button variant="outline" onClick={() => setRenameTarget(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              disabled={!renameValue.trim() || updateProject.isPending}
            >
              {updateProject.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : null}
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-2">
          <Label htmlFor="rename-project">Name</Label>
          <Input
            id="rename-project"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
          />
        </div>
      </AppModal>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete project"
        description={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteProject.isPending}
        onConfirm={handleDelete}
      />
    </>
  )
}
