import { define, mount, ComponentVNode } from 'core'
import { initComponent, updateComponent, findAndUnmountComponentsRec } from 'core/component'
import * as jsxFactory from 'core/jsxFactory'

const q = (x: string) => document.querySelector(x)

const randomName = () => Math.random().toString()

/**
 * define
 */
describe('define', () => {
    const componentName = randomName()
    const spec = {
        name: componentName,
        init: {},
        render: () => <div />
    }
    const component1 = define(spec)

    it('has a name', () => {
        expect(component1({}).spec).toBe(spec)
    })
})

/**
 * mount
 */
describe('mount', () => {

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
 * unmountComponent
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
        const instance = <Component /> as ComponentVNode<{}, {}>

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
})


describe('post', () => {
    it('updates the state when an Update function in supplied', () => {
        let firstUpdate = true

        const mocks = {
            onclickUpdate: (s: { val: number }) => {
                if (firstUpdate) {
                    expect(s).toEqual({ val: 1 })
                }
                else {
                    expect(s).toEqual({ val: 2 })
                }
                return { val: 2 }
            }
        }

        spyOn(mocks, 'onclickUpdate').and.callThrough()

        const component = define({ val: 1 }, ({ post }) =>
            <button id="postButton" onclick={() => post(mocks.onclickUpdate)}></button>
        )

        mount(component, document.body)

        const postBtn = document.getElementById('postButton') as HTMLButtonElement
        postBtn.click()
        firstUpdate = false
        postBtn.click()

        expect(mocks.onclickUpdate).toHaveBeenCalledTimes(2)
    })

    it('updates the state when an object in supplied', () => {
        let firstUpdate = true

        const mocks = {
            onclickUpdate: (s: { val: number }, newState: { val: number }) => {

                if (firstUpdate) {
                    expect(s).toEqual({ val: 1 })
                }
                else {
                    expect(s).toEqual({ val: 2 })
                }
                return newState
            }
        }

        spyOn(mocks, 'onclickUpdate').and.callThrough()

        const component = define({ val: 1 }, ({ state, post }) =>
            <button id="postButton2" onclick={() => post(mocks.onclickUpdate(state, { val: 2 }))}></button>
        )

        mount(component, document.body)

        const postBtn = document.getElementById('postButton2') as HTMLButtonElement
        postBtn.click()
        firstUpdate = false
        postBtn.click()

        expect(mocks.onclickUpdate).toHaveBeenCalledTimes(2)
    })
})