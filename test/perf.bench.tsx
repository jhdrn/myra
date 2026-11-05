import { bench } from 'vitest'
import * as myra from '../src/myra'
import { useState } from '../src/myra'

const tick = () => new Promise<void>(resolve => setTimeout(resolve))

function mkContainer(): HTMLElement {
    const el = document.createElement('div')
    document.body.appendChild(el)
    return el
}

/**
 * Registers a benchmark that runs against a mounted view.
 *
 * Vitest's bench runner ignores describe-level hooks (beforeAll/afterAll), so
 * the view is mounted through tinybench's `setup`/`teardown` options instead.
 * These run around both the warmup and the measured phase, so each phase gets
 * a freshly mounted view. `check` runs after mounting to assert the setup
 * actually took effect, and `throws: true` makes any error fail the run
 * instead of silently producing no result.
 */
function mountedBench(
    name: string,
    view: () => myra.VNode,
    fn: () => Promise<void>,
    { settleTicks = 1, check }: { settleTicks?: number, check?: () => void } = {},
) {
    let el: HTMLElement | undefined
    bench(name, fn, {
        throws: true,
        async setup() {
            el = mkContainer()
            myra.mount(view(), el)
            for (let i = 0; i < settleTicks; i++) {
                await tick()
            }
            check?.()
        },
        teardown() {
            if (el !== undefined) {
                document.body.removeChild(el)
                el = undefined
            }
        },
    })
}

// ── Mount benchmarks ──────────────────────────────────────────────────────────

bench('mount: 1 000-item keyed list', async () => {
    const el = mkContainer()
    myra.mount(
        <ul>{Array.from({ length: 1000 }, (_, i) => <li key={i}>{i}</li>)}</ul>,
        el,
    )
    await tick()
    document.body.removeChild(el)
}, { throws: true })

bench('mount: 1 000-item unkeyed list', async () => {
    const el = mkContainer()
    myra.mount(
        <ul>{Array.from({ length: 1000 }, (_, i) => <li>{i}</li>)}</ul>,
        el,
    )
    await tick()
    document.body.removeChild(el)
}, { throws: true })

// Module-level so the function reference is stable across iterations
function Deep({ d }: { d: number }): myra.VNode {
    return d <= 0 ? <span>leaf</span> : <div><Deep d={d - 1} /></div>
}

bench('mount: deep component tree (depth 50)', async () => {
    const el = mkContainer()
    myra.mount(<Deep d={50} />, el)
    await tick()
    document.body.removeChild(el)
}, { throws: true })

// ── Update benchmarks ─────────────────────────────────────────────────────────
// Component is mounted in setup; each iteration triggers a single state update.

let setCount: ((f: (n: number) => number) => void) | undefined

function Counter(): myra.VNode {
    const [n, set] = useState(0)
    setCount = set
    return <span>{n}</span>
}

mountedBench('state update + re-render', () => <Counter />, async () => {
    setCount!(n => n + 1)
    await tick()
}, {
    check: () => {
        if (setCount === undefined) throw new Error('Counter did not mount')
    },
})

// ── Simultaneous multi-component updates ──────────────────────────────────────
// These benchmarks reveal the queue's advantage over per-component setTimeouts.
// For N=1 the queue adds small overhead (array push + splice). For larger N it
// saves (N-1) macrotask round-trips, which is the point of the shared queue.

for (const n of [5, 20, 50]) {
    const setters: Array<(f: (v: number) => number) => void> = []

    function Sibling({ idx }: { idx: number }): myra.VNode {
        const [v, set] = useState(0)
        setters[idx] = set
        return <span>{v}</span>
    }
    function SiblingRoot(): myra.VNode {
        return <div>{Array.from({ length: n }, (_, i) => <Sibling key={i} idx={i} />)}</div>
    }

    mountedBench(`${n} siblings setState in same tick`, () => {
        setters.length = 0
        return <SiblingRoot />
    }, async () => {
        for (const set of setters) set(v => v + 1)
        await tick()
    }, {
        check: () => {
            if (setters.length !== n) throw new Error(`expected ${n} setters, got ${setters.length}`)
        },
    })
}

// ── Context fan-out ───────────────────────────────────────────────────────────
// One Provider update triggers N consumer re-renders via subscription callbacks.
// All land in the shared queue and flush in a single macrotask.

for (const n of [5, 20, 50]) {
    let setCtxValue: ((f: (v: number) => number) => void) | undefined
    let consumerRenders = 0

    const Ctx = myra.createContext(0)

    function Consumer(): myra.VNode {
        consumerRenders++
        return <span>{myra.useContext(Ctx)}</span>
    }
    function CtxProvider(): myra.VNode {
        const [v, set] = useState(0)
        setCtxValue = set
        return (
            <Ctx.Provider value={v}>
                {Array.from({ length: n }, (_, i) => <Consumer key={i} />)}
            </Ctx.Provider>
        )
    }

    mountedBench(`provider update → ${n} consumer re-renders`, () => {
        setCtxValue = undefined
        consumerRenders = 0
        return <CtxProvider />
    }, async () => {
        setCtxValue!(v => v + 1)
        await tick()
        await tick() // consumer callbacks fire via layout effect
    }, {
        settleTicks: 2, // settle initial context subscriptions
        check: () => {
            if (setCtxValue === undefined) throw new Error('CtxProvider did not mount')
            if (consumerRenders < n) throw new Error(`expected at least ${n} consumer renders, got ${consumerRenders}`)
        },
    })
}

// ── Reconciliation benchmarks ─────────────────────────────────────────────────

let setItems: ((f: (a: number[]) => number[]) => void) | undefined

function shuffle(arr: number[]): number[] {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

function KeyedList(): myra.VNode {
    const [items, set] = useState(() => Array.from({ length: 100 }, (_, i) => i))
    setItems = set
    return <ul>{items.map(i => <li key={i}>{i}</li>)}</ul>
}

mountedBench('keyed shuffle (100 items)', () => <KeyedList />, async () => {
    setItems!(shuffle)
    await tick()
}, {
    check: () => {
        if (setItems === undefined) throw new Error('KeyedList did not mount')
    },
})
