import * as myra from '../src/myra'
import { initComponent, updateComponent, findAndUnmountComponentsRec } from '../src/component'

const q = (x: string) => document.querySelector(x)

/**
 * define
 */
describe('define', () => {
    it('the "ctx" object is passed', (done) => {

        const Component = myra.define({}, ctx => {
            expect(ctx).toBeDefined()
            expect(typeof ctx === 'object').toBeTruthy()
            done()
            return () => <div />
        })

        myra.mount(<Component />, document.body)
    })
})

/**
 * mount
 */
describe('mount', () => {

    it('mounts the component', () => {

        const Component = myra.define({}, () => () => <div id="root" />)

        myra.mount(<Component />, document.body)

        const rootNode = q('#root')

        expect(rootNode).not.toBeNull()
    })

    it('mounts a stateless component', () => {

        const Component = () => <div id="stateless-root" />

        myra.mount(<Component />, document.body)

        const rootNode = q('#stateless-root')

        expect(rootNode).not.toBeNull()
    })

    it('calls the willMount listener', () => {
        const mock = {
            callback: () => Promise.resolve({})
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = myra.define({ val: 0 }, ctx => {
            ctx.willMount = mock.callback
            return () => <div />
        })

        myra.mount(<Component />, document.body)

        expect(mock.callback).toHaveBeenCalled()
    })

    it('calls the didMount listener', () => {
        const mock = {
            callback: () => Promise.resolve({})
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = myra.define({ val: 0 }, ctx => {
            ctx.didMount = mock.callback
            return () => <div />
        })

        myra.mount(<Component />, document.body)

        expect(mock.callback).toHaveBeenCalled()
    })

    it('calls the willRender listener', () => {
        const mock = {
            callback: () => Promise.resolve({})
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = myra.define({ val: 0 }, ctx => {
            ctx.willRender = mock.callback
            return () => <div />
        })

        myra.mount(<Component />, document.body)

        expect(mock.callback).toHaveBeenCalled()
    })

    it('calls the didRender listener', () => {
        const mock = {
            callback: () => Promise.resolve({})
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = myra.define({ val: 0 }, ctx => {
            ctx.didRender = mock.callback
            return () => <div />
        })

        myra.mount(<Component />, document.body)

        expect(mock.callback).toHaveBeenCalled()
    })

    it(`passes the children of a component to it view`, () => {
        const viewMock = {
            view: (_s: any, _p: any, children: any) => {
                expect(Array.isArray(children)).toBe(true)
                return <div>{children}</div>
            }
        }

        spyOn(viewMock, 'view').and.callThrough()

        const Component = myra.define<any, any>({}, () => viewMock.view)

        const Parent = myra.define({}, () => () =>
            <Component>
                <div id="divTestId" />
            </Component>
        )

        myra.mount(<Parent />, document.body)

        expect(q('#divTestId')).not.toBeNull()

        expect(viewMock.view).toHaveBeenCalledTimes(1)
    })
})


/**
 * unmountComponent
 */
describe('unmountComponent', () => {

    it('calls the willUnmount listener', () => {
        const mountMock = {
            unmount: () => Promise.resolve({})
        }

        spyOn(mountMock, 'unmount').and.callThrough()

        const Component = myra.define({}, ctx => {
            ctx.willUnmount = mountMock.unmount
            return () => <div />
        })
        const instance = <Component /> as myra.ComponentVNode<{}, {}>

        initComponent(instance, document.body)
        findAndUnmountComponentsRec(instance)

        expect(mountMock.unmount).toHaveBeenCalledTimes(1)
    })

    it('calls the willUnmount listener on child components', () => {
        const mountMock = {
            unmount: () => Promise.resolve({})
        }

        spyOn(mountMock, 'unmount').and.callThrough()

        const ChildChildComponent = myra.define({}, ctx => {
            ctx.willUnmount = mountMock.unmount
            return () => <div />
        })

        const ChildComponent = myra.define({}, ctx => {
            ctx.willUnmount = mountMock.unmount
            return () => <ChildChildComponent />
        })

        const component = myra.define({}, () => () => <div><ChildComponent /></div>)

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

    it('does not call the willRender listener if the arguments has not changed', () => {
        const mock = {
            willRender: () => Promise.resolve({})
        }

        spyOn(mock, 'willRender').and.callThrough()

        const component = myra.define<{}, { val: number }>({}, ctx => {
            ctx.willRender = mock.willRender
            return () => <div />
        })

        const vNode = component({ val: 45 }, [])
        initComponent(vNode, document.body)
        updateComponent(component({ val: 45 }, []), vNode)

        expect(mock.willRender).toHaveBeenCalledTimes(1)
    })

    it('calls the willRender event if forceUpdate is true', () => {
        const mountMock = {
            mount: () => Promise.resolve({})
        }

        spyOn(mountMock, 'mount').and.callThrough()

        const component = myra.define({}, ctx => {
            ctx.willRender = mountMock.mount
            return () => <div />
        })

        const vNode = component({}, [])
        initComponent(vNode, document.body)

        const newVNode = component({ forceUpdate: true }, [])
        updateComponent(newVNode, vNode)

        expect(mountMock.mount).toHaveBeenCalledTimes(2)
    })

    it('calls the willRender event if the supplied arguments is not equal to the previous arguments', () => {
        const mountMock = {
            callback: () => Promise.resolve({})
        }

        spyOn(mountMock, 'callback').and.callThrough()

        const component = myra.define({}, ctx => {
            ctx.willRender = mountMock.callback
            return () => <div />
        })

        const vNode = component({ prop: 'a value' }, [])
        initComponent(vNode, document.body)

        const newVNode = component({ prop: 'a new value' }, [])
        updateComponent(newVNode, vNode)

        expect(mountMock.callback).toHaveBeenCalledTimes(2)
    })
})


describe('evolve', () => {
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

        const Component = myra.define({ val: 1 }, ctx => {
            const onclickUpdate = () => ctx.evolve(mocks.onclickUpdate)
            return () => <button id="postButton" onclick={onclickUpdate}></button>
        })


        myra.mount(<Component />, document.body)

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

        const Component = myra.define({ val: 1 }, ctx => state =>
            <button id="postButton2" onclick={() => ctx.evolve(mocks.onclickUpdate(state, { val: 2 }))}></button>
        )

        myra.mount(<Component />, document.body)

        const postBtn = document.getElementById('postButton2') as HTMLButtonElement
        postBtn.click()
        firstUpdate = false
        postBtn.click()

        expect(mocks.onclickUpdate).toHaveBeenCalledTimes(2)
    })
})