// Synchronous keyed-list reorder benchmarks. Each iteration renders the list in
// a new order, so the cost is dominated by how many DOM nodes render() moves.
import { test } from 'vitest'
import * as myra from '../src/myra'
import { render } from '../src/component'
import { VNode } from '../src/contract'

const N = 1000
const ids = (n: number) => Array.from({ length: n }, (_, i) => i)
const base = ids(N)

function scenario(name: string, order: (iteration: number) => number[], view: (order: number[]) => VNode) {
    test(name, async ({ bench }) => {
        const el = document.createElement('div')
        document.body.appendChild(el)
        let old = render(el, [view(order(0))], [])
        let iteration = 0
        await bench(name, () => {
            iteration++
            old = render(el, [view(order(iteration))], old)
        }).run({ throws: true })
    })
}

const rotate = (by: number) => {
    const offset = ((by % N) + N) % N
    return base.slice(offset).concat(base.slice(0, offset))
}

const swapped = base.slice()
swapped[1] = N - 2
swapped[N - 2] = 1
const reversed = base.slice().reverse()

// Deterministic shuffles (mulberry32) so every run measures the same work.
function shuffle(seed: number) {
    let a = seed
    const rand = () => {
        a = (a + 0x6D2B79F5) | 0
        let t = Math.imul(a ^ (a >>> 15), 1 | a)
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296
    }
    const result = base.slice()
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(rand() * (i + 1))
        const tmp = result[i]
        result[i] = result[j]
        result[j] = tmp
    }
    return result
}
const shuffles = ids(8).map(i => shuffle(i + 1))

const list = (order: number[]) => <ul>{order.map(i => <li key={i}>{i}</li>)}</ul>

scenario('1000 keyed <li>: move first to end', i => rotate(i), list)
scenario('1000 keyed <li>: move last to front', i => rotate(-i), list)
scenario('1000 keyed <li>: swap 2nd and 2nd-to-last', i => i % 2 === 0 ? base : swapped, list)
scenario('1000 keyed <li>: reverse', i => i % 2 === 0 ? base : reversed, list)
scenario('1000 keyed <li>: random shuffle', i => shuffles[i % shuffles.length], list)
// Keys shift by one each iteration: one removed at the end, one added at the
// front. No retained node needs to move.
scenario('1000 keyed <li>: prepend one, drop last', i => base.map(k => k - i), list)
// Same order every time: the LIS bookkeeping should cost close to nothing.
scenario('1000 keyed <li>: no reorder', () => base, list)

const Item = (p: { key?: number, v: number }) => <li>{p.v}</li>
scenario('1000 keyed components: move first to end', i => rotate(i),
    order => <ul>{order.map(i => <Item key={i} v={i} />)}</ul>)

const Pair = (p: { key?: number, v: number }): myra.VNode => <><dt>{p.v}</dt><dd>{p.v}</dd></>
const pairIds = ids(200)
const rotatePairs = (by: number) => {
    const offset = by % pairIds.length
    return pairIds.slice(offset).concat(pairIds.slice(0, offset))
}
scenario('200 keyed fragment components: move first to end', i => rotatePairs(i),
    order => <dl>{order.map(i => <Pair key={i} v={i} />)}</dl>)
