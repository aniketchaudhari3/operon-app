import {
  conditionalNode,
  filterNode,
  httpNode,
  inputNode,
  mergeNode,
  noteNode,
  outputNode,
  textNode,
} from './configs'
import type { NodeConfig } from './types'

export const nodeConfigs: NodeConfig[] = [
  inputNode,
  textNode,
  filterNode,
  mergeNode,
  httpNode,
  conditionalNode,
  outputNode,
  noteNode,
]

export const nodeConfigMap = Object.fromEntries(
  nodeConfigs.map((config) => [config.type, config])
) as Record<string, NodeConfig>

export const paletteGroups = {
  input: nodeConfigs.filter((n) => n.category === 'input'),
  transform: nodeConfigs.filter((n) => n.category === 'transform'),
  output: nodeConfigs.filter((n) => n.category === 'output'),
}

export type PaletteGroup = keyof typeof paletteGroups
