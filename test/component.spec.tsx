import * as myra from '../src/myra'
import { render } from '../src/component'
import { ComponentVNode } from '../src/myra'

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
})

describe('useLifecycle', () => {
    it('calls the willMount listener', done => {
        const mock = {
            callback: () => { }
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = myra.withContext((_p, ctx) => {
            ctx.useLifecycle(ev => ev === 'willMount' && mock.callback())
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
            ctx.useLifecycle(ev => ev === 'didMount' && mock.callback())
            return <div />
        })

        render(document.body, <Component />, undefined, undefined)

        setTimeout(() => {
            expect(mock.callback).toHaveBeenCalled()

            done()
        }, 0)
    })

    it('calls the willRender listener', done => {
        const mock = {
            callback: () => { }
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = myra.withContext((_p, ctx) => {
            ctx.useLifecycle(ev => ev === 'willRender' && mock.callback())
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
            ctx.useLifecycle(ev => ev === 'didRender' && mock.callback())
            return <div />
        })

        render(document.body, <Component />, undefined, undefined)

        setTimeout(() => {
            expect(mock.callback).toHaveBeenCalled()

            done()
        }, 0)
    })

    it('calls the willUnmount listener', () => {
        const mock = {
            unmount: () => { }
        }

        spyOn(mock, 'unmount').and.callThrough()

        const Component = myra.withContext((_p, ctx) => {
            ctx.useLifecycle(ev => ev === 'willUnmount' && mock.unmount())
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
            ctx.useLifecycle(ev => ev === 'willUnmount' && mock.unmount())
            return <div />
        })

        const ChildComponent = myra.withContext((_p, ctx) => {
            ctx.useLifecycle(ev => ev === 'willUnmount' && mock.unmount())
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
            ctx.useLifecycle(ev => ev === 'willUnmount' && mock.unmount())
            return <div />
        })

        const ChildComponent = myra.withContext((_p, ctx) => {
            ctx.useLifecycle(ev => ev === 'willUnmount' && mock.unmount())
            return <ChildChildComponent />
        })

        const StateLessComponent = () => <ChildComponent />

        const component = () => <div><StateLessComponent /></div>

        const instance = component()
        const domNode = render(document.body, instance, undefined, undefined)
        render(document.body, <div></div>, instance, domNode)

        expect(mock.unmount).toHaveBeenCalledTimes(2)
    })

    it('calls a function that captures a new variable', done => {
        const mock = {
            callback: () => { }
        }

        spyOn(mock, 'callback').and.callThrough()

        type Props = {
            test: boolean
        }

        const Component = myra.withContext<Props>(({ test }, ctx) => {
            ctx.useLifecycle(ev => ev === 'willRender' && test && mock.callback())
            return <div />
        })

        render(document.body, <Component test={true} />, undefined, undefined)
        render(document.body, <Component test={false} />, undefined, undefined)

        expect(mock.callback).toHaveBeenCalledTimes(1)

        done()
    })
})

describe('useErrorHandling', () => {
    it('calls the useErrorHandling listener on view rendering error', done => {
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

    it('calls the useErrorHandling listener on didMount error', done => {
        const mock = {
            callback: () => <nothing />
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = myra.withContext((_p, ctx) => {

            ctx.useLifecycle(ev => {
                if (ev === 'didMount') {
                    throw Error()
                }
            })
            ctx.useErrorHandler(mock.callback)

            return <div></div>
        })

        const component = <Component />

        render(document.body, component, undefined, undefined)

        setTimeout(() => {
            const node = (component as ComponentVNode<any>).domRef!
            expect(node.nodeType).toBe(Node.COMMENT_NODE)
            expect(node.textContent).toBe('Nothing')
            expect(mock.callback).toHaveBeenCalled()

            done()

        }, 0)
    })


    it('calls the useErrorHandling listener on didRender error', done => {
        const mock = {
            callback: () => <nothing />
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = myra.withContext((_p, ctx) => {

            ctx.useLifecycle(ev => {
                if (ev === 'didRender') {
                    throw Error()
                }
            })
            ctx.useErrorHandler(mock.callback)

            return <div></div>
        })

        const component = <Component />

        render(document.body, component, undefined, undefined)

        setTimeout(() => {
            const node = (component as ComponentVNode<any>).domRef!
            expect(node.nodeType).toBe(Node.COMMENT_NODE)
            expect(node.textContent).toBe('Nothing')
            expect(mock.callback).toHaveBeenCalled()

            done()
        }, 0)
    })

    it('calls the useErrorHandling listener on initialization error', done => {
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

    it('calls the useErrorHandling listener on evolve error', done => {
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

    it('calls the useErrorHandling listener on useRenderDecision error', done => {
        const mock = {
            callback: () => <nothing />
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = myra.withContext((_p, ctx) => {
            ctx.useErrorHandler(mock.callback)
            ctx.useRenderDecision(() => {
                throw Error()
            })
            return <div></div>
        })

        const node = render(document.body, <Component />, undefined, undefined)

        expect(node.nodeType).toBe(Node.COMMENT_NODE)
        expect(node.textContent).toBe('Nothing')
        expect(mock.callback).toHaveBeenCalled()

        done()
    })

    it('calls the useErrorHandling listener on willMount error', done => {
        const mock = {
            callback: () => <nothing />
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = myra.withContext((_p, ctx) => {

            ctx.useLifecycle(ev => {
                if (ev === 'willMount') {
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

    it('calls the useErrorHandling listener on willRender error', done => {
        const mock = {
            callback: () => <nothing />
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = myra.withContext((_p, ctx) => {

            ctx.useLifecycle(ev => {
                if (ev === 'willRender') {
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

    it('does not call the useErrorHandling listener on willUnmount error', done => {
        const mock = {
            callback: () => <nothing />
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = myra.withContext((_p, ctx) => {

            ctx.useLifecycle(ev => {
                if (ev === 'willUnmount') {
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
})

/**
 * updateComponent
 */
describe('component render', () => {

    it('does not call the willRender listener if the props has not changed', () => {
        const mock = {
            willRender: () => { }
        }

        spyOn(mock, 'willRender').and.callThrough()

        const Component = myra.withContext((_p: { val: number }, ctx) => {
            ctx.useLifecycle(ev => ev === 'willRender' && mock.willRender())
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
            ctx.useLifecycle(ev => ev === 'willRender' && mock.callback())
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
            ctx.useLifecycle(ev => ev === 'willRender' && mock.callback())
            return <div />
        })

        const vNode = <Component prop="a value" />
        const domNode = render(document.body, vNode, undefined, undefined)

        const newVNode = <Component prop="a new value" />
        render(document.body, newVNode, vNode, domNode)

        expect(mock.callback).toHaveBeenCalledTimes(2)
    })

    it('passes old and new props to useRenderDecision', done => {
        const mock = {
            useRenderDecision: (oldProps: { a?: number }, newProps: { a?: number }) => {
                if (oldProps.a === undefined) {
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

        spyOn(mock, 'useRenderDecision').and.callThrough()
        interface Props { a?: number }

        myra.withContext<Props>((_props, context) => {
            const [uiState, evolveUi] = context.useState(['string'])
            // context.useDefaultProps({ foo: 'foo' })
            context.useRenderDecision(mock.useRenderDecision)
            evolveUi([])
            return (
                <div>
                    {uiState.map(s => s)}
                </div>
            )
        })

        const Component = myra.withContext((_p: { a?: number }, ctx) => {
            // ctx.useDefaultProps({
            //     a: 0
            // })
            ctx.useRenderDecision(mock.useRenderDecision)
            return <div />
        })

        const vNode = <Component a={1} />
        const domNode = render(document.body, vNode, undefined, undefined)

        const newVNode = <Component a={2} />
        render(document.body, newVNode, vNode, domNode)

    })

    it('calls the willRender listener if shouldRender returns true', () => {
        const mock = {
            willRender: () => { }
        }

        spyOn(mock, 'willRender').and.callThrough()

        const Component = myra.withContext((_p: { forceUpdate?: boolean }, ctx) => {
            ctx.useRenderDecision(() => true)
            ctx.useLifecycle(ev => ev === 'willRender' && mock.willRender())
            return <div />
        })

        const vNode = <Component />
        const domNode = render(document.body, vNode, undefined, undefined)

        const newVNode = <Component forceUpdate />
        render(document.body, newVNode, vNode, domNode)

        expect(mock.willRender).toHaveBeenCalledTimes(2)
    })

    it('does not call the willRender listener if shouldRender returns false', () => {
        const mock = {
            willRender: () => { }
        }

        spyOn(mock, 'willRender').and.callThrough()

        const Component = myra.withContext((_p: { forceUpdate?: boolean }, ctx) => {
            ctx.useRenderDecision(() => false)
            ctx.useLifecycle(ev => ev === 'willRender' && mock.willRender)
            return <div />
        })

        const vNode = <Component />
        const domNode = render(document.body, vNode, undefined, undefined)

        const newVNode = <Component forceUpdate />
        render(document.body, newVNode, vNode, domNode)

        expect(mock.willRender).not.toHaveBeenCalled()
    })

    it('does not call the willRender listener if the children has not changed', () => {
        const mock = {
            callback: () => { }
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = myra.withContext((props, ctx) => {
            ctx.useLifecycle(ev => ev === 'willRender' && mock.callback())
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
            ctx.useLifecycle(ev => ev === 'willRender' && mock.callback())
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