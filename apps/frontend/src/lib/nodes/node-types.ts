import { defineNode } from './define-node'
import { nodeConfigs } from './registry'

export const nodeTypes = Object.fromEntries(
  nodeConfigs.map((config) => [config.type, defineNode(config)])
)
