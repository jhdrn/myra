import * as core from 'core'
import * as jsxFactory from 'core/jsxFactory'

describe('jsxFactory', () => {

    it('creates a TextVNode from an expression inside an element', () => {

        const view = <div>{'some text'}</div> as core.ElementVNode<any>

        expect(view.children[0]).toEqual({
            __type: 1,
            value: 'some text'
        } as core.TextVNode)
    })

    it('creates a NothingVNode from a <nothing /> tag', () => {

        const view = <nothing />

        expect(view).toEqual({
            __type: 0
        } as core.NothingVNode)
    })

    it('ignores null values', () => {

        const view = <div>{null}</div> as core.ElementVNode<any>

        expect(view.children.length).toBe(0)
    })

    it('ignores undefined values', () => {

        const view = <div>{undefined}</div> as core.ElementVNode<any>

        expect(view.children.length).toBe(0)
    })

    it('creates an ElementVNode with the supplied tagName', () => {

        const view = <div></div>

        expect(view).toEqual({
            __type: 2,
            tagName: 'div',
            props: {},
            children: []
        } as core.ElementVNode<any>)
    })

    it('creates an ElementVNode and sets props', () => {

        const fn = () => () => core.evolve(0)
        const view = <div class="test" id="test" onclick={fn}></div>

        expect(view).toEqual({
            __type: 2,
            tagName: 'div',
            props: {
                'class': 'test',
                id: 'test',
                onclick: fn
            },
            children: []
        } as core.ElementVNode<any>)
    })

    const childVNode = {
        __type: 2,
        tagName: 'div',
        props: {},
        children: []
    } as core.ElementVNode<any>

    it('creates an ElementVNode and appends a single child', () => {

        const view = <div><div></div></div>

        expect(view).toEqual({
            __type: 2,
            tagName: 'div',
            props: {},
            children: [
                childVNode
            ]
        } as core.ElementVNode<any>)
    })

    it('creates an ElementVNode and appends multiple children with a single argument', () => {

        const view = <div><div></div><div></div>abc</div>

        expect(view).toEqual({
            __type: 2,
            tagName: 'div',
            props: {},
            children: [
                childVNode,
                childVNode,
                {
                    __type: 1,
                    value: 'abc'
                } as core.TextVNode
            ]
        } as core.ElementVNode<any>)
    })

    it('Object element creates a ComponentVNode', () => {
        type TestProps = {
            test: string
        }

        const TestComponent = core.defineComponent<undefined, TestProps>({
            name: 'JsxComponent',
            init: {
                state: undefined
            },
            view: () => <div></div>
        })

        const view = <TestComponent test="test" /> as core.ComponentVNode<TestProps>

        expect(view.__type).toBe(3)
        expect(view.name).toBe('JsxComponent')
        expect(view.props).toEqual({ test: 'test' })
    })


    it('Stateless component creates an ElementVNode', () => {

        const TestComponent = (props: { test: string }) => <div>{props}</div>

        const view = <TestComponent test="test" /> as core.ElementVNode<HTMLDivElement>

        expect(view.__type).toBe(2)
        expect(view.tagName).toBe('div')
    })
})
