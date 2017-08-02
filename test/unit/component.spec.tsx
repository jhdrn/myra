import { define, mount, ComponentVNode } from 'core'
import { initComponent, updateComponent, findAndUnmountComponentsRec } from 'core/component'
import * as jsxFactory from 'core/jsxFactory'

const q = (x: string) => document.querySelector(x)

/**
 * define
 */
// describe('define', () => {
//     const spec = {
//         name: componentName,
//         init: {},
//         render: () => <div />
//     }
//     const component1 = define(spec)

//     it('has a name', () => {
//         expect(component1({}).spec).toBe(spec)
//     })
// })

/**
 * mount
 */
describe('mount', () => {

    it('mounts the compontent', () => {

        const component = define({}, () => () => <div id="root" />)

        mount(component, document.body)

        const rootNode = q('#root')

        expect(rootNode).not.toBeNull()
    })

    it('calls the _didMount effect', () => {
        const mountMock = {
            mount: () => Promise.resolve({})
        }

        spyOn(mountMock, 'mount').and.callThrough()

        const component = define({ val: 0 }, (_, events) => {
            events.didMount = mountMock.mount
            return () => <div />
        })

        mount(component, document.body)

        expect(mountMock.mount).toHaveBeenCalled()
    })

    it(`passes the children of a component to it view`, () => {
        const viewMock = {
            view: (_s: any, _p: any, children: any) => {
                expect(Array.isArray(children)).toBe(true)
                return <div>{children}</div>
            }
        }

        spyOn(viewMock, 'view').and.callThrough()

        const component = define<any, any>({}, () => viewMock.view)

        const parent = define({}, () => () =>
            component({}, [<div id="divTestId" />])
        )

        mount(parent, document.body)

        expect(q('#divTestId')).not.toBeNull()

        expect(viewMock.view).toHaveBeenCalledTimes(1)
    })
})


/**
 * unmountComponent
 */
describe('unmountComponent', () => {

    it('calls the _willUnmount effect', () => {
        const mountMock = {
            unmount: () => Promise.resolve({})
        }

        spyOn(mountMock, 'unmount').and.callThrough()

        const Component = define({}, (_, events) => {
            events.willUnmount = mountMock.unmount
            return () => <div />
        })
        const instance = <Component /> as ComponentVNode<{}, {}>

        initComponent(instance, document.body)
        findAndUnmountComponentsRec(instance)

        expect(mountMock.unmount).toHaveBeenCalledTimes(1)
    })

    it('calls the _willUnmount effect on child components', () => {
        const mountMock = {
            unmount: () => Promise.resolve({})
        }

        spyOn(mountMock, 'unmount').and.callThrough()

        const ChildChildComponent = define({}, (_, events) => {
            events.willUnmount = mountMock.unmount
            return () => <div />
        })

        const ChildComponent = define({}, (_, events) => {
            events.willUnmount = mountMock.unmount
            return () => <ChildChildComponent />
        })

        const component = define({}, () => () => <div><ChildComponent /></div>)

        const instance = component({}, [])
        initComponent(instance, document.body)
        findAndUnmountComponentsRec(instance)

        expect(mountMock.unmount).toHaveBeenCalledTimes(2)
    })
})

/**
 * updateComponent
 */
describe('updateComponent', () => {

    it('does not call the _willUpdate effect if the arguments has not changed', () => {
        const mountMock = {
            mount: () => Promise.resolve({})
        }

        spyOn(mountMock, 'mount').and.callThrough()

        const component = define<{}, { val: number }>({}, (_, events) => {
            events.willUpdate = mountMock.mount
            return () => <div />
        })

        const vNode = component({ val: 45 }, [])
        initComponent(vNode, document.body)
        updateComponent(component({ val: 45 }, []), vNode)

        expect(mountMock.mount).toHaveBeenCalledTimes(0)
    })

    it('calls the _willUpdate effect if forceUpdate is true', () => {
        const mountMock = {
            mount: () => Promise.resolve({})
        }

        spyOn(mountMock, 'mount').and.callThrough()

        const component = define({}, (_, events) => {
            events.willUpdate = mountMock.mount
            return () => <div />
        })

        const vNode = component({}, [])
        initComponent(vNode, document.body)

        const newVNode = component({ forceUpdate: true }, [])
        updateComponent(newVNode, vNode)

        expect(mountMock.mount).toHaveBeenCalledTimes(1)
    })


    it('calls the _willUpdate effect if the supplied arguments is not equal to the previous arguments', () => {
        const mountMock = {
            mount: () => Promise.resolve({})
        }

        spyOn(mountMock, 'mount').and.callThrough()

        const component = define({}, (_, events) => {
            events.willUpdate = mountMock.mount
            return () => <div />
        })

        const vNode = component({ prop: 'a value' }, [])
        initComponent(vNode, document.body)

        const newVNode = component({ prop: 'a new value' }, [])
        updateComponent(newVNode, vNode)

        expect(mountMock.mount).toHaveBeenCalledTimes(1)
    })
})


describe('post', () => {
    it('updates the state when an Update function in supplied', () => {
        let firstUpdate = true

        const mocks = {
            onclickUpdate: (state: { val: number }) => {
                if (firstUpdate) {
                    expect(state).toEqual({ val: 1 })
                }
                else {
                    expect(state).toEqual({ val: 2 })
                }
                return { val: 2 }
            }
        }

        spyOn(mocks, 'onclickUpdate').and.callThrough()

        const component = define({ val: 1 }, evolve => {
            const onclickUpdate = () => evolve(mocks.onclickUpdate)
            return () => <button id="postButton" onclick={onclickUpdate}></button>
        })


        mount(component, document.body)

        const postBtn = document.getElementById('postButton') as HTMLButtonElement
        postBtn.click()
        firstUpdate = false
        postBtn.click()

        expect(mocks.onclickUpdate).toHaveBeenCalledTimes(2)
    })

    // it('updates the state when an object in supplied', () => {
    //     let firstUpdate = true

    //     const mocks = {
    //         onclickUpdate: (s: { val: number }, newState: { val: number }) => {

    //             if (firstUpdate) {
    //                 expect(s).toEqual({ val: 1 })
    //             }
    //             else {
    //                 expect(s).toEqual({ val: 2 })
    //             }
    //             return newState
    //         }
    //     }

    //     spyOn(mocks, 'onclickUpdate').and.callThrough()

    //     const component = define({ val: 1 }, ({ state, post }) =>
    //         <button id="postButton2" onclick={() => post(mocks.onclickUpdate(state, { val: 2 }))}></button>
    //     )

    //     mount(component, document.body)

    //     const postBtn = document.getElementById('postButton2') as HTMLButtonElement
    //     postBtn.click()
    //     firstUpdate = false
    //     postBtn.click()

    //     expect(mocks.onclickUpdate).toHaveBeenCalledTimes(2)
    // })
})