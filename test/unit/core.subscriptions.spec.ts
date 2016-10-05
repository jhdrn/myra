import { defineComponent, broadcast, mount } from 'core'
import { div } from 'html/elements' 

/**
 * defineComponent
 */
describe('core.subscriptions.broadcast', () => {
    it('calls subscriptions', () => {

        const subscriptions = {
            test1: (x: number, arg: string) => {
                console.log('wtf')
                expect(arg).toBe('testdata1')
                return x
            },
            test2: (x: number) => x
        }

        spyOn(subscriptions, 'test1')
        spyOn(subscriptions, 'test2')

        const component = defineComponent({
            name: 'TestComponent',
            init: 0,
            subscriptions: subscriptions,
            view: () => div()
        })

        mount(component, document.body)

        broadcast('test1', 'testdata1').execute((_: any) => {
        })
        broadcast('test2', undefined).execute((_: any) => {
        })

        expect(subscriptions.test1).toHaveBeenCalledTimes(1)
        expect(subscriptions.test2).toHaveBeenCalledTimes(1)
    })
})