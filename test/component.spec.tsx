import * as myra from '../src/myra'
import { render } from '../src/component'

const q = (x: string) => document.querySelector(x)

/**
 * define
 */
describe('define', () => {
    it('the "ctx" object is passed', (done) => {

        const Component = myra.withContext((_props, ctx) => {
            expect(ctx).toBeDefined()
            expect(typeof ctx === 'object').toBeTruthy()
            done()
            return <div />
        })

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

        requestAnimationFrame(() => {
            const rootNode = q('#root')

            expect(rootNode).not.toBeNull()

            done()
        })
    })

    it('mounts any JSX element', done => {

        myra.mount(<div id="root" />, document.body)

        requestAnimationFrame(() => {
            const rootNode = q('#root')

            expect(rootNode).not.toBeNull()

            done()
        })
    })

    it('calls the willMount listener', done => {
        const mock = {
            callback: () => { }
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = myra.withContext((_p, ctx) => {
            ctx.useLifeCycle(ev => ev.type === 'willMount' && mock.callback())
            return <div />
        })

        render(document.body, <Component />, undefined, undefined)

        expect(mock.callback).toHaveBeenCalled()

        done()
    })

    it('calls the didMount listener', done => {
        const mock = {
            callback: () => { }
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = myra.withContext((_p, ctx) => {
            ctx.useLifeCycle(ev => ev.type === 'didMount' && mock.callback())
            return <div />
        })

        render(document.body, <Component />, undefined, undefined)

        expect(mock.callback).toHaveBeenCalled()

        done()
    })

    it('calls the willRender listener', done => {
        const mock = {
            callback: () => { }
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = myra.withContext((_p, ctx) => {
            ctx.useLifeCycle(ev => ev.type === 'willRender' && mock.callback())
            return <div />
        })

        render(document.body, <Component />, undefined, undefined)

        expect(mock.callback).toHaveBeenCalled()

        done()
    })

    it('calls the didRender listener', done => {
        const mock = {
            callback: () => { }
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = myra.withContext((_p, ctx) => {
            ctx.useLifeCycle(ev => ev.type === 'didRender' && mock.callback())
            return <div />
        })

        render(document.body, <Component />, undefined, undefined)

        expect(mock.callback).toHaveBeenCalled()

        done()
    })

    it('calls the onError listener on view rendering error', done => {
        const mock = {
            callback: () => <nothing />
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = myra.withContext((_p, ctx) => {
            ctx.useErrorHandler(mock.callback)
            return <div>{(undefined as any).property}</div>
        })

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

        const Component = myra.withContext((_p, ctx) => {

            ctx.useLifeCycle(ev => {
                if (ev.type === 'didMount') {
                    throw Error()
                }
            })
            ctx.useErrorHandler(mock.callback)

            return <div></div>
        })

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

        const Component = myra.withContext((_p, ctx) => {

            ctx.useLifeCycle(ev => {
                if (ev.type === 'didRender') {
                    throw Error()
                }
            })
            ctx.useErrorHandler(mock.callback)

            return <div></div>
        })

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

        const Component = myra.withContext((_p, ctx) => {

            ctx.useErrorHandler(mock.callback)

            throw Error()

            return <div></div>
        })

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

        const Component = myra.withContext((_p, ctx) => {

            ctx.useErrorHandler(mock.callback)

            const [, evolve] = ctx.useState({})

            function doEvolve() {
                evolve(() => {
                    throw Error()
                })
            }
            return <div onclick={doEvolve}></div>
        })

        const node = render(document.body, <Component />, undefined, undefined) as HTMLDivElement
        node.click()
        requestAnimationFrame(() => {
            expect(mock.callback).toHaveBeenCalled()

            done()
        })
    })

    // it('calls the onError listener on shouldRender error', done => {
    //     const mock = {
    //         callback: () => <nothing />
    //     }

    //     spyOn(mock, 'callback').and.callThrough()

    //     const Component = () => {
    //         myra.useContext({
    //             onError: mock.callback,
    //             shouldRender: () => {
    //                 throw Error()
    //             }
    //         })
    //         return <div></div>
    //     }

    //     const node = render(document.body, <Component />, undefined, undefined)

    //     expect(node.nodeType).toBe(Node.COMMENT_NODE)
    //     expect(node.textContent).toBe('Nothing')
    //     expect(mock.callback).toHaveBeenCalled()

    //     done()
    // })

    it('calls the onError listener on willMount error', done => {
        const mock = {
            callback: () => <nothing />
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = myra.withContext((_p, ctx) => {

            ctx.useLifeCycle(ev => {
                if (ev.type === 'willMount') {
                    throw Error()
                }
            })
            ctx.useErrorHandler(mock.callback)

            return <div></div>
        })

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

        const Component = myra.withContext((_p, ctx) => {

            ctx.useLifeCycle(ev => {
                if (ev.type === 'willRender') {
                    throw Error()
                }
            })
            ctx.useErrorHandler(mock.callback)

            return <div></div>
        })

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

        const Component = myra.withContext((_p, ctx) => {

            ctx.useLifeCycle(ev => {
                if (ev.type === 'willUnmount') {
                    throw Error()
                }
            })
            ctx.useErrorHandler(mock.callback)

            return <div></div>
        })

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

        const Component = myra.withContext((_p, ctx) => {

            ctx.useErrorHandler(mock.callback)

            return <SubComponent />
        })

        render(document.body, <Component />, undefined, undefined)

        expect(mock.callback).toHaveBeenCalled()

        done()
    })

    it(`passes the children of a component to it view`, done => {
        const viewMock = {
            view: (p: any) => {
                expect(Array.isArray(p.children)).toBe(true)
                return <div>{p.children}</div>
            }
        }

        spyOn(viewMock, 'view').and.callThrough()

        const Component = viewMock.view

        const Parent = () =>
            <Component>
                <div id="divTestId" />
            </Component>


        render(document.body, <Parent />, undefined, undefined)

        expect(q('#divTestId')).not.toBeNull()

        expect(viewMock.view).toHaveBeenCalledTimes(1)

        done()
    })

    it('merges defaultProps with received props', done => {

        const Component = myra.withContext((_p: { a?: string, b?: number }, ctx) => {
            const props = ctx.useDefaultProps({
                a: 'foo',
                b: 123
            })
            expect(props.a).toBe('test')
            expect(props.b).toBe(123)

            done()
            return <div />
        })

        myra.mount(<Component a="test" />, document.body)
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

        const Component = myra.withContext((_p, ctx) => {
            ctx.useLifeCycle(ev => ev.type === 'willUnmount' && mock.unmount())
            return <div />
        })

        const instance = <Component />

        const domNode = render(document.body, instance, undefined, undefined)
        render(document.body, <div></div>, instance, domNode)

        expect(mock.unmount).toHaveBeenCalledTimes(1)
    })

    it('calls the willUnmount listener on child components', () => {
        const mock = {
            unmount: () => { }
        }

        spyOn(mock, 'unmount').and.callThrough()

        const ChildChildComponent = myra.withContext((_p, ctx) => {
            ctx.useLifeCycle(ev => ev.type === 'willUnmount' && mock.unmount())
            return <div />
        })

        const ChildComponent = myra.withContext((_p, ctx) => {
            ctx.useLifeCycle(ev => ev.type === 'willUnmount' && mock.unmount())
            return <ChildChildComponent />
        })

        const component = () => <div><ChildComponent /></div>

        const instance = component()
        const domNode = render(document.body, instance, undefined, undefined)
        render(document.body, <div></div>, instance, domNode)

        expect(mock.unmount).toHaveBeenCalledTimes(2)
    })

    it('calls the willUnmount listener on child components of a component', () => {
        const mock = {
            unmount: () => { }
        }

        spyOn(mock, 'unmount').and.callThrough()

        const ChildChildComponent = myra.withContext((_p, ctx) => {
            ctx.useLifeCycle(ev => ev.type === 'willUnmount' && mock.unmount())
            return <div />
        })

        const ChildComponent = myra.withContext((_p, ctx) => {
            ctx.useLifeCycle(ev => ev.type === 'willUnmount' && mock.unmount())
            return <ChildChildComponent />
        })

        const StateLessComponent = () => <ChildComponent />

        const component = () => <div><StateLessComponent /></div>

        const instance = component()
        const domNode = render(document.body, instance, undefined, undefined)
        render(document.body, <div></div>, instance, domNode)

        expect(mock.unmount).toHaveBeenCalledTimes(2)
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

        const Component = myra.withContext((_p: { val: number }, ctx) => {
            ctx.useLifeCycle(ev => ev.type === 'willRender' && mock.willRender())
            return <div />
        })

        const vNode = <Component val={45} />
        const domNode = render(document.body, vNode, undefined, undefined)
        render(document.body, <Component val={45} />, vNode, domNode)

        expect(mock.willRender).toHaveBeenCalledTimes(1)
    })

    it('calls the willRender listener if forceUpdate is true', () => {
        const mock = {
            callback: () => { }
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = myra.withContext((_p: { forceUpdate?: boolean }, ctx) => {
            ctx.useLifeCycle(ev => ev.type === 'willRender' && mock.callback())
            return <div />
        })

        const vNode = <Component />
        const domNode = render(document.body, vNode, undefined, undefined)
        const newVNode = <Component forceUpdate />
        render(document.body, newVNode, vNode, domNode)

        expect(mock.callback).toHaveBeenCalledTimes(2)
    })

    it('calls the willRender listener if the supplied props are not equal to the previous props', () => {
        const mock = {
            callback: () => { }
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = myra.withContext((_p: { prop: string }, ctx) => {
            ctx.useLifeCycle(ev => ev.type === 'willRender' && mock.callback())
            return <div />
        })

        const vNode = <Component prop="a value" />
        const domNode = render(document.body, vNode, undefined, undefined)

        const newVNode = <Component prop="a new value" />
        render(document.body, newVNode, vNode, domNode)

        expect(mock.callback).toHaveBeenCalledTimes(2)
    })

    // it('passes old and new props to shouldRender', done => {
    //     const mock = {
    //         shouldRender: (oldProps: { a?: number }, newProps: { a?: number }) => {
    //             if (oldProps.a === 0) {
    //                 expect(newProps.a).toBe(1)
    //             }
    //             else {
    //                 expect(oldProps.a).toBe(1)
    //                 expect(newProps.a).toBe(2)
    //                 done()
    //             }
    //             return true
    //         }
    //     }

    //     spyOn(mock, 'shouldRender').and.callThrough()
    //     interface Props {

    //     }
    //     myra.withContext<Props>((_props, _children, context) => {
    //         const [uiState, evolveUi] = context.useState(['string'])
    //         context.useDefaultProps({ foo: 'foo' })
    //         evolveUi([])
    //         return (
    //             <div>
    //                 {uiState.map(s => s)}
    //             </div>
    //         )
    //     })

    //     const Component = myra.withContext((_p: { a?: number }, ctx) => {
    //         ctx.useDefaultProps({
    //             a: 0
    //         })
    //         ctx.shouldRender: mock.shouldRender
    //         return <div />
    //     })

    //     const vNode = <Component a={1} />
    //     const domNode = render(document.body, vNode, undefined, undefined)

    //     const newVNode = <Component a={2} />
    //     render(document.body, newVNode, vNode, domNode)

    // })

    // it('calls the willRender listener if shouldRender returns true', () => {
    //     const mock = {
    //         willRender: () => { }
    //     }

    //     spyOn(mock, 'willRender').and.callThrough()

    //     const Component = myra.withContext((_p: { forceUpdate?: boolean }, ctx) => {
    //         ctx.shouldRender: mock.shouldRender
    //         ctx.useEvent('willRender', mock.willRender)
    //         return <div />
    //     })

    //     const vNode = <Component />
    //     const domNode = render(document.body, vNode, undefined, undefined)

    //     const newVNode = <Component forceUpdate />
    //     render(document.body, newVNode, vNode, domNode)

    //     expect(mock.willRender).toHaveBeenCalledTimes(2)
    // })

    // it('does not call the willRender listener if shouldRender returns false', () => {
    //     const mock = {
    //         willRender: () => { }
    //     }

    //     spyOn(mock, 'willRender').and.callThrough()

    //     const Component = myra.withContext((_p: { forceUpdate?: boolean }, ctx) => {
    //         ctx.shouldRender: mock.shouldRender
    //         ctx.useEvent('willRender', mock.willRender)
    //         return <div />
    //     })

    //     const vNode = <Component />
    //     const domNode = render(document.body, vNode, undefined, undefined)

    //     const newVNode = <Component forceUpdate />
    //     render(document.body, newVNode, vNode, domNode)

    //     expect(mock.willRender).not.toHaveBeenCalled()
    // })

    it('does not call the willRender listener if the children has not changed', () => {
        const mock = {
            callback: () => { }
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = myra.withContext((props, ctx) => {
            ctx.useLifeCycle(ev => ev.type === 'willRender' && mock.callback())
            return <div>{...props.children}</div>
        })

        const vNode = <Component>Child A</Component>
        const domNode = render(document.body, vNode, undefined, undefined)

        const newVNode = <Component>Child A</Component>
        render(document.body, newVNode, vNode, domNode)

        expect(mock.callback).toHaveBeenCalledTimes(1)
    })

    it('calls the willRender event if the supplied children are not equal to the previous children', () => {
        const mock = {
            callback: () => { }
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = myra.withContext((props, ctx) => {
            ctx.useLifeCycle(ev => ev.type === 'willRender' && mock.callback())
            return <div>{...props.children}</div>
        })

        const vNode = <Component>Child A</Component>
        const domNode = render(document.body, vNode, undefined, undefined)

        const newVNode = <Component>Child B</Component>
        render(document.body, newVNode, vNode, domNode)

        expect(mock.callback).toHaveBeenCalledTimes(2)
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

        const Component = myra.withContext((_props, ctx) => {
            const [, evolve] = ctx.useState({ val: 1 })
            const onclickUpdate = () => evolve(mocks.onclickUpdate)
            return <button id="postButton" onclick={onclickUpdate}></button>
        })


        render(document.body, <Component />, undefined, undefined)

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

        const Component = myra.withContext((_props, ctx) => {
            const [, evolve] = ctx.useState({ val: 1 })
            return <button id="postButton2" onclick={() => evolve(state => mocks.onclickUpdate(state, { val: 2 }))}></button>
        })

        render(document.body, <Component />, undefined, undefined)

        const postBtn = document.getElementById('postButton2') as HTMLButtonElement
        postBtn.click()
        firstUpdate = false
        postBtn.click()

        expect(mocks.onclickUpdate).toHaveBeenCalledTimes(2)
    })
})