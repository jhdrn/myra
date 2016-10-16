import { defineComponent, broadcast, mountComponent, evolve } from 'core'
import { div } from 'html/elements'

/**
 * defineComponent
 */
describe('core.subscriptions.broadcast', () => {
    it('calls subscriptions', () => {

        const subscriptions = {
            test1: (x: number, arg: string) => {
                expect(arg).toBe('testdata1')
                return evolve(x)
            },
            test2: (x: number) => evolve(x)
        }

        spyOn(subscriptions, 'test1').and.callThrough()
        spyOn(subscriptions, 'test2').and.callThrough()

        const component = defineComponent({
            name: 'TestComponent',
            init: evolve(0),
            subscriptions: subscriptions,
            view: () => div()
        })

        mountComponent(component, document.body)

        broadcast('test1', 'testdata1').execute((_: any) => {
        })
        broadcast('test2', undefined).execute((_: any) => {
        })

        expect(subscriptions.test1).toHaveBeenCalledTimes(1)
        expect(subscriptions.test2).toHaveBeenCalledTimes(1)
    })
})