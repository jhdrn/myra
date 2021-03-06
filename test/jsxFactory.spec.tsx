import * as myra from '../src/myra'
import { ElementVNode, TextVNode, NothingVNode, ComponentVNode, VNode, ComponentProps, VNodeType } from '../src/contract'

describe('jsxFactory', () => {

    it('creates a TextVNode from an expression inside an element', () => {

        const view = <div>{'some text'}</div> as ElementVNode<any>

        expect(view.props.children[0]).toEqual({
            _: 1,
            text: 'some text'
        } as TextVNode)
    })

    it('creates a NothingVNode from a <nothing /> tag', () => {

        const view = <nothing />

        expect(view).toEqual({
            _: 0
        } as NothingVNode)
    })

    it('creates a NothingVNode from null', () => {

        const view = myra.h(null, {})

        expect(view).toEqual({
            _: 0
        } as NothingVNode)
    })

    it('creates a NothingVNode from undefined', () => {

        const view = myra.h(undefined, {})
        expect(view).toEqual({
            _: 0
        } as NothingVNode)
    })

    it('creates a NothingVNode from booleans', () => {

        const view1 = myra.h(false as any, {})

        expect(view1).toEqual({
            _: 0
        } as NothingVNode)

        const view2 = myra.h(true as any, {})

        expect(view2).toEqual({
            _: 0
        } as NothingVNode)
    })

    it('creates a NothingVNode from null children', () => {

        const view = <div>{null}</div> as ElementVNode<any>

        expect(view.props.children[0]).toEqual({
            _: 0
        } as NothingVNode)
    })

    it('creates a NothingVNode from undefined children', () => {

        const view = <div>{undefined}</div> as ElementVNode<any>
        expect(view.props.children[0]).toEqual({
            _: 0
        } as NothingVNode)
    })

    it('creates a NothingVNode from boolean children', () => {

        const view1 = <div>{false}</div> as ElementVNode<any>

        expect(view1.props.children[0]).toEqual({
            _: 0
        } as NothingVNode)

        const view2 = <div>{true}</div> as ElementVNode<any>

        expect(view2.props.children[0]).toEqual({
            _: 0
        } as NothingVNode)
    })

    it('creates an ElementVNode with the supplied tagName', () => {

        const view = <div></div>

        expect(view).toEqual({
            _: 2,
            tagName: 'div',
            props: {
                children: []
            },
        } as ElementVNode<any>)
    })

    it('creates an ElementVNode and sets props', () => {

        const fn = () => () => ({})
        const view = <div class="test" id="test" onclick={fn}></div>

        expect(view).toEqual({
            _: 2,
            tagName: 'div',
            props: {
                'class': 'test',
                id: 'test',
                onclick: fn,
                children: []
            }
        } as ElementVNode<any>)
    })

    const childVNode = {
        _: 2,
        tagName: 'div',
        props: {
            children: []
        }
    } as ElementVNode<any>

    it('creates an ElementVNode and appends a single child', () => {

        const view = <div><div></div></div>

        expect(view).toEqual({
            _: 2,
            tagName: 'div',
            props: {
                children: [
                    childVNode
                ]
            },
        } as ElementVNode<any>)
    })

    it('creates an ElementVNode and appends multiple children with a single argument', () => {

        const view = <div><div></div><div></div>abc</div>

        expect(view).toEqual({
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
        } as ElementVNode<any>)
    })

    it('Object element creates a ComponentVNode', () => {
        type TestProps = {
            test: string
        }

        const TestComponent = (_p: TestProps) => <div></div>

        const view = <TestComponent test="test" /> as ComponentVNode<TestProps & ComponentProps>

        expect(view._).toBe(VNodeType.Component)
        expect(view.props).toEqual({ test: 'test', children: [] as VNode[] })
    })
})
