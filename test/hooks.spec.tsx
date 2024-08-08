import { render } from '../src/component'
import { ComponentVNode, Ref } from '../src/contract'
import { useEffect, useErrorHandler, useLayoutEffect, useMemo, useRef, useState } from '../src/hooks'
import * as myra from '../src/myra'
import { expect } from 'chai'
import * as sinon from 'sinon'

const q = (x: string) => document.querySelector(x)

describe('useEffect', () => {

    it('is invoked every render if supplied with no argument', done => {
        const mock = sinon.spy({
            callback: () => { }
        })

        // Create a fake function that will be replaced by the real Evolve impl.
        let updateState: myra.Evolve<number> = function () { return 0 }
        const Component = () => {
            useEffect(mock.callback)
            updateState = useState(0)[1]

            return <div />
        }
        myra.mount(<Component />, document.body)

        // Trigger re-render
        updateState(1)

        requestAnimationFrame(() => {
            // Trigger re-render
            updateState(2)
            requestAnimationFrame(() => {
                expect(mock.callback.callCount).to.eq(3)

                done()
            })
        })
    })

    it('is cleaned up before every render if supplied with no argument', done => {
        const mock = sinon.spy({
            callback: () => {

            }
        })

        // Create a fake function that will be replaced by the real Evolve impl.
        let updateState: myra.Evolve<number> = function () { return 0 }
        const Component = () => {
            useEffect(() => mock.callback)
            updateState = useState(0)[1]

            return <div />
        }
        myra.mount(<Component />, document.body)

        // Trigger re-render
        updateState(1)
        requestAnimationFrame(() => {
            // Trigger re-render
            updateState(2)
            requestAnimationFrame(() => {

                // We need to use setTimeout as the effect is cleaned up asynchronously
                setTimeout(() => {
                    expect(mock.callback.callCount).to.eq(2)
                    done()
                }, 0)
            })
        })
    })

    it('handles error during cleanup', done => {
        const mock = sinon.spy({
            callback: () => {
                throw 'An error'
            }
        })

        const Component = () => {
            useEffect(() => mock.callback)
            return <div />
        }
        const componentInstance = <Component />
        render(document.body, [componentInstance], [])

        requestAnimationFrame(() => {
            render(document.body, [<nothing />], [componentInstance])
            requestAnimationFrame(() => {
                expect(mock.callback.callCount).to.eq(1)

                done()
            })
        })
    })

    it('is cleaned up before unmount if supplied with no argument', done => {
        const mock = sinon.spy({
            callback: () => { }
        })

        const Component = () => {
            useEffect(() => mock.callback)
            return <div />
        }
        const componentInstance = <Component />
        render(document.body, [componentInstance], [])

        requestAnimationFrame(() => {
            render(document.body, [<nothing />], [componentInstance])
            requestAnimationFrame(() => {
                expect(mock.callback.callCount).to.eq(1)

                done()
            })
        })
    })

    it('is cleaned up before unmount if supplied with argument', done => {
        const mock = sinon.spy({
            callback: () => { }
        })

        const Component = () => {
            useEffect(() => mock.callback, ['argument'])
            return <div />
        }
        const componentInstance = <Component />
        render(document.body, [componentInstance], [])

        requestAnimationFrame(() => {
            render(document.body, [<nothing />], [componentInstance])
            requestAnimationFrame(() => {
                expect(mock.callback.callCount).to.eq(1)

                done()
            })
        })
    })

    it('is invoked only once if supplied with the same argument', done => {
        const mock = sinon.spy({
            callback: () => { }
        })

        // Create a fake function that will be replaced by the real Evolve impl.
        let updateState: myra.Evolve<number> = function () { return 0 }
        const Component = () => {
            useEffect(mock.callback, [])
            updateState = useState(0)[1]

            return <div />
        }
        myra.mount(<Component />, document.body)

        // Trigger re-render
        updateState(1)
        requestAnimationFrame(() => {
            // Trigger re-render
            updateState(2)
            requestAnimationFrame(() => {
                expect(mock.callback.callCount).to.eq(1)

                done()
            })
        })
    })
})

