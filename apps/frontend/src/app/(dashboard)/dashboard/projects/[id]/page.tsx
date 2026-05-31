import { notFound } from 'next/navigation'
import type { Edge, Node } from '@xyflow/react'
import { getProject } from '@/actions/projects'
import { PipelineCanvas } from '@/components/pipeline/canvas'
import { EditorToolbar } from '@/components/pipeline/editor-toolbar'
import { NodePalette } from '@/components/pipeline/node-palette'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function ProjectCanvasPage({ params }: PageProps) {
  const { id } = await params
  const project = await getProject(id)
  if (!project) notFound()

  return (
    <>
      <EditorToolbar
        userId={project.user_id}
        projectId={project.id}
        fallbackName={project.name}
      />
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <aside className="hidden w-48 shrink-0 border-r md:flex md:flex-col">
          <NodePalette />
        </aside>
        <main className="min-w-0 flex-1">
          <PipelineCanvas
            projectId={project.id}
            initialName={project.name}
            initialNodes={(project.nodes ?? []) as Node[]}
            initialEdges={(project.edges ?? []) as Edge[]}
          />
        </main>
      </div>
    </>
  )
}
