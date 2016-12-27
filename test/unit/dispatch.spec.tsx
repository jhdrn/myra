import { dispatch } from 'core/dispatch'
import { evolve, VNode, Apply } from 'core'
import * as jsxFactory from 'core/jsxFactory'

/**
 * evolve
 */
describe('core.dispatch', () => {
    it('updates state and calls render', () => {
        const update = (x: number, arg: number) => evolve(x + arg)
        const context = {
            spec: {
                name: '',
                init: { state: undefined },
                view: () => <div>a text</div>
            },
            parentNode: document.body,
            mounted: false,
            mountArg: undefined,
            dispatchLevel: 0,
            isUpdating: false,
            props: undefined,
            state: 1,
            oldView: undefined,
            rootNode: document.body
        }
        const render = () => {
            expect(context.state).toBe(2)
            return null as any as Node
        }
        dispatch(context, render, update, 2)
    })

    it('does not call render if dispatchLevel > 1', () => {
        const update = (x: number, arg: number) => evolve(x + arg)
        const context = {
            spec: {
                name: '',
                init: { state: undefined },
                view: () => <div>a text</div>
            },
            parentNode: document.body,
            mounted: false,
            mountArg: undefined,
            dispatchLevel: 1,
            isUpdating: false,
            props: undefined,
            state: undefined,
            oldView: undefined,
            rootNode: document.body
        }
        const renderMock = {
            render: () => {
                return null as any as Node
            }
        }

        spyOn(renderMock, 'render')

        dispatch(context, renderMock.render, update, 2)

        expect(renderMock.render).not.toHaveBeenCalled()
    })

    it('throws if already updating', () => {
        const update = (x: number, arg: number) => evolve(x + arg)
        const context = {
            spec: {
                name: '',
                init: { state: undefined },
                view: () => <div>a text</div>
            },
            parentNode: document.body,
            mounted: false,
            mountArg: undefined,
            dispatchLevel: 0,
            isUpdating: true,
            props: undefined,
            state: 1,
            oldView: undefined,
            rootNode: document.body
        }
        const render = () => {
            return null as any as Node
        }

        expect(() => dispatch(context, render, update, 2)).toThrow()
    })

    it('throws if Update result is not an object', () => {
        const update = () => undefined
        const context = {
            spec: {
                name: '',
                init: { state: undefined },
                view: () => <div>a text</div>
            },
            parentNode: document.body,
            mounted: false,
            mountArg: undefined,
            dispatchLevel: 0,
            isUpdating: true,
            state: 1,
            oldView: undefined,
            rootNode: document.body
        }
        const render = () => {
            return null as any as Node
        }

        expect(() => dispatch(context as any, render, update as any, 2)).toThrow()
    })

    it('invokes effects with an Apply function', () => {

        const mockEffects = {
            effect1: (apply: Apply) => {
                expect(apply).toBeDefined()
            },
            effect2: (apply: Apply) => {
                expect(apply).toBeDefined()
            }
        }

        spyOn(mockEffects, 'effect1')
        spyOn(mockEffects, 'effect2')

        const update = (x: number, arg: number) =>
            evolve(x + arg).and(mockEffects.effect1, mockEffects.effect2)

        const context = {
            spec: {
                name: '',
                init: { state: undefined },
                view: () => <div>a text</div>
            },
            parentNode: document.body,
            mounted: false,
            mountArg: undefined,
            dispatchLevel: 0,
            isUpdating: false,
            props: undefined,
            state: 1,
            oldView: undefined,
            rootNode: document.body
        }
        const render = () => null as any as Node

        dispatch(context, render, update, 2)

        expect(mockEffects.effect1).toHaveBeenCalledTimes(1)
        expect(mockEffects.effect2).toHaveBeenCalledTimes(1)
    })

    it('call onBeforeRender if a listener is supplied', () => {
        const mock = {
            onBeforeRender: (vNode: VNode) => {
                expect(vNode.__type).toBe(2)
            }
        }
        spyOn(mock, 'onBeforeRender').and.callThrough()

        const update = (x: number, arg: number) => evolve(x + arg)
        const context = {
            spec: {
                name: '',
                init: { state: undefined },
                view: () => <div>a text</div>,
                onBeforeRender: mock.onBeforeRender
            },
            parentNode: document.body,
            mounted: true,
            mountArg: undefined,
            dispatchLevel: 0,
            isUpdating: false,
            props: undefined,
            state: 1,
            oldView: undefined,
            rootNode: document.body
        }
        const render = () => {
            return null as any as Node
        }
        dispatch(context, render, update, 2)

        expect(mock.onBeforeRender).toHaveBeenCalledTimes(1)
    })

    it('call onAfterRender if a listener is supplied', () => {
        const mock = {
            onAfterRender: (vNode: VNode) => {
                expect(vNode.__type).toBe(2)
            }
        }
        spyOn(mock, 'onAfterRender').and.callThrough()

        const update = (x: number, arg: number) => evolve(x + arg)
        const context = {
            spec: {
                name: '',
                init: { state: undefined },
                view: () => <div>a text</div>,
                onAfterRender: mock.onAfterRender
            },
            parentNode: document.body,
            mounted: true,
            mountArg: undefined,
            dispatchLevel: 0,
            isUpdating: false,
            props: undefined,
            state: 1,
            oldView: undefined,
            rootNode: document.body
        }
        const render = () => {
            return null as any as Node
        }
        dispatch(context, render, update, 2)

        expect(mock.onAfterRender).toHaveBeenCalledTimes(1)
    })
})
