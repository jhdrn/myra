import * as myra from 'myra'
import { ComponentProps, useState, VNode } from 'myra'
import { ContextDemo } from './demos/ContextDemo'
import { Counter } from './demos/Counter'
import { Effects } from './demos/Effects'
import { ErrorBoundaryDemo } from './demos/ErrorBoundary'
import { FragmentDemo } from './demos/FragmentDemo'
import { KeyedListDemo } from './demos/KeyedList'
import { MemoDemo } from './demos/MemoDemo'
import { ReducerDemo } from './demos/ReducerDemo'
import { RefDemo } from './demos/RefDemo'
import { TimerDemo } from './demos/TimerDemo'

type DemoEntry = {
    key: string
    label: string
    description: string
    Demo: (props: ComponentProps) => VNode
}

const DEMOS: DemoEntry[] = [
    {
        key: 'counter',
        label: 'useState',
        description: 'Direct set, functional updaters, lazy initializer, batched updates',
        Demo: Counter,
    },
    {
        key: 'effects',
        label: 'useEffect / useLayoutEffect',
        description: 'Effect lifecycle, dep arrays, cleanup, synchronous DOM measurement',
        Demo: Effects,
    },
    {
        key: 'ref',
        label: 'useRef',
        description: 'DOM refs, programmatic focus, previous-value tracking',
        Demo: RefDemo,
    },
    {
        key: 'memo',
        label: 'memo / useMemo / useCallback',
        description: 'Skip re-renders with memo, memoize computations and callbacks',
        Demo: MemoDemo,
    },
    {
        key: 'reducer',
        label: 'useReducer',
        description: 'Reducer pattern with typed actions and stable dispatch',
        Demo: ReducerDemo,
    },
    {
        key: 'error',
        label: 'useErrorHandler',
        description: 'Catch errors from child components and recover gracefully',
        Demo: ErrorBoundaryDemo,
    },
    {
        key: 'keyed',
        label: 'Keyed reconciliation',
        description: 'Stable list reordering — keys preserve DOM/input identity',
        Demo: KeyedListDemo,
    },
    {
        key: 'fragment',
        label: 'Fragment / nothing',
        description: 'Render multiple siblings without a wrapper, and placeholder nodes',
        Demo: FragmentDemo,
    },
    {
        key: 'timer',
        label: 'useEffect cleanup',
        description: 'setInterval stopwatch demonstrating effect cleanup on unmount',
        Demo: TimerDemo,
    },
    {
        key: 'context',
        label: 'createContext / useContext',
        description: 'Theme switching, deep-tree propagation, and default value fallback',
        Demo: ContextDemo,
    },
]

export function App(_props: ComponentProps): myra.VNode {
    const [activeKey, setActiveKey] = useState(DEMOS[0].key)
    const active = DEMOS.find(d => d.key === activeKey) ?? DEMOS[0]
    const { Demo } = active

    return (
        <div class="pg-layout">
            <aside class="pg-sidebar">
                <div class="pg-logo">Myra Playground</div>
                <nav class="pg-nav">
                    {DEMOS.map(d => (
                        <button
                            key={d.key}
                            class={'pg-nav-item' + (d.key === activeKey ? ' active' : '')}
                            onclick={() => setActiveKey(d.key)}
                        >
                            {d.label}
                        </button>
                    ))}
                </nav>
            </aside>
            <main class="pg-main">
                <header class="pg-demo-header">
                    <h2>{active.label}</h2>
                    <p class="pg-demo-desc">{active.description}</p>
                </header>
                <div class="pg-demo-body">
                    <Demo key={activeKey} />
                </div>
            </main>
        </div>
    )
}
