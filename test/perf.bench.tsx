import { bench, describe, beforeAll, afterAll } from 'vitest'
import * as myra from '../src/myra'
import { useState } from '../src/myra'

const tick = () => new Promise<void>(resolve => setTimeout(resolve))

function mkContainer(): HTMLElement {
    const el = document.createElement('div')
    document.body.appendChild(el)
    return el
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
})

bench('mount: 1 000-item unkeyed list', async () => {
    const el = mkContainer()
    myra.mount(
        <ul>{Array.from({ length: 1000 }, (_, i) => <li>{i}</li>)}</ul>,
        el,
    )
    await tick()
    document.body.removeChild(el)
})

// Module-level so the function reference is stable across iterations
function Deep({ d }: { d: number }): myra.VNode {
    return d <= 0 ? <span>leaf</span> : <div><Deep d={d - 1} /></div>
}

bench('mount: deep component tree (depth 50)', async () => {
    const el = mkContainer()
    myra.mount(<Deep d={50} />, el)
    await tick()
    document.body.removeChild(el)
})

// ── Update benchmarks ─────────────────────────────────────────────────────────
// Component is mounted once; each iteration triggers a single state update.

// eslint-disable-next-line prefer-const
let setCount!: (f: (n: number) => number) => void

function Counter(): myra.VNode {
    const [n, set] = useState(0)
    setCount = set
    return <span>{n}</span>
}

describe('update', () => {
    let el: HTMLElement

    beforeAll(async () => {
        el = mkContainer()
        myra.mount(<Counter />, el)
        await tick()
    })

    afterAll(() => document.body.removeChild(el))

    bench('state update + re-render', async () => {
        setCount(n => n + 1)
        await tick()
    })
})

// ── Simultaneous multi-component updates ──────────────────────────────────────
// These benchmarks reveal the queue's advantage over per-component setTimeouts.
// For N=1 the queue adds small overhead (array push + splice). For larger N it
// saves (N-1) macrotask round-trips, which is the point of the shared queue.

for (const n of [5, 20, 50]) {
    const setters: Array<(f: (v: number) => number) => void> = []
    let el: HTMLElement

    function Sibling({ idx }: { idx: number }): myra.VNode {
        const [v, set] = useState(0)
        setters[idx] = set
        return <span>{v}</span>
    }
    function SiblingRoot(): myra.VNode {
        return <div>{Array.from({ length: n }, (_, i) => <Sibling key={i} idx={i} />)}</div>
    }

    describe(`simultaneous updates: ${n} siblings`, () => {
        beforeAll(async () => {
            el = mkContainer()
            myra.mount(<SiblingRoot />, el)
            await tick()
        })

        afterAll(() => document.body.removeChild(el))

        bench(`${n} siblings setState in same tick`, async () => {
            for (const set of setters) set(v => v + 1)
            await tick()
        })
    })
}

// ── Context fan-out ───────────────────────────────────────────────────────────
// One Provider update triggers N consumer re-renders via subscription callbacks.
// All land in the shared queue and flush in a single macrotask.

for (const n of [5, 20, 50]) {
    let el: HTMLElement
    let setCtxValue!: (f: (v: number) => number) => void

    describe(`context fan-out: ${n} consumers`, () => {
        beforeAll(async () => {
            el = mkContainer()

            const Ctx = myra.createContext(0)

            function Consumer(): myra.VNode {
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

            myra.mount(<CtxProvider />, el)
            await tick()
            await tick() // settle initial context subscriptions
        })

        afterAll(() => document.body.removeChild(el))

        bench(`provider update → ${n} consumer re-renders`, async () => {
            setCtxValue(v => v + 1)
            await tick()
            await tick() // consumer callbacks fire via layout effect
        })
    })
}

// ── Reconciliation benchmarks ─────────────────────────────────────────────────

// eslint-disable-next-line prefer-const
let setItems!: (f: (a: number[]) => number[]) => void

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

describe('reconcile', () => {
    let el: HTMLElement

    beforeAll(async () => {
        el = mkContainer()
        myra.mount(<KeyedList />, el)
        await tick()
    })

    afterAll(() => document.body.removeChild(el))

    bench('keyed shuffle (100 items)', async () => {
        setItems(shuffle)
        await tick()
    })
})
