'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import type { Edge, Node } from '@xyflow/react'
import type { Project } from '@/actions/projects'
import {
  createProject,
  deleteProject,
  listProjects,
  updateProject,
} from '@/actions/projects'

export const projectsQueryKey = (userId: string) => ['projects', userId] as const

export function useProjects(userId: string, placeholderData?: Project[]) {
  return useQuery({
    queryKey: projectsQueryKey(userId),
    queryFn: listProjects,
    placeholderData,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  })
}

export function useCreateProject(userId: string) {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (name: string) => createProject(name),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: projectsQueryKey(userId) })
      router.push(`/dashboard/projects/${data.id}`)
    },
  })
}

export function useUpdateProject(userId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string
      payload: { name?: string; nodes?: Node[]; edges?: Edge[] }
    }) => updateProject(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectsQueryKey(userId) })
    },
  })
}

export function useDeleteProject(userId: string) {
  const queryClient = useQueryClient()
  const router = useRouter()

  return useMutation({
    mutationFn: (id: string) => deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: projectsQueryKey(userId) })
      router.push('/dashboard')
    },
  })
}
