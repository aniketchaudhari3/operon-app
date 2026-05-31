import {
  ArrowDownToLine,
  ArrowUpFromLine,
  Filter,
  GitBranch,
  GitMerge,
  Globe,
  StickyNote,
  Type,
} from 'lucide-react'
import type { NodeConfig } from '../types'

export const inputNode: NodeConfig = {
  type: 'customInput',
  label: 'Input',
  category: 'input',
  icon: ArrowDownToLine,
  description: 'Pipeline entry point',
  fields: [
    {
      name: 'inputName',
      label: 'Name',
      type: 'text',
      defaultValue: 'input_',
    },
    {
      name: 'inputType',
      label: 'Type',
      type: 'select',
      defaultValue: 'Text',
      options: [
        { label: 'Text', value: 'Text' },
        { label: 'File', value: 'File' },
      ],
    },
  ],
  outputs: [{ id: 'value', label: 'Value' }],
}

export const outputNode: NodeConfig = {
  type: 'customOutput',
  label: 'Output',
  category: 'output',
  icon: ArrowUpFromLine,
  description: 'Pipeline result',
  fields: [
    {
      name: 'outputName',
      label: 'Name',
      type: 'text',
      defaultValue: 'output_',
    },
    {
      name: 'outputType',
      label: 'Type',
      type: 'select',
      defaultValue: 'Text',
      options: [
        { label: 'Text', value: 'Text' },
        { label: 'Image', value: 'Image' },
      ],
    },
  ],
  inputs: [{ id: 'value', label: 'Value' }],
}

export const textNode: NodeConfig = {
  type: 'text',
  label: 'Text',
  category: 'transform',
  icon: Type,
  description: 'Template with {{variables}}',
  fields: [
    {
      name: 'text',
      label: 'Text',
      type: 'textarea',
      defaultValue: '{{input}}',
    },
  ],
  dynamicInputs: 'variables',
  outputs: [{ id: 'output', label: 'Output' }],
}

export const filterNode: NodeConfig = {
  type: 'filter',
  label: 'Filter',
  category: 'transform',
  icon: Filter,
  description: 'Filter items by condition',
  fields: [
    {
      name: 'condition',
      label: 'Condition',
      type: 'text',
      placeholder: 'item > 0',
      defaultValue: '',
    },
  ],
  inputs: [{ id: 'input', label: 'Input' }],
  outputs: [{ id: 'output', label: 'Output' }],
}

export const mergeNode: NodeConfig = {
  type: 'merge',
  label: 'Merge',
  category: 'transform',
  icon: GitMerge,
  description: 'Combine two streams',
  inputs: [
    { id: 'a', label: 'A' },
    { id: 'b', label: 'B' },
  ],
  outputs: [{ id: 'output', label: 'Merged' }],
}

export const httpNode: NodeConfig = {
  type: 'http',
  label: 'HTTP',
  category: 'transform',
  icon: Globe,
  description: 'HTTP request node',
  fields: [
    {
      name: 'url',
      label: 'URL',
      type: 'text',
      placeholder: 'https://api.example.com',
      defaultValue: '',
    },
    {
      name: 'method',
      label: 'Method',
      type: 'select',
      defaultValue: 'GET',
      options: [
        { label: 'GET', value: 'GET' },
        { label: 'POST', value: 'POST' },
        { label: 'PUT', value: 'PUT' },
      ],
    },
  ],
  inputs: [{ id: 'body', label: 'Body' }],
  outputs: [{ id: 'response', label: 'Response' }],
}

export const conditionalNode: NodeConfig = {
  type: 'conditional',
  label: 'Conditional',
  category: 'transform',
  icon: GitBranch,
  description: 'Branch on condition',
  fields: [
    {
      name: 'expression',
      label: 'Expression',
      type: 'text',
      placeholder: 'value === true',
      defaultValue: '',
    },
  ],
  inputs: [{ id: 'input', label: 'Input' }],
  outputs: [
    { id: 'true', label: 'True' },
    { id: 'false', label: 'False' },
  ],
}

export const noteNode: NodeConfig = {
  type: 'note',
  label: 'Note',
  category: 'transform',
  icon: StickyNote,
  description: 'Documentation sticky note',
  fields: [
    {
      name: 'content',
      label: 'Note',
      type: 'textarea',
      placeholder: 'Add a note…',
      defaultValue: '',
    },
  ],
}
