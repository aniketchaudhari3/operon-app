'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { Edge, Node } from '@xyflow/react'

export type Project = {
  id: string
  user_id: string
  name: string
  nodes: Node[]
  edges: Edge[]
  updated_at: string
}

export async function listProjects(): Promise<Project[]> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })

  if (error) throw new Error(error.message)
  return (data ?? []) as Project[]
}

export async function getProject(id: string): Promise<Project | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data as Project | null
}

export async function createProject(name: string) {
  const trimmed = name.trim()
  if (!trimmed) throw new Error('Project name is required')

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('projects')
    .insert({ name: trimmed, user_id: user.id, nodes: [], edges: [] })
    .select('id')
    .single()

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
  return { id: data.id as string }
}

export async function updateProject(
  id: string,
  payload: { name?: string; nodes?: Node[]; edges?: Edge[] }
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from('projects')
    .update({ ...payload, updated_at: new Date().toISOString() })
    .eq('id', id)

  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
  revalidatePath(`/dashboard/projects/${id}`)
}

export async function deleteProject(id: string) {
  const supabase = await createClient()
  const { error } = await supabase.from('projects').delete().eq('id', id)
  if (error) throw new Error(error.message)
  revalidatePath('/dashboard')
}