describe('useLayoutEffect', () => {

    it('is invoked every render if supplied with no argument', done => {
        const mock = sinon.spy({
            callback: () => { }
        })

        // Create a fake function that will be replaced by the real Evolve impl.
        let updateState: myra.Evolve<number> = function () { return 0 }
        const Component = () => {
            useLayoutEffect(mock.callback)
            updateState = useState(0)[1]

            return <div />
        }
        myra.mount(<Component />, document.body)

        // Trigger re-render
        updateState(1)

        requestAnimationFrame(() => {
            // Trigger re-render
            updateState(2)
            expect(mock.callback.callCount).to.eq(2)

            done()
        })
    })

    it('is cleaned up before every render if supplied with no argument', done => {
        const mock = sinon.spy({
            callback: () => { }
        })

        // Create a fake function that will be replaced by the real Evolve impl.
        let updateState: myra.Evolve<number> = function () { return 0 }
        const Component = () => {
            useLayoutEffect(() => mock.callback)
            updateState = useState(0)[1]

            return <div />
        }
        myra.mount(<Component />, document.body)

        // Trigger re-render
        updateState(1)

        requestAnimationFrame(() => {
            // Trigger re-render
            updateState(2)
            requestAnimationFrame(() => {
                expect(mock.callback.callCount).to.eq(2)

                done()
            })
        })
    })

    it('is cleaned up before unmount if supplied with no argument', done => {
        const mock = sinon.spy({
            callback: () => { }
        })

        const Component = () => {
            useLayoutEffect(() => mock.callback)
            return <div />
        }
        const componentInstance = <Component />
        render(document.body, [componentInstance], [])

        render(document.body, [<nothing />], [componentInstance])

        setTimeout(() => {
            expect(mock.callback.callCount).to.eq(1)

            done()
        }, 0)
    })

    it('is cleaned up before unmount if supplied with argument', done => {
        const mock = sinon.spy({
            callback: () => { }
        })

        const Component = () => {
            useLayoutEffect(() => mock.callback, ['argument'])
            return <div />
        }
        const componentInstance = <Component />
        render(document.body, [componentInstance], [])

        render(document.body, [<nothing />], [componentInstance])

        setTimeout(() => {
            expect(mock.callback.callCount).to.eq(1)

            done()
        }, 0)
    })

    it('is invoked only once if supplied with the same argument', done => {
        const mock = sinon.spy({
            callback: () => { }
        })

        // Create a fake function that will be replaced by the real Evolve impl.
        let updateState: myra.Evolve<number> = function () { return 0 }
        const Component = () => {
            useLayoutEffect(mock.callback, [])
            updateState = useState(0)[1]

            return <div />
        }
        myra.mount(<Component />, document.body)

        updateState(1)

        requestAnimationFrame(() => {
            expect(mock.callback.callCount).to.eq(1)

            done()
        })
    })
})

describe('useMemo', () => {
    it('returns the same value when the inputs does not change', done => {

        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        let fn: Function

        const Component = () => {
            fn = useMemo(() => () => { }, 0)

            return <div />
        }
        const vNode = <Component />
        render(document.body, [vNode], [])

        setTimeout(() => {
            const firstFn = fn!

            setTimeout(() => {
                render(document.body, [<Component />], [vNode])

                expect(firstFn).to.be.eq(fn!)

                done()
            })
        })
    })

    it('returns a new value when the inputs does change', done => {

        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        let fn: Function

        const Component = (p: { input: number }) => {
            fn = useMemo(() => () => { }, p.input)

            return <div />
        }
        const vNode1 = <Component input={1} />
        render(document.body, [vNode1], [])

        setTimeout(() => {
            const firstFn = fn!

            setTimeout(() => {
                render(document.body, [<Component input={2} />], [vNode1])

                expect(firstFn).not.to.be.eq(fn!)

                done()
            })
        })
    })
})

