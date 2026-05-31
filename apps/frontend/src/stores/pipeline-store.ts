import { create } from 'zustand'
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  MarkerType,
  type Connection,
  type Edge,
  type EdgeChange,
  type Node,
  type NodeChange,
} from '@xyflow/react'
import { nodeConfigMap } from '@/lib/nodes/registry'

const edgeDefaults = {
  type: 'deletable' as const,
  animated: true,
  markerEnd: { type: MarkerType.Arrow, width: 20, height: 20 },
}

function normalizeEdge(edge: Edge): Edge {
  return {
    ...edge,
    ...edgeDefaults,
  }
}

type Baseline = {
  name: string
  nodes: Node[]
  edges: Edge[]
}

type PipelineState = {
  nodes: Node[]
  edges: Edge[]
  nodeIDs: Record<string, number>
  projectId: string | null
  projectName: string
  initialized: boolean
  baseline: Baseline | null
  isDirty: boolean
  getNodeID: (type: string) => string
  addNode: (node: Node) => void
  onNodesChange: (changes: NodeChange[]) => void
  onEdgesChange: (changes: EdgeChange[]) => void
  onConnect: (connection: Connection) => void
  updateNodeField: (nodeId: string, fieldName: string, fieldValue: string) => void
  setProjectName: (name: string) => void
  initFromProject: (payload: {
    id: string
    name: string
    nodes: Node[]
    edges: Edge[]
  }) => void
  markClean: () => void
  duplicateNode: (nodeId: string) => void
  deleteNode: (nodeId: string) => void
  deleteEdge: (edgeId: string) => void
  reset: () => void
}

const initialState = {
  nodes: [] as Node[],
  edges: [] as Edge[],
  nodeIDs: {} as Record<string, number>,
  projectId: null as string | null,
  projectName: 'Untitled',
  initialized: false,
  baseline: null as Baseline | null,
  isDirty: false,
}

function defaultData(type: string, nodeId: string): Record<string, string> {
  const config = nodeConfigMap[type]
  if (!config?.fields) return { id: nodeId, nodeType: type }

  const data: Record<string, string> = { id: nodeId, nodeType: type }
  for (const field of config.fields) {
    if (field.defaultValue !== undefined) {
      data[field.name] = field.defaultValue
    }
  }
  if (type === 'customInput') {
    data.inputName = nodeId.replace('customInput-', 'input_')
  }
  if (type === 'customOutput') {
    data.outputName = nodeId.replace('customOutput-', 'output_')
  }
  return data
}

function computeDirty(
  baseline: Baseline | null,
  name: string,
  nodes: Node[],
  edges: Edge[]
): boolean {
  if (!baseline) return false
  return (
    baseline.name !== name ||
    JSON.stringify(baseline.nodes) !== JSON.stringify(nodes) ||
    JSON.stringify(baseline.edges) !== JSON.stringify(edges)
  )
}

function withDirty(
  state: Pick<PipelineState, 'baseline' | 'projectName' | 'nodes' | 'edges'>
): { isDirty: boolean } {
  return {
    isDirty: computeDirty(
      state.baseline,
      state.projectName,
      state.nodes,
      state.edges
    ),
  }
}

export const usePipelineStore = create<PipelineState>((set, get) => ({
  ...initialState,

  getNodeID: (type) => {
    const ids = { ...get().nodeIDs }
    ids[type] = (ids[type] ?? 0) + 1
    set({ nodeIDs: ids })
    return `${type}-${ids[type]}`
  },

  addNode: (node) => {
    const next = { ...get(), nodes: [...get().nodes, node] }
    set({ nodes: next.nodes, ...withDirty(next) })
  },

  onNodesChange: (changes) => {
    const nodes = applyNodeChanges(changes, get().nodes)
    const next = { ...get(), nodes }
    set({ nodes, ...withDirty(next) })
  },

  onEdgesChange: (changes) => {
    const edges = applyEdgeChanges(changes, get().edges)
    const next = { ...get(), edges }
    set({ edges, ...withDirty(next) })
  },

  onConnect: (connection) => {
    const edges = addEdge(
      {
        ...connection,
        ...edgeDefaults,
      },
      get().edges
    )
    const next = { ...get(), edges }
    set({ edges, ...withDirty(next) })
  },

  updateNodeField: (nodeId, fieldName, fieldValue) => {
    const nodes = get().nodes.map((node) =>
      node.id === nodeId
        ? { ...node, data: { ...node.data, [fieldName]: fieldValue } }
        : node
    )
    const next = { ...get(), nodes }
    set({ nodes, ...withDirty(next) })
  },

  setProjectName: (name) => {
    const next = { ...get(), projectName: name }
    set({ projectName: name, ...withDirty(next) })
  },

  initFromProject: ({ id, name, nodes, edges }) => {
    const nodeIDs: Record<string, number> = {}
    for (const node of nodes) {
      const match = node.id.match(/^(.+)-(\d+)$/)
      if (match) {
        const [, type, num] = match
        nodeIDs[type] = Math.max(nodeIDs[type] ?? 0, Number(num))
      }
    }
    const baseline = { name, nodes, edges: edges.map(normalizeEdge) }
    set({
      projectId: id,
      projectName: name,
      nodes,
      edges: edges.map(normalizeEdge),
      nodeIDs,
      initialized: true,
      baseline,
      isDirty: false,
    })
  },

  markClean: () => {
    const { projectName, nodes, edges } = get()
    set({
      baseline: { name: projectName, nodes, edges },
      isDirty: false,
    })
  },

  duplicateNode: (nodeId) => {
    const node = get().nodes.find((n) => n.id === nodeId)
    if (!node?.type) return

    const newNode = createNode(node.type, {
      x: node.position.x + 48,
      y: node.position.y + 48,
    })

    const copied = {
      ...newNode,
      data: {
        ...(node.data as Record<string, string>),
        id: newNode.id,
        nodeType: node.type,
      },
    }

    const next = { ...get(), nodes: [...get().nodes, copied] }
    set({ nodes: next.nodes, ...withDirty(next) })
  },

  deleteNode: (nodeId) => {
    const nodes = get().nodes.filter((n) => n.id !== nodeId)
    const edges = get().edges.filter(
      (e) => e.source !== nodeId && e.target !== nodeId
    )
    const next = { ...get(), nodes, edges }
    set({ nodes, edges, ...withDirty(next) })
  },

  deleteEdge: (edgeId) => {
    const edges = get().edges.filter((e) => e.id !== edgeId)
    const next = { ...get(), edges }
    set({ edges, ...withDirty(next) })
  },

  reset: () => set(initialState),
}))

export function createNode(type: string, position: { x: number; y: number }) {
  const store = usePipelineStore.getState()
  const nodeID = store.getNodeID(type)
  return {
    id: nodeID,
    type,
    position,
    data: defaultData(type, nodeID),
  } satisfies Node
}
