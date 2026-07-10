/** @jsxRuntime automatic */
/** @jsxImportSource ../src */

import { expect } from 'chai'
import { ComponentVNode, FragmentVNode, VNodeType } from '../src/contract'

describe('modern JSX runtime', () => {
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
