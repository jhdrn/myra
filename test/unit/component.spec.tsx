import { defineComponent, mountComponent, evolve } from 'core'
import { initComponent, updateComponent } from 'core/component'
import * as jsxFactory from 'core/jsxFactory'

const q = (x: string) => document.querySelector(x)

const randomName = () => Math.random().toString()

/**
 * defineComponent
 */
describe('defineComponent', () => {
    const componentName = randomName()
    const component1 = defineComponent({
        name: componentName,
        init: { state: undefined },
        view: () => <div />
    })

    it('has a name', () => {
        expect(component1({}).name).toBe(componentName)
    })

    it('throws if a component with the same name is already defined', () => {
        expect(() => defineComponent({
            name: componentName,
            init: { state: undefined },
            view: () => <div />
        })).toThrow()
    })
})

/**
 * mountComponent
 */
describe('mountComponent', () => {

    it('mounts the compontent', () => {

        const component = defineComponent({
            name: randomName(),
            init: { state: undefined },
            view: () => <div id="root" />
        })

        mountComponent(component, document.body)

        const rootNode = q('#root')

        expect(rootNode).not.toBeNull()
    })

    it('calls the mount function', () => {
        const mountMock = {
            mount: (x: number) => evolve(x)
        }

        spyOn(mountMock, 'mount').and.callThrough()

        const component = defineComponent({
            name: randomName(),
            init: { state: 0 },
            onMount: mountMock.mount,
            view: () => <div />
        })

        mountComponent(component, document.body)

        expect(mountMock.mount).toHaveBeenCalled()
    })


    it('calls the subscribe function if supplied with subscriptions', () => {
        const mountMock = {
            mount: (x: number) => evolve(x)
        }

        spyOn(mountMock, 'mount').and.callThrough()

        const component = defineComponent({
            name: randomName(),
            init: { state: 0 },
            onMount: mountMock.mount,
            subscriptions: {
                'test1': x => evolve(x),
                'test2': x => evolve(x)
            },
            view: () => <div />
        })

        mountComponent(component, document.body)

        expect(mountMock.mount).toHaveBeenCalled()
    })

    it(`passes the children of a component to it view`, () => {
        const viewMock = {
            view: (ctx: any) => {
                expect(Array.isArray(ctx.children)).toBe(true)
                return <div>{ctx.children}</div>
            }
        }

        spyOn(viewMock, 'view').and.callThrough()

        const component = defineComponent<any, any>({
            name: randomName(),
            init: { state: undefined },
            view: viewMock.view
        })

        const parent = defineComponent({
            name: randomName(),
            init: { state: 22 },
            view: () => component(undefined, undefined, [<div id="divTestId" />])
        })

        mountComponent(parent, document.body)

        expect(q('#divTestId')).not.toBeNull()

        expect(viewMock.view).toHaveBeenCalledTimes(1)
    })
})

/**
 * updateComponent
 */
describe('updateComponent', () => {

    it('does not call the mount function if the arguments has not changed', () => {
        const mountMock = {
            mount: (x: number) => evolve(x)
        }

        spyOn(mountMock, 'mount').and.callThrough()

        const component = defineComponent({
            name: randomName(),
            init: { state: 0 },
            onMount: mountMock.mount,
            view: () => <div />
        })

        const componentDescriptor = component(45)
        initComponent(componentDescriptor, document.body)
        updateComponent(component(45), componentDescriptor)

        expect(mountMock.mount).toHaveBeenCalledTimes(1)
    })

    it('calls the mount function if forceMount is true', () => {
        const mountMock = {
            mount: (x: number) => evolve(x)
        }

        spyOn(mountMock, 'mount').and.callThrough()

        const component = defineComponent({
            name: randomName(),
            init: { state: 0 },
            onMount: mountMock.mount,
            view: () => <div />
        })

        const componentDescriptor = component({})
        initComponent(componentDescriptor, document.body)

        const newDescriptor = component({}, true)
        updateComponent(newDescriptor, componentDescriptor)

        expect(mountMock.mount).toHaveBeenCalledTimes(2)
    })


    it('calls the mount function if the supplied arguments is not equal to the previous arguments', () => {
        const mountMock = {
            mount: (x: number) => evolve(x)
        }

        spyOn(mountMock, 'mount').and.callThrough()

        const component = defineComponent({
            name: 'Test',
            init: { state: 0 },
            onMount: mountMock.mount,
            view: () => <div />
        })

        const componentDescriptor = component({ prop: 'a value' })
        initComponent(componentDescriptor, document.body)

        const newDescriptor = component({ prop: 'a new value' })
        updateComponent(newDescriptor, componentDescriptor)

        expect(mountMock.mount).toHaveBeenCalledTimes(2)
    })
})