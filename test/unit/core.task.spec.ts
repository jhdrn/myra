import { task, Update, Dispatch } from 'core'

/**
 * evolve
 */
describe('core.task', () => {
    it('creates a task', () => {
        expect(task(x => x).execute).toBeDefined()
    })

    it('executes correctly', () => {
        const t = task((dispatch: Dispatch) => {
            dispatch((x: number) => x + 1)
        })

        t.execute((fn: Update<number, any>) => {
            const result = fn(1)
            expect(result).toBe(2)
        })
    })

})
