'use client'

import {
  BezierEdge,
  EdgeToolbar,
  getBezierPath,
  type EdgeProps,
} from '@xyflow/react'
import { X } from 'lucide-react'
import { usePipelineStore } from '@/stores/pipeline-store'
import { cn } from '@/lib/utils'

export function DeletableEdge(props: EdgeProps) {
  const { id, pathOptions, ...edgeProps } = props
  const deleteEdge = usePipelineStore((s) => s.deleteEdge)
  const [, labelX, labelY] = getBezierPath({
    sourceX: edgeProps.sourceX,
    sourceY: edgeProps.sourceY,
    sourcePosition: edgeProps.sourcePosition,
    targetX: edgeProps.targetX,
    targetY: edgeProps.targetY,
    targetPosition: edgeProps.targetPosition,
    curvature: pathOptions?.curvature,
  })

  return (
    <>
      <BezierEdge id={id} pathOptions={pathOptions} {...edgeProps} />
      <EdgeToolbar
        edgeId={id}
        x={labelX}
        y={labelY}
        isVisible
        alignX="center"
        alignY="center"
      >
        <button
          type="button"
          className={cn(
            'nodrag nopan flex size-5 items-center justify-center rounded-full border',
            'bg-background text-muted-foreground shadow-sm',
            'hover:border-destructive hover:bg-destructive hover:text-destructive-foreground'
          )}
          aria-label="Delete connection"
          onClick={(event) => {
            event.stopPropagation()
            deleteEdge(id)
          }}
        >
          <X className="size-3" strokeWidth={2.5} />
        </button>
      </EdgeToolbar>
    </>
  )
}
