import * as myra from '../src/myra'
import { ElementVNode, TextVNode, NothingVNode, ComponentVNode, VNode, ComponentProps, VNodeType } from '../src/contract'
import { expect } from 'chai'

describe('jsxFactory', () => {

    it('creates a TextVNode from an expression inside an element', () => {

        const view = <div>{'some text'}</div> as ElementVNode<Element>

        expect(view.props.children[0]).to.deep.eq({
            _: 1,
            text: 'some text'
        } as TextVNode)
    })

    it('creates a NothingVNode from a <nothing /> tag', () => {

        const view = <nothing />

        expect(view).to.deep.eq({
            _: 0
        } as NothingVNode)
    })

    it('creates a NothingVNode from null', () => {

        const view = myra.h(null, {})

        expect(view).to.deep.eq({
            _: 0
        } as NothingVNode)
    })

    it('creates a NothingVNode from undefined', () => {

        const view = myra.h(undefined, {})
        expect(view).to.deep.eq({
            _: 0
        } as NothingVNode)
    })

    it('creates a NothingVNode from booleans', () => {

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const view1 = myra.h(false as any, {})

        expect(view1).to.deep.eq({
            _: 0
        } as NothingVNode)

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const view2 = myra.h(true as any, {})

        expect(view2).to.deep.eq({
            _: 0
        } as NothingVNode)
    })

    it('creates a NothingVNode from null children', () => {

        const view = <div>{null}</div> as ElementVNode<Element>

        expect(view.props.children[0]).to.deep.eq({
            _: 0
        } as NothingVNode)
    })

    it('creates a NothingVNode from undefined children', () => {

        const view = <div>{undefined}</div> as ElementVNode<Element>
        expect(view.props.children[0]).to.deep.eq({
            _: 0
        } as NothingVNode)
    })

    it('creates a NothingVNode from boolean children', () => {

        const view1 = <div>{false}</div> as ElementVNode<Element>

        expect(view1.props.children[0]).to.deep.eq({
            _: 0
        } as NothingVNode)

        const view2 = <div>{true}</div> as ElementVNode<Element>

        expect(view2.props.children[0]).to.deep.eq({
            _: 0
        } as NothingVNode)
    })

    it('creates an ElementVNode with the supplied tagName', () => {

        const view = <div></div>

        expect(view).to.deep.eq({
            _: 2,
            tagName: 'div',
            props: {
                children: []
            },
        } as ElementVNode<Element>)
    })

    it('creates an ElementVNode and sets props', () => {

        const fn = () => () => ({})
        const view = <div class="test" id="test" onclick={fn}></div>

        expect(view).to.deep.eq({
            _: 2,
            tagName: 'div',
            props: {
                'class': 'test',
                id: 'test',
                onclick: fn,
                children: []
            }
        } as ElementVNode<Element>)
    })

    const childVNode = {
        _: 2,
        tagName: 'div',
        props: {
            children: []
        }
    } as ElementVNode<Element>

    it('creates an ElementVNode and appends a single child', () => {

        const view = <div><div></div></div>

        expect(view).to.deep.eq({
            _: 2,
            tagName: 'div',
            props: {
                children: [
                    childVNode
                ]
            },
        } as ElementVNode<Element>)
    })

    it('creates an ElementVNode and appends multiple children with a single argument', () => {

        const view = <div><div></div><div></div>abc</div>

        expect(view).to.deep.eq({
            _: 2,
            tagName: 'div',
            props: {
                children: [
                    childVNode,
                    childVNode,
                    {
                        _: 1,
                        text: 'abc'
                    } as TextVNode
                ]
            }
        } as ElementVNode<Element>)
    })

    it('Object element creates a ComponentVNode', () => {
        type TestProps = {
            test: string
        }

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const TestComponent = (_p: TestProps) => <div></div>

        const view = <TestComponent test="test" /> as ComponentVNode<TestProps & ComponentProps>

        expect(view._).to.be.eq(VNodeType.Component)
        expect(view.props).to.deep.eq({ test: 'test', children: [] as VNode[] })
    })
})
