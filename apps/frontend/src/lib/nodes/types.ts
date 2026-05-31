import type { LucideIcon } from 'lucide-react'

export type NodeCategory = 'input' | 'transform' | 'output'

export type FieldType = 'text' | 'textarea' | 'select'

export type FieldConfig = {
  name: string
  label: string
  type: FieldType
  placeholder?: string
  defaultValue?: string
  options?: { label: string; value: string }[]
}

export type HandleConfig = {
  id: string
  label?: string
}

export type NodeConfig = {
  type: string
  label: string
  category: NodeCategory
  description?: string
  icon?: LucideIcon
  fields?: FieldConfig[]
  inputs?: HandleConfig[]
  outputs?: HandleConfig[]
  dynamicInputs?: 'variables'
}

export const CATEGORY_ICON: Record<NodeCategory, string> = {
  input: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 ring-blue-500/20',
  transform: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 ring-amber-500/20',
  output: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20',
}

export const CATEGORY_BADGE: Record<NodeCategory, string> = {
  input: 'border-blue-500/20 bg-blue-500/10 text-blue-700 dark:text-blue-300',
  transform: 'border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300',
  output: 'border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300',
}