describe('useRef', () => {
    it('returns an object when called', done => {

        let ref: Ref<undefined>

        const Component = () => {
            ref = useRef()

            return <div />
        }
        const vNode = <Component />
        render(document.body, [vNode], [])

        setTimeout(() => {
            expect(typeof ref).to.eq('object')

            done()
        })
    })

    it('is populated with the root element DOM node when supplied as a ref attribute', done => {

        let ref: Ref<HTMLDivElement>

        const Component = () => {
            ref = useRef()

            return <div ref={ref} />
        }
        const vNode = <Component />
        render(document.body, [vNode], [])

        setTimeout(() => {
            expect(ref.current).to.be.eq(vNode.domRef)

            done()
        })
    })
    it('is populated with a child element DOM node when supplied as a ref attribute', done => {

        let ref: Ref<HTMLDivElement>

        const Component = () => {
            ref = useRef()

            return <div><div ref={ref} /></div>
        }
        const vNode = <Component />
        render(document.body, [vNode], [])

        setTimeout(() => {
            expect(ref.current).to.be.eq(vNode.domRef.firstChild)

            done()
        })
    })

    it('takes the "current" value as an argument and sets it on the returned object', done => {

        let ref: Ref<string>

        const Component = () => {
            ref = useRef('foo')
            return <div />
        }
        const vNode = <Component />
        render(document.body, [vNode], [])

        setTimeout(() => {
            expect(ref.current).to.eq('foo')

            done()
        })
    })

    it('keeps the "current" value between renders', done => {

        let ref: Ref<string>

        const Component = () => {
            ref = useRef('foo')
            myra.useLayoutEffect(() => {
                ref.current = 'bar'
            })
            return <div />
        }
        const vNode = <Component />
        render(document.body, [vNode], [])

        requestAnimationFrame(() => {
            render(document.body, [<Component />], [vNode])
            expect(ref.current).to.eq('bar')

            done()
        })
    })

    it('returns an object that holds a mutable property named "current"', done => {

        let ref: Ref<string>

        const Component = () => {
            ref = useRef('foo')
            ref.current = 'bar'
            return <div />
        }
        const vNode = <Component />
        render(document.body, [vNode], [])

        setTimeout(() => {
            expect(ref.current).to.eq('bar')

            done()
        })
    })
})

describe('useErrorHandling', () => {
    it('calls the useErrorHandling listener on view rendering error', done => {
        const mock = sinon.spy({
            callback: () => <nothing />
        })

        const Component = () => {
            useErrorHandler(mock.callback)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            return <div>{(undefined as any).property}</div>
        }
        const vNode = <Component />
        render(document.body, [vNode], [])

        expect(vNode.domRef.nodeType).to.be.eq(Node.COMMENT_NODE)
        expect(vNode.domRef.textContent).to.be.eq('Nothing')
        expect(mock.callback.called).to.be.true

        done()
    })

    it('calls the useErrorHandling listener on effect error', done => {
        const mock = sinon.spy({
            callback: () => <nothing />
        })

        const Component = () => {

            myra.useEffect(() => {
                throw Error('Error!')
            })
            useErrorHandler(mock.callback)

            return <div></div>
        }

        const component = <Component />
        myra.mount(component, document.body)

        requestAnimationFrame(() => {
            const node = (component as ComponentVNode<unknown>).domRef!

            expect(node.nodeType).to.be.eq(Node.COMMENT_NODE)
            expect(node.textContent).to.be.eq('Nothing')
            expect(mock.callback.called).to.be.true

            done()
        })
    })


    it('calls the useErrorHandling listener on useLayoutEffect error', done => {
        const mock = sinon.spy({
            callback: () => <nothing />
        })

        const Component = () => {

            myra.useLayoutEffect(() => {
                throw Error()
            })
            useErrorHandler(mock.callback)

            return <div></div>
        }

        const component = <Component />

        render(document.body, [component], [])

        requestAnimationFrame(() => {
            const node = (component as ComponentVNode<unknown>).domRef!
            expect(node.nodeType).to.be.eq(Node.COMMENT_NODE)
            expect(node.textContent).to.be.eq('Nothing')
            expect(mock.callback.called).to.be.true

            done()
        })
    })

    it('calls the useErrorHandling listener on initialization error', done => {
        const mock = sinon.spy({
            callback: () => <nothing />
        })

        const Component = () => {

            useErrorHandler(mock.callback)

            throw Error()

            return <div></div>
        }

        const vNode = <Component />
        render(document.body, [vNode], [])

        expect(vNode.domRef.nodeType).to.be.eq(Node.COMMENT_NODE)
        expect(vNode.domRef.textContent).to.be.eq('Nothing')
        expect(mock.callback.called).to.be.true

        done()
    })

    it('calls the useErrorHandling listener on evolve error', done => {
        const mock = sinon.spy({
            callback: () => <nothing />
        })

        const Component = () => {

            useErrorHandler(mock.callback)

            const [, evolve] = useState({})

            function doEvolve() {
                evolve(() => {
                    throw Error()
                })
            }
            return <div onclick={doEvolve}></div>
        }

        const vNode = <Component />
        render(document.body, [vNode], [])
        vNode.domRef.click()
        requestAnimationFrame(() => {
            expect(mock.callback.called).to.be.true

            done()
        })
    })

    it('does not call the useErrorHandling listener on effect cleanup error', done => {
        const mock = sinon.spy({
            callback: () => <nothing />
        })

        const Component = () => {

            myra.useEffect(() => {
                return () => {
                    throw Error()
                }
            })
            useErrorHandler(mock.callback)

            return <div></div>
        }

        const vNode = <Component />
        render(document.body, [vNode], [])
        render(document.body, [<nothing />], [vNode])
        expect(vNode.domRef.nodeType).to.be.eq(Node.ELEMENT_NODE)
        expect(vNode.domRef.textContent).to.be.eq('')
        expect(mock.callback.called).not.to.be.true

        done()
    })

    it('passes on an exception up the component tree', done => {
        const mock = sinon.spy({
            callback: () => <nothing />
        })

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const SubComponent = () => <div>{(undefined as any).property}</div>

        const Component = () => {

            useErrorHandler(mock.callback)

            return <SubComponent />
        }

        render(document.body, [<Component />], [])

        expect(mock.callback.called).to.be.true

        done()
    })

    it('passes the children of a component to it view', done => {
        const viewMock = sinon.spy({
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            view: (p: any) => {
                expect(Array.isArray(p.children)).to.be.eq(true)
                return <div>{p.children}</div>
            }
        })

        const Component = viewMock.view

        const Parent = () =>
            <Component>
                <div id="divTestId" />
            </Component>


        render(document.body, [<Parent />], [])

        expect(q('#divTestId')).not.to.be.null

        expect(viewMock.view.callCount).to.be.eq(1)

        done()
    })
})

