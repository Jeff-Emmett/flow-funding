# Flow Funding Visual Interface Design

## Core Concept: Threshold-Based Flow Funding (TBFF)

Unlike traditional discrete grants, TBFF enables **continuous resource flows** that respond dynamically to threshold conditions. The funnel visualization makes these dynamics intuitive and interactive.

---

## The Funnel Metaphor

The funding funnel has three distinct zones defined by minimum and maximum thresholds:

```
                    ════════════════════════
                    │                      │   OVERFLOW ZONE
                    │   Excess funds       │   (above MAX)
                    │   redistribute       │
    MAX ─ ─ ─ ─ ─ ─ ┼──────────────────────┼ ─ ─ ─ ─ ─ ─
                    │                      │
                    │   HEALTHY ZONE       │   STRAIGHT WALLS
                    │   Normal operations  │   (MIN to MAX)
                    │                      │
    MIN ─ ─ ─ ─ ─ ─ ┼──────────────────────┼ ─ ─ ─ ─ ─ ─
                     ╲                    ╱
                      ╲  CRITICAL ZONE   ╱    NARROWING FUNNEL
                       ╲ Restricted     ╱     (below MIN)
                        ╲  outflow    ╱
                         ╲          ╱
                          ╲________╱
                             ║║
                           outflow
```

### Zone Behaviors

| Zone | Shape | Behavior |
|------|-------|----------|
| **Overflow** (above MAX) | Straight walls | Excess funds spill over, can redirect to other pools |
| **Healthy** (MIN to MAX) | Straight walls | Normal flow rate, balanced operations |
| **Critical** (below MIN) | Narrowing funnel | Outflow restricted, conservation mode |

---

## Visual Elements

### Animated Flows

**Inflow (blue particles)**
- Drops falling from above into the funnel
- Speed/density indicates inflow rate
- Particles merge into the liquid surface

**Outflow (pink particles)**
- Drops falling from the bottom spout
- Throttled in critical zone (fewer/slower)
- Full rate in healthy zone

**Liquid Fill**
- Gradient fill showing current balance level
- Subtle glow/pulse animation
- Wave effect at surface

### Threshold Indicators

**Minimum Threshold (Rose/Red)**
```
════════════╳════════════  ← Draggable handle
     MIN $20,000
```

**Maximum Threshold (Amber/Yellow)**
```
════════════╳════════════  ← Draggable handle
     MAX $80,000
```

### Status Panel

```
┌─────────────────────────────┐
│  Current Balance            │
│  ████████████████░░░░░░░░   │
│  $45,000                    │
│  ● Healthy Range            │
├─────────────────────────────┤
│  Flow Rates                 │
│  ↓ Inflow:   +$500/hr       │
│  ↑ Outflow:  -$300/hr       │
│  ═ Net:      +$200/hr       │
├─────────────────────────────┤
│  Progress                   │
│  To MIN: ████████░░ 80%     │
│  To MAX: ██████░░░░ 60%     │
└─────────────────────────────┘
```

---

## Interaction Design

### Dragging Thresholds

1. **Hover** over threshold line → cursor changes to resize
2. **Click & drag** up/down to adjust value
3. **Real-time preview** of zone changes
4. **Constraints**: MIN cannot exceed MAX, minimum gap enforced

### Visual Feedback During Drag

```
Before drag:        During drag:         After release:
════════════        ════════════════     ════════════
     │                    ║ (thicker)         │
     │                    ║                   │
     │              New value shown           │
```

### Responsive Behaviors

| Balance State | Visual Response |
|---------------|-----------------|
| Approaching MIN | Rose tint intensifies, warning pulse |
| Crossing MIN ↓ | Funnel narrows animation, outflow slows |
| Crossing MIN ↑ | Funnel widens animation, outflow normalizes |
| Approaching MAX | Amber tint at top, overflow warning |
| Crossing MAX ↑ | Overflow particles, excess redistribution |

---

## Color System

| Element | Color | Hex | Usage |
|---------|-------|-----|-------|
| Inflow | Blue | `#3B82F6` | Incoming fund particles |
| Outflow | Pink | `#EC4899` | Outgoing fund particles |
| Fill Gradient | Blue→Purple→Pink | gradient | Liquid level |
| Critical Zone | Rose | `#F43F5E` | Below minimum |
| Healthy Zone | Emerald | `#10B981` | Normal range |
| Overflow Zone | Amber | `#F59E0B` | Above maximum |
| Background | Slate | `#0F172A` | Canvas |

---

## Multi-Funnel View

When displaying multiple funding pools:

```
┌─────────────────────────────────────────────────────────────────┐
│  Threshold-Based Flow Funding                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│   ╔═══════╗        ╔═══════╗        ╔═══════╗                  │
│   ║       ║        ║▓▓▓▓▓▓▓║        ║███████║                  │
│   ║       ║        ║▓▓▓▓▓▓▓║        ║███████║                  │
│   ║░░░░░░░║        ║▓▓▓▓▓▓▓║        ║███████║                  │
│   ║░░░░░░░║        ╚═══╤═══╝        ╚═══╤═══╝                  │
│   ╚═══╤═══╝            │                │                      │
│       │                │                │                      │
│   Public Goods     Research         Emergency                  │
│   $12K / $30K      $45K / $60K      $85K / $70K               │
│   ● Critical       ● Healthy        ● Overflow                 │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Interconnected Flows

Future enhancement: Connect funnels so overflow from one feeds into another:

```
   Fund A                    Fund B
   ╔═════╗                   ╔═════╗
   ║█████║ ═══overflow═══▶   ║░░░░░║
   ║█████║                   ║░░░░░║
   ╚══╤══╝                   ╚══╤══╝
```

---

## Technical Implementation

### Component Architecture

```
<FundingFunnel>
├── <SVG Canvas>
│   ├── Zone backgrounds (overflow, healthy, critical)
│   ├── Funnel outline path
│   ├── Liquid fill path (animated)
│   ├── Inflow particles (animated)
│   ├── Outflow particles (animated)
│   ├── Threshold lines (draggable)
│   └── Balance indicator
└── <Stats Panel>
    ├── Current balance display
    ├── Flow rates
    └── Progress bars
```

### State Management

```typescript
interface FunnelState {
  balance: number           // Current fund level
  minThreshold: number      // Minimum threshold (draggable)
  maxThreshold: number      // Maximum threshold (draggable)
  inflowRate: number        // Funds per hour coming in
  outflowRate: number       // Funds per hour going out
  maxCapacity: number       // Visual ceiling
}
```

### Animation Loop

```typescript
// Simulation runs at 10Hz
setInterval(() => {
  const netFlow = (inflowRate - outflowRate) / 3600  // per second
  balance = clamp(balance + netFlow, 0, maxCapacity * 1.2)
}, 100)
```

---

## Future Enhancements

1. **Cascading Thresholds** — When one fund overflows, automatically route to connected funds
2. **Historical Playback** — Scrub through time to see past flow dynamics
3. **Prediction Mode** — Project future states based on current rates
4. **Smart Routing** — AI-suggested threshold adjustments for optimal distribution
5. **Real Data Integration** — Connect to actual treasury/DAO data sources
6. **Export/Share** — Save configurations and share visualizations
