import * as core from 'core'
import { div } from 'html/elements' 

const q = (x: string) => document.querySelector(x)

/**
 * defineComponent
 */
describe('core.defineComponent', () => {
    const component1 = core.defineComponent({
        name: 'TestComponent',
        init: undefined,
        view: () => div()
    })

    it('has a name', () => {
        expect(component1().name).toBe('TestComponent')
    })
})

/**
 * component.mount
 */
describe('mount', () => {

    it('mounts the compontent', () => {

        const component = core.defineComponent({
            name: 'TestComponent',
            init: undefined,
            view: () => div({
                id: 'root'
            })
        })

        core.mount(component, document.body)

        const rootNode = q('#root')
        
        expect(rootNode).not.toBeNull()
    })

    it('calls the mount function', () => {
        const mountMock = {
            mount: (x: number) => x
        }

        spyOn(mountMock, 'mount')

        const component = core.defineComponent({
            name: 'TestComponent',
            init: 0,
            mount: mountMock.mount,
            view: () => div()
        })

        core.mount(component, document.body)

        expect(mountMock.mount).toHaveBeenCalled()
    })

    
    it('calls the subscribe function if supplied with subscriptions', () => {
        const mountMock = {
            mount: (x: number) => x
        }

        spyOn(mountMock, 'mount')

        const component = core.defineComponent({
            name: 'TestComponent',
            init: 0,
            mount: mountMock.mount,
            subscriptions: {
                'test1': x => x,
                'test2': x => x
            },
            view: () => div()
        })

        core.mount(component, document.body)

        expect(mountMock.mount).toHaveBeenCalled()
    })
})

/**
 * updateComponent
 */
describe('updateComponent', () => {

    it('does not call the mount function if the arguments has not changed', () => {
        const mountMock = {
            mount: (x: number) => x
        }

        spyOn(mountMock, 'mount')

        const component = core.defineComponent({
            name: 'TestComponent',
            init: 0,
            mount: mountMock.mount,
            view: () => div()
        })

        const componentDescriptor = component(45)
        componentDescriptor.initComponent(document.body, undefined as any)
        componentDescriptor.updateComponent(componentDescriptor)

        expect(mountMock.mount).toHaveBeenCalledTimes(1)
    })

    it('calls the mount function if forceMount is true', () => {
        const mountMock = {
            mount: (x: number) => x
        }

        spyOn(mountMock, 'mount')

        const component = core.defineComponent({
            name: 'TestComponent',
            init: 0,
            mount: mountMock.mount,
            view: () => div()
        })

        const componentDescriptor = component()
        componentDescriptor.initComponent(document.body, undefined as any)

        const newDescriptor = component(undefined, true)
        newDescriptor.updateComponent(componentDescriptor)

        expect(mountMock.mount).toHaveBeenCalledTimes(2)
    })

    
    it('calls the mount function if the supplied arguments is not equal to the previous arguments', () => {
        const mountMock = {
            mount: (x: number) => x
        }

        spyOn(mountMock, 'mount').and.callThrough()
        
        const component = core.defineComponent({
            name: 'Test',
            init: 0,
            mount: mountMock.mount,
            view: () => div()
        })

        const componentDescriptor = component({ prop: 'a value' })
        componentDescriptor.initComponent(document.body, undefined as any)

        const newDescriptor = component({ prop: 'a new value' })
        newDescriptor.updateComponent(componentDescriptor)

        expect(mountMock.mount).toHaveBeenCalledTimes(2)
    })
})