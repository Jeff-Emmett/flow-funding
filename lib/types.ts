import type { Node, Edge } from '@xyflow/react'

// Overflow allocation - funds flowing to OTHER FUNNELS when above max threshold
export interface OverflowAllocation {
  targetId: string
  percentage: number // 0-100
  color: string
}

// Spending allocation - funds flowing DOWN to OUTCOMES/OUTPUTS
export interface SpendingAllocation {
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
  // Overflow goes SIDEWAYS to other funnels
  overflowAllocations: OverflowAllocation[]
  // Spending goes DOWN to outcomes/outputs
  spendingAllocations: SpendingAllocation[]
  [key: string]: unknown
}

export interface OutcomeNodeData {
  label: string
  description?: string
  fundingReceived: number
  fundingTarget: number
  status: 'not-started' | 'in-progress' | 'completed' | 'blocked'
  [key: string]: unknown
}

export type FlowNode = Node<FunnelNodeData | OutcomeNodeData>

export interface FlowEdgeData {
  allocation: number // percentage 0-100
  color: string
  edgeType: 'overflow' | 'spending' // overflow = sideways, spending = downward
  [key: string]: unknown
}

export type FlowEdge = Edge<FlowEdgeData>
