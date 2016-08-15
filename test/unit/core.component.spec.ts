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
        expect(component1.name).toBe('TestComponent')
    })
})

/**
 * component.mount
 */
describe('component.mount', () => {

    it('mounts the compontent', () => {

        const component = core.defineComponent({
            name: 'TestComponent',
            init: undefined,
            view: () => div({
                id: 'root'
            })
        })

        component.mount(document.body)

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

        component.mount(document.body)

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

        component.mount(document.body)

        expect(mountMock.mount).toHaveBeenCalled()
    })
})

/**
 * componentInstance.remount
 */
describe('componentInstance.remount', () => {

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

        const componentInstance = component.mount(document.body, 75)
        componentInstance.remount(75)

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

        const componentInstance = component.mount(document.body)
        componentInstance.remount(undefined, true)

        expect(mountMock.mount).toHaveBeenCalledTimes(2)
    })

    
    it('calls the mount function if the supplied arguments is not equal to the previous arguments', () => {
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

        const componentInstance = component.mount(document.body, { prop: 'value' })
        componentInstance.remount({ prop: 'new value' }, true)

        expect(mountMock.mount).toHaveBeenCalledTimes(2)
    })
})