describe('useState', () => {
    it('returns the same evolve function subsequently', () => {
        const Component = () => {

            const [s, evolve] = useState(0)
            const ref = useRef(evolve)

            expect(ref.current).to.be.eq(evolve)
            if (s < 2) {
                evolve(s + 1)
            }
            return <div></div>
        }

        render(document.body, [<Component />], [])
    })

    it('lazily initializes the state if the initial state is a function', (done) => {
        let callCount = 0
        const Component = () => {

            const [s, evolve] = useState(() => {
                callCount++
                return 0
            })
            const ref = useRef(evolve)

            expect(ref.current).to.be.eq(evolve)
            if (s < 2) {
                evolve(s + 1)
            } else {
                expect(callCount).to.eq(1)
                done()
            }
            return <div></div>
        }

        render(document.body, [<Component />], [])
    })

    it('updates the state when an Update function in supplied', () => {
        let firstUpdate = true

        const mocks = sinon.spy({
            onclickUpdate: (state: { val: number }) => {
                if (firstUpdate) {
                    expect(state).to.deep.eq({ val: 1 })
                }
                else {
                    expect(state).to.deep.eq({ val: 2 })
                }
                return { val: 2 }
            }
        })

        const Component = () => {
            const [, evolve] = useState({ val: 1 })
            const onclickUpdate = () => evolve(mocks.onclickUpdate)
            return <button id="postButton" onclick={onclickUpdate}></button>
        }

        render(document.body, [<Component />], [])

        const postBtn = document.getElementById('postButton') as HTMLButtonElement
        postBtn.click()
        firstUpdate = false
        postBtn.click()

        expect(mocks.onclickUpdate.callCount).to.eq(2)
    })

    it('updates the state when an object in supplied', () => {
        let firstUpdate = true

        const mocks = sinon.spy({
            onclickUpdate: (s: { val: number }, newState: { val: number }) => {

                if (firstUpdate) {
                    expect(s).to.deep.eq({ val: 1 })
                }
                else {
                    expect(s).to.deep.eq({ val: 2 })
                }
                return newState
            }
        })

        const Component = () => {
            const [, evolve] = useState({ val: 1 })
            return <button id="postButton2" onclick={() => evolve(state => mocks.onclickUpdate(state, { val: 2 }))}></button>
        }

        render(document.body, [<Component />], [])

        const postBtn = document.getElementById('postButton2') as HTMLButtonElement
        postBtn.click()
        firstUpdate = false
        postBtn.click()

        expect(mocks.onclickUpdate.callCount).to.eq(2)
    })

    it('debounces multiple state updates into a single render', (done) => {

        let setStateOuter: myra.Evolve<number> = function () { return 0 }
        const Component = () => {

            const [s, setState] = useState(0)
            setStateOuter = setState
            return <span>{s.toString()}</span>
        }

        const vNode = <Component />
        render(document.body, [vNode], [])


        setStateOuter(1)
        setStateOuter(2)
        requestAnimationFrame(() => {
            expect(vNode.domRef.textContent).to.eq('2')
            done()
        })

    })
})