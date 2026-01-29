import type { Node, Edge } from '@xyflow/react'

export interface SourceNodeData {
  label: string
  balance: number
  flowRate: number
  [key: string]: unknown
}

export interface ThresholdNodeData {
  label: string
  minThreshold: number
  maxThreshold: number
  currentValue: number
  [key: string]: unknown
}

export interface RecipientNodeData {
  label: string
  received: number
  target: number
  [key: string]: unknown
}

export type FlowNode = Node<SourceNodeData | ThresholdNodeData | RecipientNodeData>
export type FlowEdge = Edge<{ animated?: boolean }>
