import type { Node, Edge } from '@xyflow/react'

export interface OutflowAllocation {
  targetId: string
  percentage: number // 0-100
  color: string
}

export interface FunnelNodeData {
  label: string
  currentValue: number
  minThreshold: number
  maxThreshold: number
  maxCapacity: number
  inflowRate: number
  outflowAllocations: OutflowAllocation[]
  [key: string]: unknown
}

export type FlowNode = Node<FunnelNodeData>

export interface FlowEdgeData {
  allocation: number // percentage 0-100
  color: string
  [key: string]: unknown
}

export type FlowEdge = Edge<FlowEdgeData>
