import * as myra from '../src/myra'
import { render } from '../src/component'
import { VNode, StatelessComponentVNode, Context } from '../src/contract'

const q = (x: string) => document.querySelector(x)

/**
 * define
 */
describe('define', () => {
    it('the "ctx" object is passed', (done) => {

        const Component = () => {
            const ctx = myra.useContext({})
            expect(ctx).toBeDefined()
            expect(typeof ctx === 'object').toBeTruthy()
            done()
            return <div />
        }

        myra.mount(<Component />, document.body)
    })
})

/**
 * mount
 */
describe('mount', () => {

    it('mounts the component', done => {

        const Component = () => <div id="root" />

        myra.mount(<Component />, document.body)

        const rootNode = q('#root')

        expect(rootNode).not.toBeNull()

        done()
    })

    it('mounts a stateless component', done => {

        const Component = () => <div id="stateless-root" />

        myra.mount(<Component />, document.body)

        const rootNode = q('#stateless-root')

        expect(rootNode).not.toBeNull()

        done()
    })

    it('mounts any JSX element', done => {

        myra.mount(<div id="root" />, document.body)

        const rootNode = q('#root')

        expect(rootNode).not.toBeNull()

        done()
    })

    it('calls the willMount listener', done => {
        const mock = {
            callback: () => { }
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = () => {
            myra.useContext({
                didMount: mock.callback
            })
            return <div />
        }

        myra.mount(<Component />, document.body)

        expect(mock.callback).toHaveBeenCalled()

        done()
    })

    it('calls the didMount listener', done => {
        const mock = {
            callback: () => { }
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = () => {
            myra.useContext({
                didMount: mock.callback
            })
            return <div />
        }

        myra.mount(<Component />, document.body)

        expect(mock.callback).toHaveBeenCalled()

        done()
    })

    it('calls the willRender listener', done => {
        const mock = {
            callback: () => { }
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = () => {
            myra.useContext({
                didMount: mock.callback
            })
            return <div />
        }

        myra.mount(<Component />, document.body)

        expect(mock.callback).toHaveBeenCalled()

        done()
    })

    it('calls the didRender listener', done => {
        const mock = {
            callback: () => { }
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = () => {
            myra.useContext({
                didMount: mock.callback
            })
            return <div />
        }

        myra.mount(<Component />, document.body)

        expect(mock.callback).toHaveBeenCalled()

        done()
    })

    it('calls the onError listener on view rendering error', done => {
        const mock = {
            callback: () => <nothing />
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = () => {
            myra.useContext({
                didMount: mock.callback
            })
            return <div>{(undefined as any).property}</div>
        }

        const node = render(document.body, <Component />, undefined, undefined)

        expect(node.nodeType).toBe(Node.COMMENT_NODE)
        expect(node.textContent).toBe('Nothing')
        expect(mock.callback).toHaveBeenCalled()

        done()
    })

    it('calls the onError listener on didMount error', done => {
        const mock = {
            callback: () => <nothing />
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = () => {
            myra.useContext({
                didMount: () => {
                    throw Error()
                },
                onError: mock.callback
            })
            return <div></div>
        }

        const node = render(document.body, <Component />, undefined, undefined)

        expect(node.nodeType).toBe(Node.COMMENT_NODE)
        expect(node.textContent).toBe('Nothing')
        expect(mock.callback).toHaveBeenCalled()

        done()
    })


    it('calls the onError listener on didRender error', done => {
        const mock = {
            callback: () => <nothing />
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = () => {
            myra.useContext({
                didRender: () => {
                    throw Error()
                },
                onError: mock.callback
            })
            return <div></div>
        }

        const node = render(document.body, <Component />, undefined, undefined)

        expect(node.nodeType).toBe(Node.COMMENT_NODE)
        expect(node.textContent).toBe('Nothing')
        expect(mock.callback).toHaveBeenCalled()

        done()
    })

    it('calls the onError listener on initialization error', done => {
        const mock = {
            callback: () => <nothing />
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = () => {
            myra.useContext({
                onError: mock.callback
            })
            throw Error()

            return <div></div>
        }

        const node = render(document.body, <Component />, undefined, undefined)

        expect(node.nodeType).toBe(Node.COMMENT_NODE)
        expect(node.textContent).toBe('Nothing')
        expect(mock.callback).toHaveBeenCalled()

        done()
    })

    it('calls the onError listener on evolve error', done => {
        const mock = {
            callback: () => <nothing />
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = () => {
            const ctx = myra.useContext({
                onError: mock.callback
            })
            function doEvolve() {
                ctx.evolve(() => {
                    throw Error()
                })
            }
            return <div onclick={doEvolve}></div>
        }

        const node = render(document.body, <Component />, undefined, undefined) as HTMLDivElement
        node.click()

        expect(mock.callback).toHaveBeenCalled()

        done()
    })

    it('calls the onError listener on shouldRender error', done => {
        const mock = {
            callback: () => <nothing />
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = () => {
            myra.useContext({
                onError: mock.callback,
                shouldRender: () => {
                    throw Error()
                }
            })
            return <div></div>
        }

        const node = render(document.body, <Component />, undefined, undefined)

        expect(node.nodeType).toBe(Node.COMMENT_NODE)
        expect(node.textContent).toBe('Nothing')
        expect(mock.callback).toHaveBeenCalled()

        done()
    })

    it('calls the onError listener on willMount error', done => {
        const mock = {
            callback: () => <nothing />
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = () => {
            myra.useContext({
                onError: mock.callback,
                willMount: () => {
                    throw Error()
                }
            })
            return <div></div>
        }

        const node = render(document.body, <Component />, undefined, undefined)

        expect(node.nodeType).toBe(Node.COMMENT_NODE)
        expect(node.textContent).toBe('Nothing')
        expect(mock.callback).toHaveBeenCalled()

        done()
    })

    it('calls the onError listener on willRender error', done => {
        const mock = {
            callback: () => <nothing />
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = () => {
            myra.useContext({
                onError: mock.callback,
                willRender: () => {
                    throw Error()
                }
            })
            return <div></div>
        }

        const node = render(document.body, <Component />, undefined, undefined)

        expect(node.nodeType).toBe(Node.COMMENT_NODE)
        expect(node.textContent).toBe('Nothing')
        expect(mock.callback).toHaveBeenCalled()

        done()
    })

    it('does not call the onError listener on willUnmount error', done => {
        const mock = {
            callback: () => <nothing />
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = () => {
            myra.useContext({
                onError: mock.callback,
                willUnmount: () => {
                    throw Error()
                }
            })
            return <div></div>
        }

        const node = render(document.body, <Component />, undefined, undefined)

        expect(node.nodeType).toBe(Node.ELEMENT_NODE)
        expect(node.textContent).toBe('')
        expect(mock.callback).not.toHaveBeenCalled()

        done()
    })

    it('passes on an exception up the component tree', done => {
        const mock = {
            callback: () => <nothing />
        }

        spyOn(mock, 'callback').and.callThrough()

        const SubComponent = () => <div>{(undefined as any).property}</div>


        const Component = () => {
            myra.useContext({
                onError: mock.callback
            })
            return <SubComponent />
        }

        myra.mount(<Component />, document.body)

        expect(mock.callback).toHaveBeenCalled()

        done()
    })

    it(`passes the children of a component to it view`, done => {
        const viewMock = {
            view: (_p: any, children: any) => {
                expect(Array.isArray(children)).toBe(true)
                return <div>{children}</div>
            }
        }

        spyOn(viewMock, 'view').and.callThrough()

        const Component = viewMock.view

        const Parent = () =>
            <Component>
                <div id="divTestId" />
            </Component>


        myra.mount(<Parent />, document.body)

        expect(q('#divTestId')).not.toBeNull()

        expect(viewMock.view).toHaveBeenCalledTimes(1)

        done()
    })

    it('merges defaultProps with received props', done => {
        const mock = {
            callback: ({ props }: Context<{}, { a?: string, b?: number }>) => {
                expect(props.a).toBe('test')
                expect(props.b).toBe(123)

                done()
            }
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = (_p: { a?: string, b?: number }) => {
            myra.useContext({
                defaultProps: {
                    a: 'foo',
                    b: 123
                },
                willMount: mock.callback
            })
            return <div />
        }

        myra.mount(<Component a="test" />, document.body)

        expect(mock.callback).toHaveBeenCalled()
    })
})


/**
 * unmountComponent
 */
describe('unmountComponent', () => {

    it('calls the willUnmount listener', () => {
        const mock = {
            unmount: () => { }
        }

        spyOn(mock, 'unmount').and.callThrough()

        const Component = () => {
            myra.useContext({
                defaultProps: {
                    a: 'foo',
                    b: 123
                },
                willUnmount: mock.unmount
            })
            return <div />
        }

        const instance = <Component />

        const domNode = render(document.body, instance, undefined, undefined)
        render(document.body, <div></div>, instance, domNode)

        expect(mock.unmount).toHaveBeenCalledTimes(1)
    })

    it('calls the willUnmount listener on child components', () => {
        const mountMock = {
            unmount: () => { }
        }

        spyOn(mountMock, 'unmount').and.callThrough()

        const ChildChildComponent = () => {
            myra.useContext({
                willUnmount: mountMock.unmount
            })
            return <div />
        }

        const ChildComponent = () => {
            myra.useContext({
                willUnmount: mountMock.unmount
            })
            return <ChildChildComponent />
        }

        const component = () => <div><ChildComponent /></div>

        const instance = component()
        const domNode = render(document.body, instance, undefined, undefined)
        render(document.body, <div></div>, instance, domNode)

        expect(mountMock.unmount).toHaveBeenCalledTimes(2)
    })

    it('calls the willUnmount listener on child components of a stateless component', () => {
        const mountMock = {
            unmount: () => { }
        }

        spyOn(mountMock, 'unmount').and.callThrough()

        const ChildChildComponent = () => {
            myra.useContext({
                willUnmount: mountMock.unmount
            })
            return <div />
        }

        const ChildComponent = () => {
            myra.useContext({
                willUnmount: mountMock.unmount
            })
            return <ChildChildComponent />
        }

        const StateLessComponent = () => <ChildComponent />

        const component = () => <div><StateLessComponent /></div>

        const instance = component()
        const domNode = render(document.body, instance, undefined, undefined)
        render(document.body, <div></div>, instance, domNode)

        expect(mountMock.unmount).toHaveBeenCalledTimes(2)
    })
})

/**
 * updateComponent
 */
describe('updateComponent (stateful component)', () => {

    it('does not call the willRender listener if the props has not changed', () => {
        const mock = {
            willRender: () => { }
        }

        spyOn(mock, 'willRender').and.callThrough()

        const component = (_p: { val: number }) => {
            myra.useContext({
                willRender: mock.willRender
            })
            return <div />
        }

        const vNode = component({ val: 45 })
        const domNode = render(document.body, vNode, undefined, undefined)
        render(document.body, component({ val: 45 }) as any, vNode as any, domNode)

        expect(mock.willRender).toHaveBeenCalledTimes(1)
    })

    it('calls the willRender listener if forceUpdate is true', () => {
        const mock = {
            callback: () => { }
        }

        spyOn(mock, 'callback').and.callThrough()

        const component = (_p: { forceUpdate?: boolean }) => {
            myra.useContext({
                willRender: mock.callback
            })
            return <div />
        }

        const vNode = component({})
        const domNode = render(document.body, vNode, undefined, undefined)
        const newVNode = component({ forceUpdate: true })
        render(document.body, newVNode, vNode, domNode)

        expect(mock.callback).toHaveBeenCalledTimes(2)
    })

    it('calls the willRender listener if the supplied props are not equal to the previous props', () => {
        const mock = {
            callback: () => { }
        }

        spyOn(mock, 'callback').and.callThrough()

        const component = (_p: { prop: string }) => {
            myra.useContext({
                willRender: mock.callback
            })
            return <div />
        }

        const vNode = component({ prop: 'a value' })
        const domNode = render(document.body, vNode, undefined, undefined)

        const newVNode = component({ prop: 'a new value' })
        render(document.body, newVNode, vNode, domNode)

        expect(mock.callback).toHaveBeenCalledTimes(2)
    })

    it('passes old and new props to shouldRender', done => {
        const mock = {
            shouldRender: (oldProps: { a?: number }, newProps: { a?: number }) => {
                if (oldProps.a === 0) {
                    expect(newProps.a).toBe(1)
                }
                else {
                    expect(oldProps.a).toBe(1)
                    expect(newProps.a).toBe(2)
                    done()
                }
                return true
            }
        }

        spyOn(mock, 'shouldRender').and.callThrough()

        myra.component<Props>((props, children, context) => {
            const [uiState, evolveUi] = context.useState(initUi)

        })

        const component = (_p: { a?: number }) => {
            myra.useContext({
                defaultProps: {
                    a: 0
                },
                shouldRender: mock.shouldRender
            })
            return <div />
        }

        const vNode = component({ a: 1 })
        const domNode = render(document.body, vNode, undefined, undefined)

        const newVNode = component({ a: 2 })
        render(document.body, newVNode, vNode, domNode)

    })

    it('calls the willRender listener if shouldRender returns true', () => {
        const mock = {
            willRender: () => { }
        }

        spyOn(mock, 'willRender').and.callThrough()

        const component = (_p: { forceUpdate?: boolean }) => {
            myra.useContext({
                shouldRender: () => true,
                willRender: mock.willRender
            })
            return <div />
        }

        const vNode = component({})
        const domNode = render(document.body, vNode, undefined, undefined)

        const newVNode = component({ forceUpdate: true })
        render(document.body, newVNode, vNode, domNode)

        expect(mock.willRender).toHaveBeenCalledTimes(2)
    })

    it('does not call the willRender listener if shouldRender returns false', () => {
        const mock = {
            willRender: () => { }
        }

        spyOn(mock, 'willRender').and.callThrough()

        const component = (_p: { forceUpdate?: boolean }) => {
            myra.useContext({
                shouldRender: () => false,
                willRender: mock.willRender
            })
            return <div />
        }

        const vNode = component({})
        const domNode = render(document.body, vNode, undefined, undefined)

        const newVNode = component({ forceUpdate: true })
        render(document.body, newVNode, vNode, domNode)

        expect(mock.willRender).not.toHaveBeenCalled()
    })

    it('does not call the willRender listener if the children has not changed', () => {
        const mock = {
            callback: () => { }
        }

        spyOn(mock, 'callback').and.callThrough()

        const component = (_p: {}, children: myra.VNode[]) => {
            myra.useContext({
                willRender: mock.callback
            })
            return <div>{...children}</div>
        }

        const vNode = myra.h(component, {}, 'Child A')
        const domNode = render(document.body, vNode, undefined, undefined)

        const newVNode = myra.h(component, {}, 'Child A')
        render(document.body, newVNode, vNode, domNode)

        expect(mock.callback).toHaveBeenCalledTimes(1)
    })

    it('calls the willRender event if the supplied children are not equal to the previous children', () => {
        const mock = {
            callback: () => { }
        }

        spyOn(mock, 'callback').and.callThrough()

        const component = (_p: {}, children: myra.VNode[]) => {
            myra.useContext({
                willRender: mock.callback
            })
            return <div>{...children}</div>
        }

        const vNode = myra.h(component, {}, 'Child A')
        const domNode = render(document.body, vNode, undefined, undefined)

        const newVNode = myra.h(component, {}, 'Child B')
        render(document.body, newVNode, vNode, domNode)

        expect(mock.callback).toHaveBeenCalledTimes(2)
    })
})

describe('updateComponent (stateless component)', () => {

    it('does not update a stateless component if the props has not changed', () => {

        const component = (_props: { val: number }, _: VNode[]) => <div>A</div>
        // This is actually a new component, but functions are treated as equal anyway
        const component2 = (_props: { val: number }, _: VNode[]) => <div>B</div>

        const vNode = myra.h(component, { val: 45 }, 'Child') as StatelessComponentVNode<any>
        const domNode = render(document.body, vNode, undefined, undefined)

        const newVNode = myra.h(component2, { val: 45 }, 'Child') as StatelessComponentVNode<any>
        render(document.body, newVNode, vNode, domNode)

        expect(newVNode.rendition!.domRef!.childNodes.item(0).textContent).toBe('A')

    })

    it('updates the stateless component if forceUpdate is true', () => {
        const component = (_props: { forceUpdate: boolean }, _: VNode[]) => <div>A</div>
        // This is actually a new component, but functions are treated as equal anyway
        const component2 = (_props: { forceUpdate: boolean }, _: VNode[]) => <div>B</div>

        const vNode = myra.h(component, { forceUpdate: true }, 'Child') as StatelessComponentVNode<any>
        const domNode = render(document.body, vNode, undefined, undefined)

        const newVNode = myra.h(component2, { forceUpdate: true }, 'Child') as StatelessComponentVNode<any>
        render(document.body, newVNode, vNode, domNode)

        expect(newVNode.rendition!.domRef!.childNodes.item(0).textContent).toBe('B')
    })

    it('updates the stateless component if the supplied props are not equal to the previous props', () => {
        const component = (_props: { val: number }, _: VNode[]) => <div>A</div>
        // This is actually a new component, but functions are treated as equal anyway
        const component2 = (_props: { val: number }, _: VNode[]) => <div>B</div>

        const vNode = myra.h(component, { val: 1 }, 'Child') as StatelessComponentVNode<any>
        const domNode = render(document.body, vNode, undefined, undefined)

        const newVNode = myra.h(component2, { val: 2 }, 'Child') as StatelessComponentVNode<any>
        render(document.body, newVNode, vNode, domNode)

        expect(newVNode.rendition!.domRef!.childNodes.item(0).textContent).toBe('B')
    })

    it('does not update a stateless component if the children has not changed', () => {
        const component = (_props: { val: number }, _: VNode[]) => <div>A</div>
        // This is actually a new component, but functions are treated as equal anyway
        const component2 = (_props: { val: number }, _: VNode[]) => <div>B</div>

        const vNode = myra.h(component, { val: 45 }, 'Child') as StatelessComponentVNode<any>
        const domNode = render(document.body, vNode, undefined, undefined)

        const newVNode = myra.h(component2, { val: 45 }, 'Child') as StatelessComponentVNode<any>
        render(document.body, newVNode, vNode, domNode)

        expect(newVNode.rendition!.domRef!.childNodes.item(0).textContent).toBe('A')
    })

    it('updates the stateless component if the supplied children are not equal to the previous children', () => {
        const component = (_props: { val: number }, _: VNode[]) => <div>A</div>
        // This is actually a new component, but functions are treated as equal anyway
        const component2 = (_props: { val: number }, _: VNode[]) => <div>B</div>

        const vNode = myra.h(component, { val: 45 }, 'Child A') as StatelessComponentVNode<any>
        const domNode = render(document.body, vNode, undefined, undefined)

        const newVNode = myra.h(component2, { val: 45 }, 'Child B') as StatelessComponentVNode<any>
        render(document.body, newVNode, vNode, domNode)

        expect(newVNode.rendition!.domRef!.childNodes.item(0).textContent).toBe('B')
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

        const Component = () => {
            const ctx = myra.useContext({
                state: { val: 1 }
            })
            const onclickUpdate = () => ctx.evolve(mocks.onclickUpdate)
            return <button id="postButton" onclick={onclickUpdate}></button>
        }


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

        const Component = () => {
            const ctx = myra.useContext({
                state: { val: 1 }
            })
            return <button id="postButton2" onclick={() => ctx.evolve(state => mocks.onclickUpdate(state, { val: 2 }))}></button>
        }

        myra.mount(<Component />, document.body)

        const postBtn = document.getElementById('postButton2') as HTMLButtonElement
        postBtn.click()
        firstUpdate = false
        postBtn.click()

        expect(mocks.onclickUpdate).toHaveBeenCalledTimes(2)
    })
})