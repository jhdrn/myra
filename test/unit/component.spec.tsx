import { define, mount, ComponentVNode, Apply } from 'core'
import { initComponent, updateComponent, findAndUnmountComponentsRec } from 'core/component'
import * as jsxFactory from 'core/jsxFactory'

const q = (x: string) => document.querySelector(x)

const randomName = () => Math.random().toString()

/**
 * defineComponent
 */
describe('defineComponent', () => {
    const componentName = randomName()
    const component1 = define({
        name: componentName,
        init: {},
        render: () => <div />
    })

    it('has a name', () => {
        expect(component1({}).name).toBe(componentName)
    })

    it('throws if a component with the same name is already defined', () => {
        expect(() => define({
            name: componentName,
            init: {},
            render: () => <div />
        })).toThrow()
    })
})

/**
 * mountComponent
 */
describe('mountComponent', () => {

    it('mounts the compontent', () => {

        const component = define({
            name: randomName(),
            init: {},
            render: () => <div id="root" />
        })

        mount(component, document.body)

        const rootNode = q('#root')

        expect(rootNode).not.toBeNull()
    })

    it('calls the onMount function', () => {
        const mountMock = {
            mount: (x: { val: number }) => x
        }

        spyOn(mountMock, 'mount').and.callThrough()

        const component = define({
            name: randomName(),
            init: { val: 0 },
            onMount: mountMock.mount,
            render: () => <div />
        })

        mount(component, document.body)

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

        const component = define<any, any>({
            name: randomName(),
            init: {},
            render: viewMock.view
        })

        const parent = define({
            name: randomName(),
            init: {},
            render: () => component(undefined, [<div id="divTestId" />])
        })

        mount(parent, document.body)

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
            unmount: (x: { val: number }) => x
        }

        spyOn(mountMock, 'unmount').and.callThrough()

        const Component = define({
            name: randomName(),
            init: { val: 0 },
            onUnmount: mountMock.unmount,
            render: () => <div />
        })
        const instance = <Component /> as ComponentVNode<{}>

        initComponent(instance, document.body)
        findAndUnmountComponentsRec(instance)

        expect(mountMock.unmount).toHaveBeenCalledTimes(1)
    })

    it('calls the onUnmount function on child components', () => {
        const mountMock = {
            unmount: (x: { val: number }) => x
        }

        spyOn(mountMock, 'unmount').and.callThrough()

        const ChildChildComponent = define({
            name: randomName(),
            init: { val: 0 },
            onUnmount: mountMock.unmount,
            render: () => <div />
        })

        const ChildComponent = define({
            name: randomName(),
            init: { val: 0 },
            onUnmount: mountMock.unmount,
            render: () => <ChildChildComponent />
        })

        const component = define({
            name: randomName(),
            init: { val: 0 },
            render: () => <div><ChildComponent /></div>
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
            mount: (x: { val: number }) => x
        }

        spyOn(mountMock, 'mount').and.callThrough()

        const component = define({
            name: randomName(),
            init: { val: 0 },
            onMount: mountMock.mount,
            render: () => <div />
        })

        const vNode = component(45)
        initComponent(vNode, document.body)
        updateComponent(component(45), vNode)

        expect(mountMock.mount).toHaveBeenCalledTimes(1)
    })

    it('calls the mount function if forceUpdate is true', () => {
        const mountMock = {
            mount: (state: { val: number }) => state
        }

        spyOn(mountMock, 'mount').and.callThrough()

        const component = define({
            name: randomName(),
            init: { val: 0 },
            onMount: mountMock.mount,
            render: () => <div />
        })

        const vNode = component({})
        initComponent(vNode, document.body)

        const newVNode = component({ forceUpdate: true })
        updateComponent(newVNode, vNode)

        expect(mountMock.mount).toHaveBeenCalledTimes(2)
    })


    it('calls the mount function if the supplied arguments is not equal to the previous arguments', () => {
        const mountMock = {
            mount: (x: { val: number }) => x
        }

        spyOn(mountMock, 'mount').and.callThrough()

        const component = define({
            name: 'Test',
            init: { val: 0 },
            onMount: mountMock.mount,
            render: () => <div />
        })

        const vNode = component({ prop: 'a value' })
        initComponent(vNode, document.body)

        const newVNode = component({ prop: 'a new value' })
        updateComponent(newVNode, vNode)

        expect(mountMock.mount).toHaveBeenCalledTimes(2)
    })

    it('throws if Update result is a string', () => {
        const mountMock = {
            mount: (_x: { val: number }) => 'failure' as any
        }

        spyOn(mountMock, 'mount').and.callThrough()

        const component = define({
            name: 'ThrowsOnUpdateReturningString',
            init: { val: 0 },
            onMount: mountMock.mount,
            render: () => <div />
        })

        const vNode = component({ prop: 'a value' })
        expect(() => initComponent(vNode, document.body)).toThrow()
    })

    it('invokes effect with an Apply function', () => {

        const mockEffects = {
            effect: (apply: Apply<any>) => {
                expect(apply).toBeDefined()
            }
        }

        spyOn(mockEffects, 'effect')

        const update = (x: { val: number }) =>
            [{ val: x.val }, mockEffects.effect]

        const component = define({
            name: 'InvokesEffect',
            init: { val: 0 },
            onMount: update,
            render: () => <div />
        })

        const vNode = component({})
        initComponent(vNode, document.body)

        expect(mockEffects.effect).toHaveBeenCalledTimes(1)
    })
})
