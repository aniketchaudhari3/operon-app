'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  MarkerType,
  type Node,
  type ReactFlowInstance,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { Maximize2 } from 'lucide-react'
import { useShallow } from 'zustand/react/shallow'
import { NodeContextMenu } from '@/components/pipeline/node-context-menu'
import { edgeTypes } from '@/lib/nodes/edge-types'
import { nodeTypes } from '@/lib/nodes/node-types'
import { createNode, usePipelineStore } from '@/stores/pipeline-store'
import { Button } from '@/components/ui/button'

const proOptions = { hideAttribution: true } as const
const gridSize = 20

const defaultEdgeOptions = {
  type: 'deletable' as const,
  animated: true,
  markerEnd: { type: MarkerType.Arrow, width: 20, height: 20 },
}

const selector = (state: ReturnType<typeof usePipelineStore.getState>) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  duplicateNode: state.duplicateNode,
  deleteNode: state.deleteNode,
})

type PipelineCanvasProps = {
  projectId: string
  initialNodes: ReturnType<typeof usePipelineStore.getState>['nodes']
  initialEdges: ReturnType<typeof usePipelineStore.getState>['edges']
  initialName: string
}

export function PipelineCanvas({
  projectId,
  initialNodes,
  initialEdges,
  initialName,
}: PipelineCanvasProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const flowRef = useRef<ReactFlowInstance | null>(null)
  const initialized = usePipelineStore((s) => s.initialized)
  const storeProjectId = usePipelineStore((s) => s.projectId)
  const initFromProject = usePipelineStore((s) => s.initFromProject)
  const reset = usePipelineStore((s) => s.reset)

  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    duplicateNode,
    deleteNode,
  } = usePipelineStore(useShallow(selector))

  const [contextMenu, setContextMenu] = useState<{
    nodeId: string
    x: number
    y: number
  } | null>(null)

  useEffect(() => {
    if (initialized && storeProjectId === projectId) return

    initFromProject({
      id: projectId,
      name: initialName,
      nodes: initialNodes,
      edges: initialEdges,
    })
  }, [
    projectId,
    initialName,
    initialNodes,
    initialEdges,
    initialized,
    storeProjectId,
    initFromProject,
  ])

  useEffect(() => {
    return () => reset()
  }, [projectId, reset])

  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    const bounds = wrapperRef.current?.getBoundingClientRect()
    const raw = event.dataTransfer.getData('application/reactflow')
    if (!raw || !bounds || !flowRef.current) return

    const { nodeType } = JSON.parse(raw) as { nodeType?: string }
    if (!nodeType) return

    const position = flowRef.current.screenToFlowPosition({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
    })

    usePipelineStore.getState().addNode(createNode(nodeType, position))
  }, [])

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const fitView = useCallback(() => {
    flowRef.current?.fitView({ padding: 0.2 })
  }, [])

  const onNodeContextMenu = useCallback(
    (event: React.MouseEvent, node: Node) => {
      event.preventDefault()
      setContextMenu({
        nodeId: node.id,
        x: event.clientX,
        y: event.clientY,
      })
    },
    []
  )

  const onPaneClick = useCallback(() => {
    setContextMenu(null)
  }, [])

  if (!initialized) return null

  return (
    <div ref={wrapperRef} className="relative h-full w-full bg-[var(--canvas-bg)]">
      <ReactFlow
        className="pipeline-canvas"
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeContextMenu={onNodeContextMenu}
        onPaneClick={onPaneClick}
        onInit={(instance) => {
          flowRef.current = instance
        }}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        proOptions={proOptions}
        snapGrid={[gridSize, gridSize]}
        fitView
      >
        <Background
          variant={BackgroundVariant.Cross}
          gap={gridSize}
          size={1}
          color="var(--border)"
          style={{ opacity: 0.35 }}
        />
      </ReactFlow>
      <Button
        variant="secondary"
        size="sm"
        className="absolute bottom-3 right-3 z-10 shadow-sm"
        onClick={fitView}
      >
        <Maximize2 className="mr-1.5 size-4" />
        Fit to content
      </Button>
      <NodeContextMenu
        nodeId={contextMenu?.nodeId ?? null}
        position={
          contextMenu ? { x: contextMenu.x, y: contextMenu.y } : null
        }
        onClose={() => setContextMenu(null)}
        onDuplicate={duplicateNode}
        onDelete={deleteNode}
      />
    </div>
  )
}
