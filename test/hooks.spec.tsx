import { render } from '../src/component'
import { ComponentVNode, Ref } from '../src/contract'
import { useEffect, useErrorHandler, useLayoutEffect, useMemo, useRef, useState } from '../src/hooks'
import * as myra from '../src/myra'

const q = (x: string) => document.querySelector(x)

describe('useEffect', () => {

    it('is invoked every render if supplied with no argument', done => {
        const mock = {
            callback: () => { }
        }

        spyOn(mock, 'callback').and.callThrough()

        // Create a fake function that will be replaced by the real Evolve impl.
        let updateState: myra.Evolve<number> = function () { return 0 }
        const Component = () => {
            useEffect(mock.callback)
            updateState = useState(0)[1]

            return <div />
        }
        myra.mount(<Component />, document.body)

        requestAnimationFrame(() => {
            // Trigger re-render
            updateState(1)

            requestAnimationFrame(() => {
                // Trigger re-render
                updateState(2)
                requestAnimationFrame(() => {
                    expect(mock.callback).toHaveBeenCalledTimes(2)

                    done()
                })
            })
        })
    })

    it('is cleaned up before every render if supplied with no argument', done => {
        const mock = {
            callback: () => {

            }
        }

        spyOn(mock, 'callback').and.callThrough()
        // Create a fake function that will be replaced by the real Evolve impl.
        let updateState: myra.Evolve<number> = function () { return 0 }
        const Component = () => {
            useEffect(() => mock.callback)
            updateState = useState(0)[1]

            return <div />
        }
        myra.mount(<Component />, document.body)

        requestAnimationFrame(() => {
            // Trigger re-render
            updateState(1)
            requestAnimationFrame(() => {
                // Trigger re-render
                updateState(2)
                requestAnimationFrame(() => {

                    // We need to use setTimeout as the effect is cleaned up asynchronously
                    setTimeout(() => {
                        expect(mock.callback).toHaveBeenCalledTimes(2)
                        done()
                    }, 0)
                })
            })
        })
    })

    it('handles error during cleanup', done => {
        const mock = {
            callback: () => {
                throw 'An error'
            }
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = () => {
            useEffect(() => mock.callback)
            return <div />
        }
        const componentInstance = <Component />
        render(document.body, [componentInstance], [])

        requestAnimationFrame(() => {
            render(document.body, [<nothing />], [componentInstance])
            requestAnimationFrame(() => {
                expect(mock.callback).toHaveBeenCalledTimes(1)

                done()
            })
        })
    })

    it('is cleaned up before unmount if supplied with no argument', done => {
        const mock = {
            callback: () => { }
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = () => {
            useEffect(() => mock.callback)
            return <div />
        }
        const componentInstance = <Component />
        render(document.body, [componentInstance], [])

        requestAnimationFrame(() => {
            render(document.body, [<nothing />], [componentInstance])
            requestAnimationFrame(() => {
                expect(mock.callback).toHaveBeenCalledTimes(1)

                done()
            })
        })
    })

    it('is cleaned up before unmount if supplied with argument', done => {
        const mock = {
            callback: () => { }
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = () => {
            useEffect(() => mock.callback, [])
            return <div />
        }
        const componentInstance = <Component />
        render(document.body, [componentInstance], [])

        requestAnimationFrame(() => {
            render(document.body, [<nothing />], [componentInstance])
            requestAnimationFrame(() => {
                expect(mock.callback).toHaveBeenCalledTimes(1)

                done()
            })
        })
    })

    it('is invoked only once if supplied with the same argument', done => {
        const mock = {
            callback: () => { }
        }

        spyOn(mock, 'callback').and.callThrough()

        // Create a fake function that will be replaced by the real Evolve impl.
        let updateState: myra.Evolve<number> = function () { return 0 }
        const Component = () => {
            useEffect(mock.callback, [])
            updateState = useState(0)[1]

            return <div />
        }
        myra.mount(<Component />, document.body)

        requestAnimationFrame(() => {
            // Trigger re-render
            updateState(1)
            requestAnimationFrame(() => {
                // Trigger re-render
                updateState(2)
                requestAnimationFrame(() => {
                    expect(mock.callback).toHaveBeenCalledTimes(1)

                    done()
                })
            })
        })
    })
})

describe('useLayoutEffect', () => {

    it('is invoked every render if supplied with no argument', done => {
        const mock = {
            callback: () => { }
        }

        spyOn(mock, 'callback').and.callThrough()

        // Create a fake function that will be replaced by the real Evolve impl.
        let updateState: myra.Evolve<number> = function () { return 0 }
        const Component = () => {
            useLayoutEffect(mock.callback)
            updateState = useState(0)[1]

            return <div />
        }
        myra.mount(<Component />, document.body)

        requestAnimationFrame(() => {
            // Trigger re-render
            updateState(1)

            requestAnimationFrame(() => {
                // Trigger re-render
                updateState(2)
                expect(mock.callback).toHaveBeenCalledTimes(2)

                done()
            })
        })
    })

    it('is cleaned up before every render if supplied with no argument', done => {
        const mock = {
            callback: () => { }
        }

        spyOn(mock, 'callback').and.callThrough()

        // Create a fake function that will be replaced by the real Evolve impl.
        let updateState: myra.Evolve<number> = function () { return 0 }
        const Component = () => {
            useLayoutEffect(() => mock.callback)
            updateState = useState(0)[1]

            return <div />
        }
        myra.mount(<Component />, document.body)

        requestAnimationFrame(() => {
            // Trigger re-render
            updateState(1)

            requestAnimationFrame(() => {
                // Trigger re-render
                updateState(2)
                requestAnimationFrame(() => {
                    expect(mock.callback).toHaveBeenCalledTimes(2)

                    done()
                })
            })
        })
    })

    it('is cleaned up before unmount if supplied with no argument', done => {
        const mock = {
            callback: () => { }
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = () => {
            useLayoutEffect(() => mock.callback)
            return <div />
        }
        const componentInstance = <Component />
        render(document.body, [componentInstance], [])

        render(document.body, [<nothing />], [componentInstance])

        setTimeout(() => {
            expect(mock.callback).toHaveBeenCalledTimes(1)

            done()
        }, 0)
    })

    it('is cleaned up before unmount if supplied with argument', done => {
        const mock = {
            callback: () => { }
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = () => {
            useLayoutEffect(() => mock.callback, [])
            return <div />
        }
        const componentInstance = <Component />
        render(document.body, [componentInstance], [])

        render(document.body, [<nothing />], [componentInstance])

        setTimeout(() => {
            expect(mock.callback).toHaveBeenCalledTimes(1)

            done()
        }, 0)
    })

    it('is invoked only once if supplied with the same argument', done => {
        const mock = {
            callback: () => { }
        }

        spyOn(mock, 'callback').and.callThrough()

        // Create a fake function that will be replaced by the real Evolve impl.
        let updateState: myra.Evolve<number> = function () { return 0 }
        const Component = () => {
            useLayoutEffect(mock.callback, [])
            updateState = useState(0)[1]

            return <div />
        }
        myra.mount(<Component />, document.body)

        requestAnimationFrame(() => {
            updateState(1)
            requestAnimationFrame(() => {
                expect(mock.callback).toHaveBeenCalledTimes(1)

                done()
            })
        })
    })
})

describe('useMemo', () => {
    it('returns the same value when the inputs does not change', done => {
        const mock = {
            callback: () => { }
        }

        spyOn(mock, 'callback').and.callThrough()

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

                expect(firstFn).toBe(fn!)

                done()
            })
        })
    })

    it('returns a new value when the inputs does change', done => {
        const mock = {
            callback: () => { }
        }

        spyOn(mock, 'callback').and.callThrough()

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

                expect(firstFn).not.toBe(fn!)

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
            expect(typeof ref).toEqual('object')

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
            expect(ref.current).toBe(vNode.domRef)

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
            expect(ref.current).toBe(vNode.domRef.firstChild)

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
            expect(ref.current).toEqual('foo')

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
            expect(ref.current).toEqual('bar')

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
            expect(ref.current).toEqual('bar')

            done()
        })
    })
})

