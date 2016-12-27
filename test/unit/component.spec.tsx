import { defineComponent, mountComponent, evolve, ComponentVNode } from 'core'
import { initComponent, updateComponent, findAndUnmountComponentsRec } from 'core/component'
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

    it('calls the onMount function', () => {
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
            view: () => component(undefined, [<div id="divTestId" />])
        })

        mountComponent(parent, document.body)

        expect(q('#divTestId')).not.toBeNull()

        expect(viewMock.view).toHaveBeenCalledTimes(1)
    })
})


/**
 * mountComponent
 */
describe('unmountComponent', () => {

    it('calls the onUnmount function', () => {
        const mountMock = {
            unmount: (x: number) => evolve(x)
        }

        spyOn(mountMock, 'unmount').and.callThrough()

        const Component = defineComponent({
            name: randomName(),
            init: { state: 0 },
            onUnmount: mountMock.unmount,
            view: () => <div />
        })
        const instance = <Component /> as ComponentVNode<{}>

        initComponent(instance, document.body)
        findAndUnmountComponentsRec(instance)

        expect(mountMock.unmount).toHaveBeenCalledTimes(1)
    })

    it('calls the onUnmount function on child components', () => {
        const mountMock = {
            unmount: (x: number) => evolve(x)
        }

        spyOn(mountMock, 'unmount').and.callThrough()

        const ChildChildComponent = defineComponent({
            name: randomName(),
            init: { state: 0 },
            onUnmount: mountMock.unmount,
            view: () => <div />
        })

        const ChildComponent = defineComponent({
            name: randomName(),
            init: { state: 0 },
            onUnmount: mountMock.unmount,
            view: () => <ChildChildComponent />
        })

        const component = defineComponent({
            name: randomName(),
            init: { state: 0 },
            view: () => <div><ChildComponent /></div>
        })

        const instance = component({})
        initComponent(instance, document.body)
        findAndUnmountComponentsRec(instance)

        expect(mountMock.unmount).toHaveBeenCalledTimes(2)
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

        const vNode = component(45)
        initComponent(vNode, document.body)
        updateComponent(component(45), vNode)

        expect(mountMock.mount).toHaveBeenCalledTimes(1)
    })

    it('calls the mount function if forceUpdate is true', () => {
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

        const vNode = component({})
        initComponent(vNode, document.body)

        const newVNode = component({ forceUpdate: true })
        updateComponent(newVNode, vNode)

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

        const vNode = component({ prop: 'a value' })
        initComponent(vNode, document.body)

        const newVNode = component({ prop: 'a new value' })
        updateComponent(newVNode, vNode)

        expect(mountMock.mount).toHaveBeenCalledTimes(2)
    })
})
