'use client'

import { Copy, Trash2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

type NodeContextMenuProps = {
  nodeId: string | null
  position: { x: number; y: number } | null
  onClose: () => void
  onDuplicate: (nodeId: string) => void
  onDelete: (nodeId: string) => void
}

export function NodeContextMenu({
  nodeId,
  position,
  onClose,
  onDuplicate,
  onDelete,
}: NodeContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!nodeId) return

    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as HTMLElement)) {
        onClose()
      }
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }

    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [nodeId, onClose])

  if (!nodeId || !position) return null

  return (
    <div
      ref={ref}
      className={cn(
        'fixed z-50 min-w-[140px] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
        'animate-in fade-in-0 zoom-in-95'
      )}
      style={{ top: position.y, left: position.x }}
    >
      <button
        type="button"
        className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm hover:bg-accent"
        onClick={() => {
          onDuplicate(nodeId)
          onClose()
        }}
      >
        <Copy className="size-3.5" />
        Duplicate
      </button>
      <button
        type="button"
        className="flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm text-destructive hover:bg-destructive/10"
        onClick={() => {
          onDelete(nodeId)
          onClose()
        }}
      >
        <Trash2 className="size-3.5" />
        Delete
      </button>
    </div>
  )
}
