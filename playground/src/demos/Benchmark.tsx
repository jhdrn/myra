import * as myra from 'myra'
import { useState, ComponentProps } from 'myra'

// ── Utilities ─────────────────────────────────────────────────────────────────

const tick = () => new Promise<void>(r => setTimeout(r))

function mkEl(): HTMLElement {
    const el = document.createElement('div')
    el.style.cssText = 'position:absolute;top:-9999px;left:-9999px;visibility:hidden'
    document.body.appendChild(el)
    return el
}

function shuffle(arr: number[]): number[] {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

// ── Types ─────────────────────────────────────────────────────────────────────

type Stats = { mean: number; min: number; max: number; ops: number; iters: number }
type BenchStatus = 'idle' | 'running' | 'done'

type Spec = {
    id: string
    label: string
    desc: string
    iters: number
    /** Called once before iterations; returns per-iteration fn and teardown. */
    prepare: () => Promise<{ iter: () => Promise<void>; cleanup: () => void }>
}

// ── Runner ────────────────────────────────────────────────────────────────────

async function runSpec(spec: Spec): Promise<Stats> {
    const { iter, cleanup } = await spec.prepare()
    const times: number[] = []
    for (let i = 0; i < spec.iters; i++) {
        const t0 = performance.now()
        await iter()
        times.push(performance.now() - t0)
    }
    cleanup()
    const mean = times.reduce((a, b) => a + b, 0) / times.length
    return { mean, min: Math.min(...times), max: Math.max(...times), ops: 1000 / mean, iters: spec.iters }
}

// ── Shared components (stable references) ────────────────────────────────────

function Deep({ d }: { d: number }): myra.VNode {
    return d <= 0 ? <span>leaf</span> : <div><Deep d={d - 1} /></div>
}

// ── Benchmark specs ───────────────────────────────────────────────────────────

const SPECS: Spec[] = [
    {
        id: 'mount-list',
        label: 'Mount 1 000-item keyed list',
        desc: 'Cold mount — creates a fresh container each iteration, mounts 1 000 keyed <li> nodes, awaits one tick. Tests the full initial-render + DOM creation path.',
        iters: 30,
        prepare: async () => ({
            iter: async () => {
                const el = mkEl()
                myra.mount(
                    <ul>{Array.from({ length: 1000 }, (_, i) => <li key={i}>{i}</li>)}</ul>,
                    el,
                )
                await tick()
                document.body.removeChild(el)
            },
            cleanup: () => { /* nothing */ },
        }),
    },
    {
        id: 'mount-deep',
        label: 'Mount deep component tree (depth 50)',
        desc: 'Cold mount — 50 levels of nested function components. Tests recursive render, renderingContext hook plumbing, and per-component RenderNode allocation.',
        iters: 100,
        prepare: async () => ({
            iter: async () => {
                const el = mkEl()
                myra.mount(<Deep d={50} />, el)
                await tick()
                document.body.removeChild(el)
            },
            cleanup: () => { /* nothing */ },
        }),
    },
    {
        id: 'state-update',
        label: 'State update + re-render',
        desc: 'Hot path — mounts a counter component once, then times each useState setter call + re-render tick. Measures debounceRender scheduling overhead.',
        iters: 200,
        prepare: async () => {
            let setter!: (f: (n: number) => number) => void
            function Ctr(): myra.VNode {
                const [n, set] = useState(0)
                setter = set
                return <span>{n}</span>
            }
            const el = mkEl()
            myra.mount(<Ctr />, el)
            await tick()
            return {
                iter: async () => { setter(n => n + 1); await tick() },
                cleanup: () => document.body.removeChild(el),
            }
        },
    },
    {
        id: 'keyed-shuffle',
        label: 'Keyed shuffle (100 items)',
        desc: 'Hot path — mounts a 100-item keyed list once, then shuffles and re-renders each iteration. Tests keyMap reconciliation and DOM move operations.',
        iters: 150,
        prepare: async () => {
            let setter!: (f: (a: number[]) => number[]) => void
            function List(): myra.VNode {
                const [items, set] = useState(() => Array.from({ length: 100 }, (_, i) => i))
                setter = set
                return <ul>{items.map(i => <li key={i}>{i}</li>)}</ul>
            }
            const el = mkEl()
            myra.mount(<List />, el)
            await tick()
            return {
                iter: async () => { setter(shuffle); await tick() },
                cleanup: () => document.body.removeChild(el),
            }
        },
    },
    // ── Multi-component simultaneous updates ────────────────────────────────
    // The queued render pays overhead on N=1 but saves (N-1) macrotask
    // round-trips when many components update in the same tick.
    ...([5, 20, 50] as const).map(n => ({
        id: `siblings-${n}`,
        label: `${n} siblings setState in same tick`,
        desc: `Mounts ${n} sibling components, then fires all ${n} setState calls synchronously per iteration. With a per-component setTimeout each call schedules a separate macrotask; the shared queue collapses them into one flush.`,
        iters: 150,
        prepare: async (): Promise<{ iter: () => Promise<void>; cleanup: () => void }> => {
            const setters: Array<(f: (v: number) => number) => void> = []
            function Sib({ idx }: { idx: number }): myra.VNode {
                const [v, set] = useState(0)
                setters[idx] = set
                return <span>{v}</span>
            }
            function SibRoot(): myra.VNode {
                return <div>{Array.from({ length: n }, (_, i) => <Sib key={i} idx={i} />)}</div>
            }
            const el = mkEl()
            myra.mount(<SibRoot />, el)
            await tick()
            return {
                iter: async () => { for (const set of setters) set(v => v + 1); await tick() },
                cleanup: () => document.body.removeChild(el),
            }
        },
    })),
    ...([5, 20, 50] as const).map(n => ({
        id: `ctx-fanout-${n}`,
        label: `Context fan-out: ${n} consumers`,
        desc: `One Provider value change triggers ${n} consumer re-renders via subscription callbacks. All land in the shared queue and flush in one macrotask instead of ${n} separate ones.`,
        iters: 100,
        prepare: async (): Promise<{ iter: () => Promise<void>; cleanup: () => void }> => {
            let setVal!: (f: (v: number) => number) => void
            const Ctx = myra.createContext(0)
            function CtxConsumer(): myra.VNode {
                return <span>{myra.useContext(Ctx)}</span>
            }
            function CtxProvider(): myra.VNode {
                const [v, set] = useState(0)
                setVal = set
                return (
                    <Ctx.Provider value={v}>
                        {Array.from({ length: n }, (_, i) => <CtxConsumer key={i} />)}
                    </Ctx.Provider>
                )
            }
            const el = mkEl()
            myra.mount(<CtxProvider />, el)
            await tick()
            await tick() // settle initial context subscriptions
            return {
                iter: async () => { setVal(v => v + 1); await tick(); await tick() },
                cleanup: () => document.body.removeChild(el),
            }
        },
    })),
]

// ── UI components ─────────────────────────────────────────────────────────────

const fmt = (ms: number) => ms.toFixed(2)
const fmtOps = (n: number) => Math.round(n).toLocaleString()

function StatsRow({ stats }: { stats: Stats }): myra.VNode {
    return (
        <table style="width:100%;border-collapse:collapse;margin-top:.75rem;font-size:.85rem">
            <thead>
                <tr style="border-bottom:1px solid var(--border)">
                    {(['mean', 'min', 'max', 'ops/sec'] as const).map(h => (
                        <th key={h} style="text-align:left;padding:.25rem .5rem;color:var(--text-muted);font-weight:500">{h}</th>
                    ))}
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td style="padding:.25rem .5rem;font-variant-numeric:tabular-nums">{fmt(stats.mean)} ms</td>
                    <td style="padding:.25rem .5rem;font-variant-numeric:tabular-nums">{fmt(stats.min)} ms</td>
                    <td style="padding:.25rem .5rem;font-variant-numeric:tabular-nums">{fmt(stats.max)} ms</td>
                    <td style="padding:.25rem .5rem;font-variant-numeric:tabular-nums">{fmtOps(stats.ops)}</td>
                </tr>
            </tbody>
        </table>
    )
}

function BenchCard({ spec, status, stats, onRun }: {
    spec: Spec
    status: BenchStatus
    stats: Stats | null
    onRun: () => void
}): myra.VNode {
    return (
        <div class="demo-card">
            <h3>{spec.label}</h3>
            <p style="color:var(--text-muted);font-size:.9rem">{spec.desc}</p>
            <div class="btn-row" style="margin-top:.75rem">
                <button onclick={onRun} disabled={status === 'running'}>
                    {status === 'running' ? `Running… (${spec.iters} iters)` : 'Run'}
                </button>
                {stats !== null && (
                    <span class="badge" style="background:var(--success)">{spec.iters} iterations</span>
                )}
            </div>
            {stats !== null && <StatsRow stats={stats} />}
            <p style="margin-top:.5rem;font-size:.8rem;color:var(--text-muted)">
                Note: each iteration includes one <code>setTimeout</code> tick — times reflect wall-clock render latency, not pure CPU cost.
            </p>
        </div>
    )
}

// ── Main demo ─────────────────────────────────────────────────────────────────

export function BenchmarkDemo(_props: ComponentProps): myra.VNode {
    const [statuses, setStatuses] = useState<Record<string, BenchStatus>>(
        () => Object.fromEntries(SPECS.map(s => [s.id, 'idle'])),
    )
    const [results, setResults] = useState<Record<string, Stats | null>>(
        () => Object.fromEntries(SPECS.map(s => [s.id, null])),
    )

    async function runOne(spec: Spec) {
        setStatuses(s => ({ ...s, [spec.id]: 'running' }))
        const stats = await runSpec(spec)
        setResults(r => ({ ...r, [spec.id]: stats }))
        setStatuses(s => ({ ...s, [spec.id]: 'done' }))
    }

    async function runAll() {
        for (const spec of SPECS) {
            await runOne(spec)
        }
    }

    const anyRunning = Object.values(statuses).some(s => s === 'running')

    return (
        <div class="demo-grid">
            <div class="demo-card" style="grid-column: 1 / -1">
                <h3>Performance benchmarks</h3>
                <p>
                    Runs in real Chrome — measures wall-clock time (ms) for each operation.
                    "Hot path" benchmarks mount once during setup; only the update is timed.
                    Open DevTools → Performance to profile individual runs.
                </p>
                <div class="btn-row" style="margin-top:.75rem">
                    <button onclick={runAll} disabled={anyRunning}>Run all</button>
                </div>
            </div>
            {SPECS.map(spec => (
                <BenchCard
                    key={spec.id}
                    spec={spec}
                    status={statuses[spec.id]}
                    stats={results[spec.id]}
                    onRun={() => runOne(spec)}
                />
            ))}
        </div>
    )
}
