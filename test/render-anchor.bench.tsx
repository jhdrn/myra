// Synchronous re-render benchmarks for the component render path
// (renderComponent → nested render of the component's view). Unlike
// perf.bench.tsx these don't await a setTimeout per iteration, so small
// per-component overheads aren't hidden by timer latency.
import { bench, describe } from 'vitest'
import * as myra from '../src/myra'
import { render } from '../src/component'
import { VNode } from '../src/contract'

function scenario(name: string, view: (v: number) => VNode) {
    describe(name, () => {
        const el = document.createElement('div')
        document.body.appendChild(el)
        let old = render(el, [view(0)], [])
        let v = 0
        bench(name, () => {
            v++
            old = render(el, [view(v)], old)
        }, { throws: true })
    })
}

const ids = (n: number) => Array.from({ length: n }, (_, i) => i)

// Common case: keyed list of components whose root element is unkeyed.
const Item = (p: { key?: number, v: number }) => <li>{p.v}</li>
const ids1000 = ids(1000)
scenario('1000 keyed components, element root', v =>
    <ul>{ids1000.map(i => <Item key={i} v={i + v} />)}</ul>)

// One component rendering a large unkeyed fragment.
const Rows = (p: { n: number, v: number }) => <>{ids(p.n).map(i => <li>{i + p.v}</li>)}</>
scenario('1 component, fragment root with 1000 children', v =>
    <ul><Rows n={1000} v={v} /></ul>)

// Many components each rendering a small unkeyed fragment.
const Pair = (p: { key?: number, v: number }) => <><dt>{p.v}</dt><dd>{p.v}</dd></>
const ids200 = ids(200)
scenario('200 keyed components, fragment root (2 children)', v =>
    <dl>{ids200.map(i => <Pair key={i} v={i + v} />)}</dl>)

// Fragment-returning components nested inside each other.
function Nest(p: { d: number, v: number }): myra.VNode {
    return p.d === 0
        ? <>{p.v}</>
        : <><span>{p.d}</span><Nest d={p.d - 1} v={p.v} /></>
}
scenario('nested fragment components, depth 50', v => <div><Nest d={50} v={v} /></div>)

// Key forwarded onto the root element (the case the change targets).
// NOTE: HEAD mis-renders this (it replaces sibling elements), so its numbers
// measure broken output.
const Card = (p: { key?: number, v: number }) => <div {...p}>{p.v}</div>
scenario('1000 keyed components, key forwarded to root element', v =>
    <section>{ids1000.map(i => <Card key={i} v={i + v} />)}</section>)
