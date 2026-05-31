export type ValidationCheck = {
  title: string
  detail: string
  passed: boolean
}

export type ParseResult = {
  num_nodes: number
  num_edges: number
  is_dag: boolean
  is_pipeline_valid: boolean
  checks: ValidationCheck[]
}

export async function parsePipeline(
  nodes: unknown[],
  edges: unknown[]
): Promise<ParseResult> {
  const res = await fetch('/api/pipelines/parse', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ nodes, edges }),
  })

  if (!res.ok) {
    throw new Error(`Validation failed (${res.status})`)
  }

  return res.json()
}