describe('useErrorHandling', () => {
    it('calls the useErrorHandling listener on view rendering error', done => {
        const mock = {
            callback: () => <nothing />
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = () => {
            useErrorHandler(mock.callback)
            return <div>{(undefined as any).property}</div>
        }
        const vNode = <Component />
        render(document.body, [vNode], [])

        expect(vNode.domRef.nodeType).toBe(Node.COMMENT_NODE)
        expect(vNode.domRef.textContent).toBe('Nothing')
        expect(mock.callback).toHaveBeenCalled()

        done()
    })

    it('calls the useErrorHandling listener on effect error', done => {
        const mock = {
            callback: () => <nothing />
        }

        spyOn(mock, 'callback').and.callThrough()

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
            // Need to request another frame as the effect is triggered async 
            // after the first render.
            requestAnimationFrame(() => {
                const node = (component as ComponentVNode<any>).domRef!

                expect(node.nodeType).toBe(Node.COMMENT_NODE)
                expect(node.textContent).toBe('Nothing')
                expect(mock.callback).toHaveBeenCalled()

                done()
            })
        })
    })


    it('calls the useErrorHandling listener on useLayoutEffect error', done => {
        const mock = {
            callback: () => <nothing />
        }

        spyOn(mock, 'callback').and.callThrough()

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
            const node = (component as ComponentVNode<any>).domRef!
            expect(node.nodeType).toBe(Node.COMMENT_NODE)
            expect(node.textContent).toBe('Nothing')
            expect(mock.callback).toHaveBeenCalled()

            done()
        })
    })

    it('calls the useErrorHandling listener on initialization error', done => {
        const mock = {
            callback: () => <nothing />
        }

        spyOn(mock, 'callback').and.callThrough()

        const Component = () => {

            useErrorHandler(mock.callback)

            throw Error()

            return <div></div>
        }

        const vNode = <Component />
        render(document.body, [vNode], [])

        expect(vNode.domRef.nodeType).toBe(Node.COMMENT_NODE)
        expect(vNode.domRef.textContent).toBe('Nothing')
        expect(mock.callback).toHaveBeenCalled()

        done()
    })

    it('calls the useErrorHandling listener on evolve error', done => {
        const mock = {
            callback: () => <nothing />
        }

        spyOn(mock, 'callback').and.callThrough()

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
            expect(mock.callback).toHaveBeenCalled()

            done()
        })
    })

    it('does not call the useErrorHandling listener on effect cleanup error', done => {
        const mock = {
            callback: () => <nothing />
        }

        spyOn(mock, 'callback').and.callThrough()

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
        expect(vNode.domRef.nodeType).toBe(Node.ELEMENT_NODE)
        expect(vNode.domRef.textContent).toBe('')
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

            useErrorHandler(mock.callback)

            return <SubComponent />
        }

        render(document.body, [<Component />], [])

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


        render(document.body, [<Parent />], [])

        expect(q('#divTestId')).not.toBeNull()

        expect(viewMock.view).toHaveBeenCalledTimes(1)

        done()
    })
})

