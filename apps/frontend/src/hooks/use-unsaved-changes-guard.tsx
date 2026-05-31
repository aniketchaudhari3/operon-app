'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { usePipelineStore } from '@/stores/pipeline-store'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

type PendingNavigation = {
  href: string
} | null

export function useUnsavedChangesGuard() {
  const isDirty = usePipelineStore((s) => s.isDirty)
  const [pendingNav, setPendingNav] = useState<PendingNavigation>(null)

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!isDirty) return
      e.preventDefault()
      e.returnValue = ''
    }
    window.addEventListener('beforeunload', handler)
    return () => window.removeEventListener('beforeunload', handler)
  }, [isDirty])

  const guardNavigation = useCallback(
    (href: string, navigate: () => void) => {
      if (!isDirty) {
        navigate()
        return
      }
      setPendingNav({ href })
    },
    [isDirty]
  )

  const confirmLeave = useCallback(
    (router: ReturnType<typeof useRouter>) => {
      if (!pendingNav) return
      router.push(pendingNav.href)
      setPendingNav(null)
    },
    [pendingNav]
  )

  return {
    isDirty,
    pendingNav,
    setPendingNav,
    guardNavigation,
    confirmLeave,
  }
}

export function UnsavedChangesDialog({
  open,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) {
  return (
    <ConfirmDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Unsaved changes"
      description="You have unsaved changes in this workflow. Leave without saving?"
      confirmLabel="Leave without saving"
      cancelLabel="Stay on page"
      variant="destructive"
      onConfirm={onConfirm}
    />
  )
}

export function UnsavedChangesGuardProvider({
  children,
  pendingNav,
  setPendingNav,
  confirmLeave,
}: {
  children: React.ReactNode
  pendingNav: PendingNavigation
  setPendingNav: (nav: PendingNavigation) => void
  confirmLeave: (router: ReturnType<typeof useRouter>) => void
}) {
  const router = useRouter()

  return (
    <>
      {children}
      <UnsavedChangesDialog
        open={!!pendingNav}
        onOpenChange={(open) => !open && setPendingNav(null)}
        onConfirm={() => confirmLeave(router)}
      />
    </>
  )
}
