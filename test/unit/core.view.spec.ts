import { defineComponent, task } from 'core'
import { render } from 'core/view'
import { text, nothing } from 'html'
import { div, button, span, input, textarea, form } from 'html/elements'

const keyPressEvent = (keyCode: number) => {
    const event = document.createEvent('Event')
  
    event.initEvent('keyup', true, true)

    Object.defineProperty(event, 'keyCode', { value: keyCode })

    Object.defineProperty(event, 'which', { value: keyCode })

    return event
}

const dispatch = (fn: any, args: any) => fn(undefined, args)

/**
 * evolve
 */
describe('core.view.render', () => {

    beforeEach((done) => {
        // "Clear view" before each test
        Array.prototype.slice.call(document.body.childNodes).forEach((c: Node) => document.body.removeChild(c))

        done()
    })

    it('creates and returns a text node from a text node descriptor', (done) => {
        const view = text('a text')

        const node = render(document.body, view, view, undefined, () => {})

        expect(node.nodeType).toBe(Node.TEXT_NODE)
        expect(node.nodeValue).toBe('a text')

        done()
    })

    it('updates a text node with a new value', (done) => {
        const view1 = text('a text')
        const view2 = text('a new text')

        let node = render(document.body, view1, view1, undefined, () => {})
        expect(node.nodeValue).toBe('a text')

        node = render(document.body, view2, view1, node, () => {})
        expect(node.nodeValue).toBe('a new text')

        done()
    })

    it('creates and returns a "nothing" comment node from a nothing node descriptor', (done) => {
        const view = nothing()

        const node = render(document.body, view, view, undefined, () => {})

        expect(node.nodeType).toBe(Node.COMMENT_NODE)
        expect(node.nodeValue).toBe('Nothing')

        done()
    })

    it('mounts a component from a component node descriptor', (done) => {
        const testComponent = defineComponent({
            name: 'TestComponent',
            init: undefined,
            view: (_) => div({ id: 'testComponent' })
        })

        const view = div(testComponent())

        const node = render(document.body, view, view, undefined, () => {}) as HTMLDivElement

        expect((node.childNodes.item(0) as HTMLDivElement).id).toBe('testComponent')

        done()
    })

    it('remounts a component', (done) => {
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

        const view1 = testComponent()
        const view2 = testComponent(undefined, true)

        const node = render(document.body, view1, view1, undefined, () => {}) as HTMLDivElement

        const componentInstance = view1.componentInstance

        render(document.body, view2, view1, node, () => {}) as HTMLDivElement

        expect(view2.componentInstance!.id).toBe(componentInstance!.id)
        expect(mocks.mount).toHaveBeenCalledTimes(2)

        done()
    })

    it('removes excessive child nodes', (done) => {
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

        done()
    })

    it('adds child nodes if needed', (done) => {
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

        done()
    })

    it('creates and returns an element node from an element node descriptor', (done) => {
        const view = div()

        const node = render(document.body, view, view, undefined, () => {}) as Element

        expect(node.nodeType).toBe(Node.ELEMENT_NODE)
        expect(node.tagName).toBe('DIV')

        done()
    })

    it('returns an element node with attributes set', (done) => {
        const view = input({
            'class': 'testClass',
            id: 'testId',
            type: 'text',
            disabled: true,
            checked: true,
            value: 5
        })

        const node = render(document.body, view, view, undefined, () => {}) as HTMLInputElement

        expect(node.id).toBe('testId')
        expect(node.className).toBe('testClass')
        expect(node.type).toBe('text')
        expect(node.disabled).toBe(true)    
        expect(node.checked).toBe(true)
        expect(node.value).toBe('5')

        done()
    })

    it('returns an element with onclick event listener set', (done) => {
        const mocks = {
            onclickUpdate: (m: any) => {
                return m
            }
        }
        spyOn(mocks, 'onclickUpdate')

        const view = button({
            onclick: mocks.onclickUpdate
        })

        const node = render(document.body, view, view, undefined, dispatch) as HTMLButtonElement
        expect(node.onclick).not.toBeNull()

        node.click()

        expect(mocks.onclickUpdate).toHaveBeenCalledTimes(1)

        done()
    })

    it('replaces the old event listener with a the new one', (done) => {
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

        const view1 = button({
            onclick: mocks.onclickUpdate1
        })

        const view2 = button({
            onclick: mocks.onclickUpdate2
        })

        let node = render(document.body, view1, view1, undefined, dispatch) as HTMLButtonElement

        node = render(document.body, view2, view1, node, dispatch) as HTMLButtonElement

        node.click()

        expect(mocks.onclickUpdate1).not.toHaveBeenCalled()
        expect(mocks.onclickUpdate2).toHaveBeenCalledTimes(1)

        done()
    })


    it('returns an element with multiple onkeyup event listeners set', (done) => {
        const mocks = {
            onkeyupUpdate: (m: any) => {
                console.log('onkeyupUpdate')
                return m
            }
        }
        spyOn(mocks, 'onkeyupUpdate')

        const view = div({
            onkeyup_enter: mocks.onkeyupUpdate,
            onkeyup_49: mocks.onkeyupUpdate
        })

        const node = render(document.body, view, view, undefined, dispatch) as HTMLDivElement
        expect(node.onkeyup).not.toBeNull()

        node.dispatchEvent(keyPressEvent(13))
        node.dispatchEvent(keyPressEvent(49))

        expect(mocks.onkeyupUpdate).toHaveBeenCalledTimes(2)

        done()
    })

    it('passes the value of a textarea element when an event listener is triggered', (done) => {
        const mocks = {
            update: (m: any, value: string) => {
                expect(value).toBe('a value')
                return m
            }
        }
        spyOn(mocks, 'update')

        const view = textarea({
            onkeyup_enter: mocks.update,
            value: 'a value'
        })

        const node = render(document.body, view, view, undefined, dispatch) as HTMLTextAreaElement
        expect(node.value).toBe('a value')
        expect(node.onkeyup).not.toBeNull()

        node.dispatchEvent(keyPressEvent(13))

        expect(mocks.update).toHaveBeenCalledTimes(1)

        done()
    })

    it('calls element.focus() when focus attribute is set to true', (done) => {

        const view = input({
            focus: true
        })

        const node = render(document.body, view, view, undefined, dispatch) as HTMLTextAreaElement

        expect(node).toEqual(document.activeElement)

        done()
    })


    it('updates attributes if they have changed', (done) => {
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

        done()
    })

    it('removes attributes from existing element', (done) => {
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

        done()
    })

    it('removes attributes from existing element if the attribute is undefined', (done) => {
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

        done()
    })

    it('replaces the element if the tagName has changed', (done) => {
        const view1 = div()
        
        const view2 = span()
        
        let node = render(document.body, view1, view1, undefined, () => {}) as HTMLDivElement
        (node as any)._id = 1
        expect(node.tagName).toBe('DIV')
        
        node = render(document.body, view2, view1, node, () => {}) as HTMLDivElement
        
        expect((node as any)._id).not.toBeDefined()
        expect(node.tagName).toBe('SPAN')

        done()
    })

    it('removes old event listeners when element is replaced', (done) => {
        const view1 = button({
            onclick: (m: any) => m
        })
        
        const view2 = nothing()
        
        const node = render(document.body, view1, view1, undefined, () => {}) as HTMLButtonElement

        expect(node.onclick).not.toBeNull()
        
        render(document.body, view2, view1, node, () => {}) as HTMLButtonElement
        
        expect(node.onclick).toBeNull()

        done()
    })

    it('executes Task when set as event listener', (done) => {
        const mocks = {
            testTask: () => {
            }
        }

        spyOn(mocks, 'testTask')

        const view = button({
            onclick: task(mocks.testTask)
        })
        
        const node = render(document.body, view, view, undefined, () => {}) as HTMLButtonElement
        node.click()

        expect(mocks.testTask).toHaveBeenCalledTimes(1)
        
        done()
    })

    it('executes Task when set as event listener with options', (done) => {
        const mocks = {
            testTask: () => {
            }
        }

        spyOn(mocks, 'testTask')

        const view = button({
            onclick: { listener: task(mocks.testTask), stopPropagation: true }
        })
        
        const node = render(document.body, view, view, undefined, () => {}) as HTMLButtonElement
        node.click()
        
        expect(mocks.testTask).toHaveBeenCalledTimes(1)
        
        done()
    })

    it('collects form data and passes it as argument to the update function', (done) => {

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

        done()
    })

    
    it('onchange propagates event from child to form, resulting in a call to the update function', (done) => {

        type FormData = {  
            test1: string
            test2: string
        }
        const mocks = {
            update: (m: any, formData: FormData) => {
                expect(formData).toEqual({
                    test1: 'testValue1',
                    test2: 'on'
                })
                return m
            }
        }

        spyOn(mocks, 'update')

        const view = form({
                onchange: { 
                    listener: mocks.update, 
                    preventDefault: true
                }
            },
            input({
                name: 'test1',
                id: 'test1',
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
        event.initEvent('change', true, true)
        node.querySelector('#test1').dispatchEvent(event)

        expect(mocks.update).toHaveBeenCalledTimes(1)

        done()
    })

    // FIXME: This test is very hard to get working cross browser...
    // it('calls element.blur() when blur attribute is set to true', (done) => {

    //     const mocks = {
    //         onEventTriggered: (m: any) => m
    //     }
    //     spyOn(mocks, 'onEventTriggered')

    //     const el = document.createElement('input')
    //     document.body.appendChild(el)

    //     el.onblur = mocks.onEventTriggered
    //     const view1 = input({
    //         focus: true
    //     })
    //     view1.node = el

    //     setTimeout(() => {
            
    //         const view2 = input({
    //             focus: true,
    //             blur: true
    //         })
    //         const node = render(document.body, view2, view1, el, dispatch) as HTMLTextAreaElement

    //         expect(node.onblur).toEqual(mocks.onEventTriggered)

    //         setTimeout(() => {

    //             expect(mocks.onEventTriggered).toHaveBeenCalledTimes(1)

    //             // node.focus()

    //             done()
    //         }, 50)
    //     }, 500)
    // })
})
