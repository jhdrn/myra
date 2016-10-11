import { dispatch } from 'core/dispatch'
import { task, evolve } from 'core'
import { text } from 'html'
/**
 * evolve
 */
describe('core.dispatch', () => {
    it('updates state and calls render', () => {
        const update = (x: number, arg: number) => evolve(x + arg)
        const context = {
            name: '',
            view: () => text('a text'),
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
            name: '',
            view: () => text('a text'),
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
            name: '',
            view: () => text('a text'),
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

    it('updates state and executes task', () => {
        const testTask = task(dispatch => {
            expect(dispatch).toBeDefined()
        })

        const update = (x: number, arg: number) => evolve(x + arg, testTask)
        const context = {
            name: '',
            view: () => text('a text'),
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


    it('updates state and executes array of tasks', () => {
        const testTask1 = task(dispatch => {
            expect(dispatch).toBeDefined()
        })
        const testTask2 = task(dispatch => {
            expect(dispatch).toBeDefined()
        })
        const update = (x: number, arg: number) => evolve(x + arg, testTask1, testTask2)
        const context = {
            name: '',
            view: () => text('a text'),
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
})
