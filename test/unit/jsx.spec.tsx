import * as core from 'core'
import * as jsxFactory from 'html/jsxFactory'

describe('jsxFactory', () => {

    it('creates a TextNodeDescriptor from an expression inside an element', () => {

        const view = <div>{'some text'}</div> as core.ElementNodeDescriptor

        expect(view.children[0]).toEqual({
            __type: 'text',
            value: 'some text'
        } as core.TextNodeDescriptor)
    })

    it('creates a NothingNodeDescriptor from a <nothing /> tag', () => {

        const view = <nothing />

        expect(view).toEqual({
            __type: 'nothing'
        } as core.NothingNodeDescriptor)
    })

    it('creates an ElementNodeDescriptor with the supplied tagName', () => {

        const view = <div></div> as core.ElementNodeDescriptor

        expect(view).toEqual({
            __type: 'element',
            tagName: 'div',
            attributes: {},
            children: []
        } as core.ElementNodeDescriptor)
    })

    it('creates an ElementNodeDescriptor and sets attributes', () => {

        const fn = () => 0
        const view = <div class="test" id="test" onclick={fn}></div>

        expect(view).toEqual({
            __type: 'element',
            tagName: 'div',
            attributes: {
                'class': 'test',
                id: 'test',
                onclick: fn
            },
            children: []
        } as core.ElementNodeDescriptor)
    })

     const childNodeDescriptor = {
        __type: 'element',
        tagName: 'div',
        attributes: {},
        children: []
    } as core.ElementNodeDescriptor

    it('creates an ElementNodeDescriptor and appends a single child', () => {
        
        const view = <div><div></div></div>

        expect(view).toEqual({
            __type: 'element',
            tagName: 'div',
            attributes: {},
            children: [
                childNodeDescriptor
            ]
        } as core.ElementNodeDescriptor)
    })
    
    it('creates an ElementNodeDescriptor and appends multiple children with a single argument', () => {

        const view = <div><div></div><div></div>abc</div>

        expect(view).toEqual({
            __type: 'element',
            tagName: 'div',
            attributes: {},
            children: [
                childNodeDescriptor,
                childNodeDescriptor,
                {
                    __type: 'text',
                    value: 'abc'
                } as core.TextNodeDescriptor
            ]
        } as core.ElementNodeDescriptor)
    })

    it('mount element mounts a ComponentNodeDescriptor', () => {
        const testComponent = core.defineComponent({
            name: 'TestComponent',
            init: undefined,
            view: () => <div></div> as core.ElementNodeDescriptor
        })

        const view = <mount component={ testComponent } args={ 'test' }></mount>

        expect(view).toEqual({
            __type: 'component',
            component: testComponent,
            args: 'test',
            forceMount: undefined
        } as core.ComponentNodeDescriptor)
    })
})
