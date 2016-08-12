import { render } from 'core/view'
import { div, input, text, comment, nothing } from 'html'

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

    it('creates and returns a comment node from a comment node descriptor', () => {
        const view = comment('a comment')

        const node = render(document.body, view, view, undefined, () => {})

        expect(node.nodeType).toBe(Node.COMMENT_NODE)
        expect(node.nodeValue).toBe('a comment')
    })

    it('creates and returns a "nothing" comment node from a nothing node descriptor', () => {
        const view = nothing()

        const node = render(document.body, view, view, undefined, () => {})

        expect(node.nodeType).toBe(Node.COMMENT_NODE)
        expect(node.nodeValue).toBe('Nothing')
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
        const dispatch = (fn: any) => fn()

        const node = render(document.body, view, view, undefined, dispatch) as HTMLDivElement
        expect(node.onclick).not.toBeNull()

        node.click()

        expect(mocks.onclickUpdate).toHaveBeenCalledTimes(1)
    })
})
