'use client'

import { useCallback, useState, useEffect } from 'react'
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  Panel,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import SourceNode from './nodes/SourceNode'
import ThresholdNode from './nodes/ThresholdNode'
import RecipientNode from './nodes/RecipientNode'
import type { FlowNode, FlowEdge, SourceNodeData, ThresholdNodeData, RecipientNodeData } from '@/lib/types'

const nodeTypes = {
  source: SourceNode,
  threshold: ThresholdNode,
  recipient: RecipientNode,
}

const initialNodes: FlowNode[] = [
  {
    id: 'source-1',
    type: 'source',
    position: { x: 50, y: 150 },
    data: {
      label: 'Treasury',
      balance: 75000,
      flowRate: 500,
    },
  },
  {
    id: 'threshold-1',
    type: 'threshold',
    position: { x: 350, y: 50 },
    data: {
      label: 'Public Goods Gate',
      minThreshold: 10000,
      maxThreshold: 50000,
      currentValue: 32000,
    },
  },
  {
    id: 'threshold-2',
    type: 'threshold',
    position: { x: 350, y: 350 },
    data: {
      label: 'Research Gate',
      minThreshold: 5000,
      maxThreshold: 30000,
      currentValue: 8500,
    },
  },
  {
    id: 'recipient-1',
    type: 'recipient',
    position: { x: 700, y: 50 },
    data: {
      label: 'Project Alpha',
      received: 24500,
      target: 30000,
    },
  },
  {
    id: 'recipient-2',
    type: 'recipient',
    position: { x: 700, y: 250 },
    data: {
      label: 'Project Beta',
      received: 8000,
      target: 25000,
    },
  },
  {
    id: 'recipient-3',
    type: 'recipient',
    position: { x: 700, y: 450 },
    data: {
      label: 'Research Fund',
      received: 15000,
      target: 15000,
    },
  },
]

const initialEdges: FlowEdge[] = [
  {
    id: 'e1',
    source: 'source-1',
    target: 'threshold-1',
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
  },
  {
    id: 'e2',
    source: 'source-1',
    target: 'threshold-2',
    animated: true,
    style: { stroke: '#3b82f6', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' },
  },
  {
    id: 'e3',
    source: 'threshold-1',
    target: 'recipient-1',
    animated: true,
    style: { stroke: '#a855f7', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' },
  },
  {
    id: 'e4',
    source: 'threshold-1',
    target: 'recipient-2',
    animated: true,
    style: { stroke: '#a855f7', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' },
  },
  {
    id: 'e5',
    source: 'threshold-2',
    target: 'recipient-3',
    animated: true,
    style: { stroke: '#a855f7', strokeWidth: 2 },
    markerEnd: { type: MarkerType.ArrowClosed, color: '#a855f7' },
  },
]

export default function FlowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [isSimulating, setIsSimulating] = useState(true)

  const onConnect = useCallback(
    (params: Connection) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            animated: true,
            style: { stroke: '#64748b', strokeWidth: 2 },
            markerEnd: { type: MarkerType.ArrowClosed, color: '#64748b' },
          },
          eds
        )
      ),
    [setEdges]
  )

  // Simulation effect
  useEffect(() => {
    if (!isSimulating) return

    const interval = setInterval(() => {
      setNodes((nds) =>
        nds.map((node) => {
          if (node.type === 'source') {
            const data = node.data as SourceNodeData
            return {
              ...node,
              data: {
                ...data,
                balance: Math.max(0, data.balance - data.flowRate / 3600),
              },
            }
          }
          if (node.type === 'threshold') {
            const data = node.data as ThresholdNodeData
            const change = (Math.random() - 0.3) * 100
            return {
              ...node,
              data: {
                ...data,
                currentValue: Math.max(0, Math.min(100000, data.currentValue + change)),
              },
            }
          }
          if (node.type === 'recipient') {
            const data = node.data as RecipientNodeData
            if (data.received < data.target) {
              return {
                ...node,
                data: {
                  ...data,
                  received: Math.min(data.target, data.received + Math.random() * 50),
                },
              }
            }
          }
          return node
        })
      )
    }, 1000)

    return () => clearInterval(interval)
  }, [isSimulating, setNodes])

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        className="bg-slate-50"
        defaultEdgeOptions={{
          animated: true,
          style: { strokeWidth: 2 },
        }}
      >
        <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="#e2e8f0" />
        <Controls className="bg-white border border-slate-200 rounded-lg shadow-sm" />

        {/* Top Panel - Title and Controls */}
        <Panel position="top-left" className="bg-white rounded-lg shadow-lg border border-slate-200 p-4 m-4">
          <h1 className="text-xl font-bold text-slate-800">Threshold-Based Flow Funding</h1>
          <p className="text-sm text-slate-500 mt-1">Drag nodes to rearrange • Connect nodes to create flows</p>
        </Panel>

        {/* Simulation Toggle */}
        <Panel position="top-right" className="m-4">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`px-4 py-2 rounded-lg font-medium shadow-sm transition-all ${
              isSimulating
                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
            }`}
          >
            {isSimulating ? '⏸ Pause' : '▶ Start'} Simulation
          </button>
        </Panel>

        {/* Legend */}
        <Panel position="bottom-left" className="bg-white rounded-lg shadow-lg border border-slate-200 p-4 m-4">
          <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-3">Node Types</div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-r from-blue-500 to-blue-600" />
              <span className="text-sm text-slate-600">Source (Funding Origin)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-r from-purple-500 to-purple-600" />
              <span className="text-sm text-slate-600">Threshold Gate (Min/Max)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-r from-emerald-500 to-emerald-600" />
              <span className="text-sm text-slate-600">Recipient (Funded)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-gradient-to-r from-slate-500 to-slate-600" />
              <span className="text-sm text-slate-600">Recipient (Pending)</span>
            </div>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  )
}