describe('useState', () => {
    it('returns the same evolve function subsequently', () => {
        const Component = () => {

            const [s, evolve] = useState(0)
            const ref = useRef(evolve)

            expect(ref.current).toBe(evolve)
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

            expect(ref.current).toBe(evolve)
            if (s < 2) {
                evolve(s + 1)
            } else {
                expect(callCount).toEqual(1)
                done()
            }
            return <div></div>
        }

        render(document.body, [<Component />], [])
    })

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
            const [, evolve] = useState({ val: 1 })
            const onclickUpdate = () => evolve(mocks.onclickUpdate)
            return <button id="postButton" onclick={onclickUpdate}></button>
        }

        render(document.body, [<Component />], [])

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
            const [, evolve] = useState({ val: 1 })
            return <button id="postButton2" onclick={() => evolve(state => mocks.onclickUpdate(state, { val: 2 }))}></button>
        }

        render(document.body, [<Component />], [])

        const postBtn = document.getElementById('postButton2') as HTMLButtonElement
        postBtn.click()
        firstUpdate = false
        postBtn.click()

        expect(mocks.onclickUpdate).toHaveBeenCalledTimes(2)
    })

    it('debounces multiple state updates into a single render', (done) => {

        let setStateOuter: myra.Evolve<number> = function () { return 0 }
        const Component = () => {

            let [s, setState] = useState(0)
            setStateOuter = setState
            return <span>{s.toString()}</span>
        }

        const vNode = <Component />
        render(document.body, [vNode], [])

        requestAnimationFrame(() => {

            setStateOuter(1)
            setStateOuter(2)
            requestAnimationFrame(() => {
                expect(vNode.domRef.textContent).toEqual('2')
                done()
            })
        })

    })
})