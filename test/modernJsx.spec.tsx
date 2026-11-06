/** @jsxRuntime automatic */
/** @jsxImportSource ../src */

import { expect } from 'chai'
import { jsx, jsxs, jsxDEV, Fragment } from '../src/jsx-runtime'
import { h } from '../src/jsxFactory'
import { ComponentVNode, FragmentVNode, VNodeType } from '../src/contract'

describe('modern JSX runtime', () => {
    it('accepts null props in every runtime entry point', () => {
        for (const create of [jsx, jsxs, jsxDEV]) {
            expect(create('div', null)).to.deep.eq(h('div', {}))
        }
    })

    it('uses the explicit runtime key without mutating input props', () => {
        const props = { key: 'old', children: 'hello' }
        expect(jsx('div', props, 'new')).to.deep.eq(h('div', { key: 'new' }, 'hello'))
        expect(props).to.deep.eq({ key: 'old', children: 'hello' })
    })

    it('creates a placeholder for fragments with omitted or empty children', () => {
        expect(Fragment({})).to.deep.eq({ _: VNodeType.Nothing })
        expect(Fragment({ children: [] })).to.deep.eq({ _: VNodeType.Nothing })
    })

    it('creates elements, components, and fragments', () => {
        const Component = (props: { label: string }) => <span>{props.label}</span>
        const element = <Component label="automatic" /> as ComponentVNode<{ label: string }>
        const fragment = <><div /><div /></> as FragmentVNode

        expect(element._).to.eq(VNodeType.Component)
        expect(element.props).to.deep.eq({ label: 'automatic', children: [] })
        expect(fragment._).to.eq(VNodeType.Fragment)
        expect(fragment.props.children).to.have.length(2)
    })
})
