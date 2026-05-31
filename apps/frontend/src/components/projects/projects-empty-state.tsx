'use client'

import { FolderKanban } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ProjectsEmptyStateProps = {
  variant: 'empty' | 'no-results'
  onClearSearch?: () => void
  onCreateClick?: () => void
}

export function ProjectsEmptyState({
  variant,
  onClearSearch,
  onCreateClick,
}: ProjectsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed bg-muted/20 px-6 py-20 text-center">
      <div className="mb-4 flex size-12 items-center justify-center rounded-full bg-muted">
        <FolderKanban className="size-6 text-muted-foreground" />
      </div>
      <h3 className="text-base font-medium">
        {variant === 'empty' ? 'No projects yet' : 'No matching projects'}
      </h3>
      <p className="mt-1 max-w-sm text-page-subtitle">
        {variant === 'empty'
          ? 'Create your first workflow'
          : 'Try a different search term or clear the filter.'}
      </p>
      {variant === 'empty' && onCreateClick ? (
        <Button className="mt-6" onClick={onCreateClick}>
          Create project
        </Button>
      ) : null}
      {variant === 'no-results' && onClearSearch ? (
        <Button variant="link" className="mt-4" onClick={onClearSearch}>
          Clear search
        </Button>
      ) : null}
    </div>
  )
}
