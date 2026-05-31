'use client'

import { useMutation } from '@tanstack/react-query'
import { CheckCircle2, Loader2, XCircle } from 'lucide-react'
import { useState } from 'react'
import { parsePipeline, type ValidationCheck } from '@/lib/api'
import { usePipelineStore } from '@/stores/pipeline-store'
import { AppModal } from '@/components/ui/app-modal'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

function OverviewRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium tabular-nums">{value}</span>
    </div>
  )
}

function StatusRow({
  label,
  valid,
  pending,
}: {
  label: string
  valid?: boolean
  pending?: boolean
}) {
  const Icon = valid ? CheckCircle2 : XCircle

  return (
    <div className="flex items-center justify-between py-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      {pending ? (
        <span className="text-muted-foreground">Checking…</span>
      ) : (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 font-medium',
            valid ? 'text-emerald-600' : 'text-destructive'
          )}
        >
          <Icon className="size-3.5" />
          {valid ? 'Valid' : 'Invalid'}
        </span>
      )}
    </div>
  )
}

function IssueRow({ check }: { check: ValidationCheck }) {
  return (
    <TableRow className="hover:bg-transparent">
      <TableCell className="w-8 px-3 py-2.5 align-top">
        <XCircle className="size-4 text-destructive" />
      </TableCell>
      <TableCell className="px-3 py-2.5 align-top whitespace-normal">
        <p className="font-medium text-sm">{check.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{check.detail}</p>
      </TableCell>
    </TableRow>
  )
}

export function SubmitButton() {
  const nodes = usePipelineStore((s) => s.nodes)
  const edges = usePipelineStore((s) => s.edges)
  const [open, setOpen] = useState(false)

  const mutation = useMutation({
    mutationFn: () => parsePipeline(nodes, edges),
    onSuccess: () => setOpen(true),
    onError: () => setOpen(true),
  })

  const result = mutation.data
  const backendError = mutation.isError
    ? mutation.error instanceof Error
      ? mutation.error.message
      : 'Validation request failed.'
    : undefined

  const nodeCount = result?.num_nodes ?? nodes.length
  const edgeCount = result?.num_edges ?? edges.length
  const issues = (result?.checks ?? []).filter((check) => !check.passed)

  return (
    <>
      <Button
        size="sm"
        onClick={() => mutation.mutate()}
        disabled={mutation.isPending}
      >
        {mutation.isPending ? (
          <Loader2 className="mr-1 size-4 animate-spin" />
        ) : null}
        Validate
      </Button>

      <AppModal
        open={open}
        onOpenChange={setOpen}
        title="Pipeline validation"
        className="sm:max-w-md"
      >
        <div className="space-y-5">
          <div>
            <p className="mb-2 text-section-label">Workflow overview</p>
            <div className="divide-y rounded-md border px-3">
              <OverviewRow label="Nodes" value={nodeCount} />
              <OverviewRow label="Connections" value={edgeCount} />
            </div>
          </div>

          <div>
            <p className="mb-2 text-section-label">Validation</p>
            <div className="divide-y rounded-md border px-3">
              <StatusRow
                label="DAG structure"
                valid={result?.is_dag}
                pending={mutation.isPending}
              />
              <StatusRow
                label="Pipeline readiness"
                valid={result?.is_pipeline_valid}
                pending={mutation.isPending}
              />
            </div>
          </div>

          <div>
            <p className="mb-2 text-section-label">Issues</p>
            {mutation.isPending ? (
              <p className="text-sm text-muted-foreground">Running validation…</p>
            ) : backendError ? (
              <div className="max-h-56 overflow-y-auto rounded-md border">
                <Table>
                  <TableBody>
                    <IssueRow
                      check={{
                        title: 'Backend error',
                        detail: backendError,
                        passed: false,
                      }}
                    />
                  </TableBody>
                </Table>
              </div>
            ) : issues.length === 0 ? (
              <div className="flex items-start gap-2 rounded-md border border-emerald-500/30 bg-emerald-500/10 p-3 text-sm">
                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                <div>
                  <p className="font-medium">No issues found</p>
                  <p className="text-muted-foreground">
                    The workflow is a valid DAG and ready to save.
                  </p>
                </div>
              </div>
            ) : (
              <div className="max-h-56 overflow-y-auto rounded-md border">
                <Table>
                  <TableBody>
                    {issues.map((issue) => (
                      <IssueRow key={issue.title} check={issue} />
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </div>
      </AppModal>
    </>
  )
}
