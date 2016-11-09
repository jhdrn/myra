import { dispatch } from 'core/dispatch'
import { evolve, NodeDescriptor } from 'core'
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
            state: 1,
            oldView: undefined,
            rootNode: document.body
        }
        const render = () => {
            return null as any as Node
        }

        expect(() => dispatch(context, render, update, 2)).toThrow()
    })

    it('call onBeforeRender if a listener is supplied', () => {
        const mock = {
            onBeforeRender: (nodeDescriptor: NodeDescriptor) => {
                expect(nodeDescriptor.__type).toBe('element')
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
            onAfterRender: (nodeDescriptor: NodeDescriptor) => {
                expect(nodeDescriptor.__type).toBe('element')
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
