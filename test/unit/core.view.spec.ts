import { defineComponent, task } from 'core'
import { render } from 'core/view'
import { text, component, nothing } from 'html'
import { div, span, input, textarea, form } from 'html/elements'

const keyPressEvent = (key: string) => {
    const event = document.createEvent('KeyboardEvent')
  
    event.initEvent('keyup', true, true)

    delete event.key
    Object.defineProperty(event, 'key', { value: key })

    return event
}

const dispatch = (fn: any, args: any) => fn(undefined, args)

/**
 * evolve
 */
describe('core.view.render', () => {
    it('creates and returns a text node from a text node descriptor', () => {
        const view = text('a text')

        const node = render(document.body, view, view, undefined, () => {})

        expect(node.nodeType).toBe(Node.TEXT_NODE)
        expect(node.nodeValue).toBe('a text')
    })

    it('updates a text node with a new value', () => {
        const view1 = text('a text')
        const view2 = text('a new text')

        let node = render(document.body, view1, view1, undefined, () => {})
        expect(node.nodeValue).toBe('a text')

        node = render(document.body, view2, view1, node, () => {})
        expect(node.nodeValue).toBe('a new text')
    })

    it('creates and returns a "nothing" comment node from a nothing node descriptor', () => {
        const view = nothing()

        const node = render(document.body, view, view, undefined, () => {})

        expect(node.nodeType).toBe(Node.COMMENT_NODE)
        expect(node.nodeValue).toBe('Nothing')
    })

    it('mounts a component from a component node descriptor', () => {
        const testComponent = defineComponent({
            name: 'TestComponent',
            init: undefined,
            view: (_) => div({ id: 'testComponent' })
        })

        const view = div(component(testComponent))

        const node = render(document.body, view, view, undefined, () => {}) as HTMLDivElement

        expect((node.childNodes.item(0) as HTMLDivElement).id).toBe('testComponent')
    })

    it('remounts a component', () => {
        const mocks = {
            mount: (m: any) => m
        }

        spyOn(mocks, 'mount')

        const testComponent = defineComponent({
            name: 'TestComponent',
            init: undefined,
            mount: mocks.mount,
            view: (_) => div({ id: 'testComponent' })
        })

        const view1 = component(testComponent)
        const view2 = component(testComponent, undefined, true)

        const node = render(document.body, view1, view1, undefined, () => {}) as HTMLDivElement

        const componentInstance = view1.componentInstance

        render(document.body, view2, view1, node, () => {}) as HTMLDivElement

        expect(view2.componentInstance!.id).toBe(componentInstance!.id)
        expect(mocks.mount).toHaveBeenCalledTimes(2)
    })

    it('removes excessive child nodes', () => {
        const viewItems1 = ['a', 'b', 'c', 'd']
        const viewItems2 = ['a', 'c']
        const view1 = div(
            viewItems1.map(item => div(text(item)))
        )
        const view2 = div(
            viewItems2.map(item => div(text(item)))
        )

        let node = render(document.body, view1, view1, undefined, () => {}) as HTMLDivElement
        
        expect(node.childElementCount).toBe(viewItems1.length)

        node = render(document.body, view2, view1, node, () => {}) as HTMLDivElement

        expect(node.childElementCount).toBe(viewItems2.length)
    })

    it('adds child nodes if needed', () => {
        const viewItems1 = ['a', 'b']
        const viewItems2 = ['a', 'b', 'c', 'd']
        const view1 = div(
            viewItems1.map(item => div(text(item)))
        )
        const view2 = div(
            viewItems2.map(item => div(text(item)))
        )

        let node = render(document.body, view1, view1, undefined, () => {}) as HTMLDivElement
        
        expect(node.childElementCount).toBe(viewItems1.length)

        node = render(document.body, view2, view1, node, () => {}) as HTMLDivElement

        expect(node.childElementCount).toBe(viewItems2.length)
    })

    it('creates and returns an element node from an element node descriptor', () => {
        const view = div()

        const node = render(document.body, view, view, undefined, () => {}) as Element

        expect(node.nodeType).toBe(Node.ELEMENT_NODE)
        expect(node.tagName).toBe('DIV')
    })

    it('returns an element node with attributes set', () => {
        const view = input({
            'class': 'testClass',
            id: 'testId',
            autofocus: true,
            type: 'email',
            disabled: 'disabled',
            checked: true,
            value: 5
        })

        const node = render(document.body, view, view, undefined, () => {}) as HTMLInputElement

        expect(node.id).toBe('testId')
        expect(node.className).toBe('testClass')
        expect(node.autofocus).toBe(true)
        expect(node.type).toBe('email')
        expect(node.disabled).toBe(true)    
        expect(node.checked).toBe(true)
        expect(node.value).toBe('5')
    })

    it('returns an element with onclick event listener set', () => {
        const mocks = {
            onclickUpdate: (m: any) => {
                return m
            }
        }
        spyOn(mocks, 'onclickUpdate')

        const view = div({
            onclick: mocks.onclickUpdate
        })

        const node = render(document.body, view, view, undefined, dispatch) as HTMLDivElement
        expect(node.onclick).not.toBeNull()

        node.click()

        expect(mocks.onclickUpdate).toHaveBeenCalledTimes(1)
    })

    it('replaces the old event listener with a the new one', () => {
        const mocks = {
            onclickUpdate1: (m: any) => {
                return m
            },
            
            onclickUpdate2: (m: any) => {
                return m
            }
        }
        spyOn(mocks, 'onclickUpdate1')
        spyOn(mocks, 'onclickUpdate2')

        const view1 = div({
            onclick: mocks.onclickUpdate1
        })

        const view2 = div({
            onclick: mocks.onclickUpdate2
        })

        let node = render(document.body, view1, view1, undefined, dispatch) as HTMLDivElement

        node = render(document.body, view2, view1, node, dispatch) as HTMLDivElement

        node.click()

        expect(mocks.onclickUpdate1).not.toHaveBeenCalled()
        expect(mocks.onclickUpdate2).toHaveBeenCalledTimes(1)
    })


    it('returns an element with multiple onkeyup event listeners set', () => {
        const mocks = {
            onkeyupUpdate: (m: any) => {
                return m
            }
        }
        spyOn(mocks, 'onkeyupUpdate')

        const view = div({
            onkeyup_enter: mocks.onkeyupUpdate,
            onkeyup_k: mocks.onkeyupUpdate
        })

        const node = render(document.body, view, view, undefined, dispatch) as HTMLDivElement
        expect(node.onkeyup).not.toBeNull()

        node.dispatchEvent(keyPressEvent('enter'))
        node.dispatchEvent(keyPressEvent('k'))

        expect(mocks.onkeyupUpdate).toHaveBeenCalledTimes(2)
    })

    it('passes the value of a textarea element when an event listener is triggered', () => {
        const mocks = {
            onclickUpdate: (m: any, value: string) => {
                expect(value).toBe('a value')
                return m
            }
        }
        spyOn(mocks, 'onclickUpdate')

        const view = textarea({
            onclick: mocks.onclickUpdate,
            value: 'a value'
        })

        const node = render(document.body, view, view, undefined, dispatch) as HTMLTextAreaElement
        expect(node.value).toBe('a value')
        expect(node.onclick).not.toBeNull()

        node.click()

        expect(mocks.onclickUpdate).toHaveBeenCalledTimes(1)
    })

    it('calls element.blur() and element.focus() when blur and focus attributes are set to true', () => {
        const mocks = {
            onEventTriggered: (m: any) => m
        }
        spyOn(mocks, 'onEventTriggered')

        const view = input({
            onfocus: mocks.onEventTriggered,
            focus: true,
            onblur: mocks.onEventTriggered,
            blur: true
        })

        const node = render(document.body, view, view, undefined, dispatch) as HTMLTextAreaElement
        expect(node.onblur).not.toBeNull()
        expect(node.onfocus).not.toBeNull()

        expect(mocks.onEventTriggered).toHaveBeenCalledTimes(2)
    })

    it('updates attributes if they have changed', () => {
        const view1 = div({
            'class': 'foo',
            'id': 'bar'
        })
        
        const view2 = div({
            'class': 'bar',
            'id': 'foo'
        })
        
        let node = render(document.body, view1, view1, undefined, () => {}) as HTMLDivElement

        expect(node.className).toBe('foo')
        expect(node.id).toBe('bar')
        
        node = render(document.body, view2, view1, node, () => {}) as HTMLDivElement
        
        expect(node.className).toBe('bar')
        expect(node.id).toBe('foo')
    })

    it('removes attributes from existing element', () => {
        const view1 = div({
            'class': 'foo',
            'id': 'bar'
        })
        
        const view2 = div({
            'class': 'foo'
        })
        
        let node = render(document.body, view1, view1, undefined, () => {}) as HTMLDivElement

        expect(node.id).toBe('bar')
        
        node = render(document.body, view2, view1, node, () => {}) as HTMLDivElement
        
        expect(node.id).toBe('')
    })

    it('removes attributes from existing element if the attribute is undefined', () => {
        const view1 = div({
            'class': 'foo',
            id: 'bar'
        })
        
        const view2 = div({
            'class': 'foo',
            id: undefined
        })
        
        let node = render(document.body, view1, view1, undefined, () => {}) as HTMLDivElement

        expect(node.id).toBe('bar')
        
        node = render(document.body, view2, view1, node, () => {}) as HTMLDivElement
        
        expect(node.id).toBe('')
    })

    it('replaces the element if the tagName has changed', () => {
        const view1 = div()
        
        const view2 = span()
        
        let node = render(document.body, view1, view1, undefined, () => {}) as HTMLDivElement
        (node as any)._id = 1
        expect(node.tagName).toBe('DIV')
        
        node = render(document.body, view2, view1, node, () => {}) as HTMLDivElement
        
        expect((node as any)._id).not.toBeDefined()
        expect(node.tagName).toBe('SPAN')
    })

    it('removes old event listeners when element is replaced', () => {
        const view1 = div({
            onclick: (m: any) => m
        })
        
        const view2 = nothing()
        
        const node = render(document.body, view1, view1, undefined, () => {}) as HTMLDivElement

        expect(node.onclick).not.toBeNull()
        
        render(document.body, view2, view1, node, () => {}) as HTMLDivElement
        
        expect(node.onclick).toBeNull()
    })

    it('executes Task when set as event listener', () => {
        const mocks = {
            testTask: () => {
            }
        }

        spyOn(mocks, 'testTask')

        const view = div({
            onclick: task(mocks.testTask)
        })
        
        const node = render(document.body, view, view, undefined, () => {}) as HTMLDivElement
        node.click()

        expect(mocks.testTask).toHaveBeenCalledTimes(1)
        
    })

    it('executes Task when set as event listener with options', () => {
        const mocks = {
            testTask: () => {
            }
        }

        spyOn(mocks, 'testTask')

        const view = div({
            onclick: { listener: task(mocks.testTask), stopPropagation: true }
        })
        
        const node = render(document.body, view, view, undefined, () => {}) as HTMLDivElement
        node.click()
        
        expect(mocks.testTask).toHaveBeenCalledTimes(1)
        
    })

    it('collects form data and passes it as argument to the update function', () => {

        type FormData = {  
            test1: string
            test2: string
        }
        const mocks = {
            formSubmitted: (m: any, formData: FormData) => {
                expect(formData).toEqual({
                    test1: 'testValue1',
                    test2: 'on'
                })
                return m
            }
        }

        spyOn(mocks, 'formSubmitted')

        const view = form({
                onsubmit: { 
                    listener: mocks.formSubmitted, 
                    preventDefault: true,
                    stopPropagation: true
                }
            },
            input({
                name: 'test1',
                type: 'text',
                value: 'testValue'
            }),
            input({
                name: 'test2',
                type: 'checkbox',
                checked: true
            })
        )

        const node = render(document.body, view, view, undefined, dispatch) as HTMLFormElement

        const event = document.createEvent('Event')
        event.initEvent('submit', true, true)

        node.dispatchEvent(event)

        expect(mocks.formSubmitted).toHaveBeenCalledTimes(1)
    })
})
