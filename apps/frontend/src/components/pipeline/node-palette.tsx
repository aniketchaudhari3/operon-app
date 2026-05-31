'use client'

import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import { paletteGroups, type PaletteGroup } from '@/lib/nodes/registry'
import { cn } from '@/lib/utils'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'

const GROUP_LABELS: Record<PaletteGroup, string> = {
  input: 'Input',
  transform: 'Transform',
  output: 'Output',
}

function DraggableItem({
  type,
  label,
  icon: Icon,
}: {
  type: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
}) {
  const onDragStart = (event: React.DragEvent) => {
    event.dataTransfer.setData(
      'application/reactflow',
      JSON.stringify({ nodeType: type })
    )
    event.dataTransfer.effectAllowed = 'move'
  }

  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={cn(
        'flex cursor-grab items-center gap-2 rounded-md px-2 py-1.5 text-sm',
        'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
        'active:cursor-grabbing'
      )}
    >
      {Icon ? (
        <Icon className="size-3.5 shrink-0 text-muted-foreground" />
      ) : (
        <span className="size-3.5 shrink-0" />
      )}
      <span className="truncate">{label}</span>
    </div>
  )
}

export function NodePalette() {
  const [query, setQuery] = useState('')

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (Object.keys(paletteGroups) as PaletteGroup[])
      .map((group) => ({
        group,
        nodes: paletteGroups[group].filter(
          (node) =>
            !q ||
            node.label.toLowerCase().includes(q) ||
            node.type.toLowerCase().includes(q)
        ),
      }))
      .filter(({ nodes }) => nodes.length > 0)
  }, [query])

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 px-3 py-2">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 size-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search nodes"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-8 pl-8 text-xs"
          />
        </div>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="py-2">
          {filteredGroups.length === 0 ? (
            <p className="px-3 py-4 text-center text-xs text-muted-foreground">
              No nodes found
            </p>
          ) : (
            filteredGroups.map(({ group, nodes }) => (
              <div key={group} className="mb-1">
                <p className="px-3 py-1.5 text-section-label">
                  {GROUP_LABELS[group]}
                </p>
                <div className="px-1">
                  {nodes.map((node) => (
                    <DraggableItem
                      key={node.type}
                      type={node.type}
                      label={node.label}
                      icon={node.icon}
                    />
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
