'use client'

import {
  ArrowLeft,
  Loader2,
  MoreHorizontal,
  Pencil,
  Save,
  Trash2,
} from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { SubmitButton } from '@/components/pipeline/submit-button'
import {
  UnsavedChangesGuardProvider,
  useUnsavedChangesGuard,
} from '@/hooks/use-unsaved-changes-guard'
import { useDeleteProject, useUpdateProject } from '@/hooks/use-projects'
import { usePipelineStore } from '@/stores/pipeline-store'
import { AppModal } from '@/components/ui/app-modal'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
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
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'

type EditorToolbarProps = {
  userId: string
  projectId: string
  fallbackName: string
}

function EditorToolbarInner({ userId, projectId, fallbackName }: EditorToolbarProps) {
  const router = useRouter()
  const projectName = usePipelineStore((s) => s.projectName)
  const initialized = usePipelineStore((s) => s.initialized)
  const setProjectName = usePipelineStore((s) => s.setProjectName)
  const markClean = usePipelineStore((s) => s.markClean)
  const nodes = usePipelineStore((s) => s.nodes)
  const edges = usePipelineStore((s) => s.edges)
  const updateProject = useUpdateProject(userId)
  const deleteProject = useDeleteProject(userId)
  const { pendingNav, setPendingNav, guardNavigation, confirmLeave } =
    useUnsavedChangesGuard()

  const [renameOpen, setRenameOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [renameValue, setRenameValue] = useState('')

  const displayName = initialized ? projectName : fallbackName

  const openRename = () => {
    setRenameValue(displayName)
    setRenameOpen(true)
  }

  const handleSave = () => {
    const trimmed = projectName.trim()
    if (!trimmed) {
      toast.error('Project name cannot be empty')
      return
    }
    updateProject.mutate(
      { id: projectId, payload: { name: trimmed, nodes, edges } },
      {
        onSuccess: () => {
          markClean()
          toast.success('Saved')
        },
        onError: (err) => toast.error(err.message),
      }
    )
  }

  const handleRename = () => {
    const trimmed = renameValue.trim()
    if (!trimmed) return
    setProjectName(trimmed)
    updateProject.mutate(
      { id: projectId, payload: { name: trimmed } },
      {
        onSuccess: () => {
          setRenameOpen(false)
          toast.success('Renamed')
        },
      }
    )
  }

  const handleDelete = () => {
    deleteProject.mutate(projectId)
  }

  const handleBack = () => {
    guardNavigation('/dashboard', () => router.push('/dashboard'))
  }

  return (
    <UnsavedChangesGuardProvider
      pendingNav={pendingNav}
      setPendingNav={setPendingNav}
      confirmLeave={confirmLeave}
    >
      <header className="flex h-12 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />

        <Button variant="ghost" size="icon-sm" onClick={handleBack}>
          <ArrowLeft className="size-4" />
          <span className="sr-only">Back</span>
        </Button>

        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/dashboard">Projects</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="max-w-[240px] truncate">
                <button
                  type="button"
                  onClick={openRename}
                  className="truncate hover:underline"
                  title="Click to rename"
                >
                  {displayName}
                </button>
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="ml-auto flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleSave}
            disabled={updateProject.isPending}
          >
            {updateProject.isPending ? (
              <Loader2 className="mr-1 size-4 animate-spin" />
            ) : (
              <Save className="mr-1 size-4" />
            )}
            Save
          </Button>
          <SubmitButton />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={openRename}>
                <Pencil className="mr-2 size-4" />
                Rename
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="mr-2 size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <AppModal
        open={renameOpen}
        onOpenChange={setRenameOpen}
        title="Rename workflow"
        footer={
          <>
            <Button variant="outline" onClick={() => setRenameOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              disabled={!renameValue.trim() || updateProject.isPending}
            >
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-2">
          <Label htmlFor="rename-workflow">Name</Label>
          <Input
            id="rename-workflow"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleRename()}
          />
        </div>
      </AppModal>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete workflow"
        description={`Are you sure you want to delete "${displayName}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        loading={deleteProject.isPending}
        onConfirm={handleDelete}
      />
    </UnsavedChangesGuardProvider>
  )
}

export function EditorToolbar(props: EditorToolbarProps) {
  return <EditorToolbarInner {...props} />
}
