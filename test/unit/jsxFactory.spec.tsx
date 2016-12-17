import * as core from 'core'
import * as jsxFactory from 'core/jsxFactory'

describe('jsxFactory', () => {

    it('creates a TextNodeDescriptor from an expression inside an element', () => {

        const view = <div>{'some text'}</div> as core.ElementDescriptor<any>

        expect(view.children[0]).toEqual({
            __type: 1,
            value: 'some text'
        } as core.TextDescriptor)
    })

    it('creates a NothingNodeDescriptor from a <nothing /> tag', () => {

        const view = <nothing />

        expect(view).toEqual({
            __type: 0
        } as core.NothingDescriptor)
    })

    it('ignores null values', () => {

        const view = <div>{null}</div> as core.ElementDescriptor<any>

        expect(view.children.length).toBe(0)
    })

    it('ignores undefined values', () => {

        const view = <div>{undefined}</div> as core.ElementDescriptor<any>

        expect(view.children.length).toBe(0)
    })

    it('creates an ElementNodeDescriptor with the supplied tagName', () => {

        const view = <div></div>

        expect(view).toEqual({
            __type: 2,
            tagName: 'div',
            attributes: {},
            children: []
        })
    })

    it('creates an ElementNodeDescriptor and sets attributes', () => {

        const fn = () => () => core.evolve(0)
        const view = <div class="test" id="test" onclick={fn}></div>

        expect(view).toEqual({
            __type: 2,
            tagName: 'div',
            attributes: {
                'class': 'test',
                id: 'test',
                onclick: fn
            },
            children: []
        })
    })

    const childNodeDescriptor = {
        __type: 2,
        tagName: 'div',
        attributes: {},
        children: []
    }

    it('creates an ElementNodeDescriptor and appends a single child', () => {

        const view = <div><div></div></div>

        expect(view).toEqual({
            __type: 2,
            tagName: 'div',
            attributes: {},
            children: [
                childNodeDescriptor
            ]
        })
    })

    it('creates an ElementNodeDescriptor and appends multiple children with a single argument', () => {

        const view = <div><div></div><div></div>abc</div>

        expect(view).toEqual({
            __type: 2,
            tagName: 'div',
            attributes: {},
            children: [
                childNodeDescriptor,
                childNodeDescriptor,
                {
                    __type: 1,
                    value: 'abc'
                } as core.TextDescriptor
            ]
        })
    })

    it('Object element creates a ComponentNodeDescriptor', () => {
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

        const view = <TestComponent test="test" /> as core.ComponentDescriptor<TestProps>

        expect(view.__type).toBe(3)
        expect(view.name).toBe('JsxComponent')
        expect(view.props).toEqual({ test: 'test' })
    })


    it('Stateless component creates an ElementNodeDescriptor', () => {

        const TestComponent = (props: { test: string }) => <div>{props}</div>

        const view = <TestComponent test="test" /> as core.ElementDescriptor<HTMLDivElement>

        console.log(view)
        expect(view.__type).toBe(2)
        expect(view.tagName).toBe('div')
    })
})
