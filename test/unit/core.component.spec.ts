import { defineComponent, mountComponent } from 'core'
import { initComponent, updateComponent } from 'core/component'
import { div, button } from 'html/elements' 

const q = (x: string) => document.querySelector(x)

const randomName = () => Math.random().toString()

/**
 * defineComponent
 */
describe('core.defineComponent', () => {
    const componentName = randomName()
    const component1 = defineComponent({
        name: componentName,
        init: undefined,
        view: () => div()
    })

    it('has a name', () => {
        expect(component1().name).toBe(componentName)
    })

    it('throws if a component with the same name is already defined', () => {
        expect(() => defineComponent({
            name: componentName,
            init: undefined,
            view: () => div()
        })).toThrow()
    })
})

/**
 * mountComponent
 */
describe('mountComponent', () => {

    it('mounts the compontent', () => {

        const component = defineComponent({
            name: randomName(),
            init: undefined,
            view: () => div({
                id: 'root'
            })
        })

        mountComponent(component, document.body)

        const rootNode = q('#root')
        
        expect(rootNode).not.toBeNull()
    })

    it('calls the mount function', () => {
        const mountMock = {
            mount: (x: number) => x
        }

        spyOn(mountMock, 'mount')

        const component = defineComponent({
            name: randomName(),
            init: 0,
            mount: mountMock.mount,
            view: () => div()
        })

        mountComponent(component, document.body)

        expect(mountMock.mount).toHaveBeenCalled()
    })

    
    it('calls the subscribe function if supplied with subscriptions', () => {
        const mountMock = {
            mount: (x: number) => x
        }

        spyOn(mountMock, 'mount')

        const component = defineComponent({
            name: randomName(),
            init: 0,
            mount: mountMock.mount,
            subscriptions: {
                'test1': x => x,
                'test2': x => x
            },
            view: () => div()
        })

        mountComponent(component, document.body)

        expect(mountMock.mount).toHaveBeenCalled()
    })

    it(`calls the parent's dispatch function if an update function is passed to and called from a child`, () => {
        
        const updateMock = {
            update: (x: number) => {
                expect(x).toBe(22)
                return x
            }
        }

        spyOn(updateMock, 'update').and.callThrough()

        const component = defineComponent<any, any>({
            name: randomName(),
            init: undefined,
            mount: (_m, a) => a,
            view: (m) => button({ onclick: m.onclick, id: 'childBtn'})
        })

        const parent = defineComponent({
            name: randomName(),
            init: 22,
            view: () => component({ onclick: updateMock.update })
        })

        mountComponent(parent, document.body)

        ;(q('#childBtn') as HTMLButtonElement).click()

        expect(updateMock.update).toHaveBeenCalledTimes(1)
    })

    it(`passes the children of a component to it view`, () => {
        const viewMock = {
            view: (_: any, children: any) => {
                expect(Array.isArray(children)).toBe(true)
                return div(children)
            }
        }

        spyOn(viewMock, 'view').and.callThrough()

        const component = defineComponent<any, any>({
            name: randomName(),
            init: undefined,
            view: viewMock.view
        })

        const parent = defineComponent({
            name: randomName(),
            init: 22,
            view: () => component(undefined, undefined, [div({ id: 'divTestId' })])
        })

        mountComponent(parent, document.body)

        expect(q('#divTestId')).not.toBeNull()

        expect(viewMock.view).toHaveBeenCalledTimes(1)
    })
})

/**
 * updateComponent
 */
describe('updateComponent', () => {

    it('does not call the mount function if the arguments has not changed', () => {
        const mountMock = {
            mount: (x: number) => x
        }

        spyOn(mountMock, 'mount')

        const component = defineComponent({
            name: randomName(),
            init: 0,
            mount: mountMock.mount,
            view: () => div()
        })

        const componentDescriptor = component(45)
        initComponent(componentDescriptor, document.body, undefined as any)
        updateComponent(component(45), componentDescriptor)

        expect(mountMock.mount).toHaveBeenCalledTimes(1)
    })

    it('calls the mount function if forceMount is true', () => {
        const mountMock = {
            mount: (x: number) => x
        }

        spyOn(mountMock, 'mount')

        const component = defineComponent({
            name: randomName(),
            init: 0,
            mount: mountMock.mount,
            view: () => div()
        })

        const componentDescriptor = component()
        initComponent(componentDescriptor, document.body, undefined as any)

        const newDescriptor = component(undefined, true)
        updateComponent(newDescriptor, componentDescriptor)

        expect(mountMock.mount).toHaveBeenCalledTimes(2)
    })

    
    it('calls the mount function if the supplied arguments is not equal to the previous arguments', () => {
        const mountMock = {
            mount: (x: number) => x
        }

        spyOn(mountMock, 'mount').and.callThrough()
        
        const component = defineComponent({
            name: 'Test',
            init: 0,
            mount: mountMock.mount,
            view: () => div()
        })

        const componentDescriptor = component({ prop: 'a value' })
        initComponent(componentDescriptor, document.body, undefined as any)

        const newDescriptor = component({ prop: 'a new value' })
        updateComponent(newDescriptor, componentDescriptor)

        expect(mountMock.mount).toHaveBeenCalledTimes(2)
    })
})
