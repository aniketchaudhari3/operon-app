'use client'

import { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import { Handle, Position, type NodeProps } from '@xyflow/react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { parseVariables } from '@/lib/nodes/parse-variables'
import {
  CATEGORY_BADGE,
  CATEGORY_ICON,
  type NodeConfig,
} from '@/lib/nodes/types'
import { usePipelineStore } from '@/stores/pipeline-store'
import { cn } from '@/lib/utils'

const handleClass =
  '!size-2.5 !border-2 !border-background !shadow-sm transition-colors'
const staticHandleClass = cn(handleClass, '!bg-muted-foreground')
const variableHandleClass = cn(handleClass, '!bg-primary')

function PipelineNodeShell({
  id,
  config,
  data,
}: {
  id: string
  config: NodeConfig
  data: Record<string, string>
}) {
  const updateNodeField = usePipelineStore((s) => s.updateNodeField)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)
  const Icon = config.icon
  const fields = config.fields ?? []

  const variables = useMemo(() => {
    if (config.dynamicInputs !== 'variables') return []
    return parseVariables(data.text ?? '')
  }, [config.dynamicInputs, data.text])

  const staticInputs = config.inputs ?? []
  const inputCount = staticInputs.length + variables.length

  const inputHandleTop = (slotIndex: number) =>
    `${((slotIndex + 1) / (inputCount + 1)) * 100}%`

  const resizeTextarea = useCallback(() => {
    const el = textareaRef.current
    const card = cardRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${Math.max(el.scrollHeight, 56)}px`
    if (config.type === 'text' && card) {
      const width = Math.min(Math.max(el.scrollWidth + 48, 240), 420)
      card.style.width = `${width}px`
    }
  }, [config.type])

  useEffect(() => {
    if (config.type === 'text') resizeTextarea()
  }, [config.type, data.text, resizeTextarea])

  const handleFieldChange = (name: string, value: string) => {
    updateNodeField(id, name, value)
  }

  return (
    <div ref={config.type === 'text' ? cardRef : undefined}>
      <div
        className={cn(
          'group/node relative min-w-[240px] overflow-hidden rounded-lg bg-card text-card-foreground shadow-sm',
          'transition-shadow hover:shadow-md',
          variables.length > 0 && 'overflow-visible'
        )}
      >
        {staticInputs.map((input, index) => (
          <Handle
            key={input.id}
            type="target"
            position={Position.Left}
            id={`${id}-${input.id}`}
            style={{ top: inputHandleTop(index) }}
            className={staticHandleClass}
          />
        ))}
        {variables.map((variable, index) => {
          const top = inputHandleTop(staticInputs.length + index)
          return (
            <div key={variable}>
              <span
                className="pointer-events-none absolute left-0 z-10 max-w-[96px] -translate-x-full -translate-y-1/2 truncate rounded border border-primary/20 bg-primary/10 px-1.5 py-0.5 pr-2 text-[10px] font-medium leading-none text-primary"
                style={{ top }}
                title={variable}
              >
                {variable}
              </span>
              <Handle
                type="target"
                position={Position.Left}
                id={`${id}-${variable}`}
                style={{ top }}
                className={variableHandleClass}
                title={variable}
              />
            </div>
          )
        })}

        <div className="border-b border-border/60 bg-muted/25 px-3 py-2">
          <div className="flex items-start gap-2.5">
            {Icon ? (
              <div
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-md ring-1 ring-inset',
                  CATEGORY_ICON[config.category]
                )}
              >
                <Icon className="size-3.5" strokeWidth={2} />
              </div>
            ) : null}
            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex items-center justify-between gap-2">
                <p className="truncate text-[13px] font-semibold leading-tight tracking-tight">
                  {config.label}
                </p>
                <Badge
                  variant="outline"
                  className={cn(
                    'shrink-0 px-1.5 py-0 text-[9px] font-semibold uppercase tracking-wider',
                    CATEGORY_BADGE[config.category]
                  )}
                >
                  {config.category}
                </Badge>
              </div>
              {config.description ? (
                <p className="text-[11px] leading-snug text-muted-foreground">
                  {config.description}
                </p>
              ) : null}
            </div>
          </div>
        </div>

        {fields.length > 0 ? (
          <div className="space-y-2 px-3 py-2">
            {fields.map((field) => (
              <div key={field.name} className="space-y-1">
                <Label
                  htmlFor={`${id}-${field.name}`}
                  className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground"
                >
                  {field.label}
                </Label>
                {field.type === 'select' ? (
                  <Select
                    value={data[field.name] ?? field.defaultValue ?? ''}
                    onValueChange={(value) =>
                      handleFieldChange(field.name, value)
                    }
                  >
                    <SelectTrigger
                      id={`${id}-${field.name}`}
                      className="h-7 border-border/80 bg-background text-xs shadow-none"
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {field.options?.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : field.type === 'textarea' ? (
                  <Textarea
                    ref={config.type === 'text' ? textareaRef : undefined}
                    id={`${id}-${field.name}`}
                    value={data[field.name] ?? field.defaultValue ?? ''}
                    placeholder={field.placeholder}
                    onChange={(e) => {
                      handleFieldChange(field.name, e.target.value)
                      if (config.type === 'text') resizeTextarea()
                    }}
                    className="min-h-[56px] resize-none border-border/80 bg-background text-xs shadow-none field-sizing-content"
                  />
                ) : (
                  <Input
                    id={`${id}-${field.name}`}
                    value={data[field.name] ?? field.defaultValue ?? ''}
                    placeholder={field.placeholder}
                    onChange={(e) =>
                      handleFieldChange(field.name, e.target.value)
                    }
                    className="h-7 border-border/80 bg-background text-xs shadow-none"
                  />
                )}
              </div>
            ))}
          </div>
        ) : null}

        {(config.outputs ?? []).map((output, index) => (
          <Handle
            key={output.id}
            type="source"
            position={Position.Right}
            id={`${id}-${output.id}`}
            style={{
              top: `${((index + 1) / ((config.outputs?.length ?? 1) + 1)) * 100}%`,
            }}
            className={staticHandleClass}
          />
        ))}
      </div>
    </div>
  )
}

export function defineNode(config: NodeConfig) {
  const Component = memo(({ id, data }: NodeProps) => (
    <PipelineNodeShell
      id={id}
      config={config}
      data={(data ?? {}) as Record<string, string>}
    />
  ))
  Component.displayName = config.label
  return Component
}
