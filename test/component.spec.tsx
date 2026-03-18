import { render, tryHandleComponentError } from '../src/component'
import { RenderNode } from '../src/internal'
import * as myra from '../src/myra'
import { expect } from 'chai'
import * as sinon from 'sinon'

const tick = (ms = 0) => new Promise<void>(resolve => setTimeout(resolve, ms))

const q = (x: string) => document.querySelector(x)

/**
 * mount
 */
describe('mount', () => {
    beforeEach(() => {
        // "Clear view" before each test
        Array.prototype.slice.call(document.body.childNodes).forEach((c: Node) => document.body.removeChild(c))
    })

    it('mounts the component', async () => {

        const Component = () => <div id="root" />

        myra.mount(<Component />, document.body)

        await tick()
        const rootNode = q('#root')

        expect(rootNode).not.to.be.null
    })

    it('mounts any JSX element', async () => {

        myra.mount(<div id="root" />, document.body)

        await tick()
        const rootNode = q('#root')

        expect(rootNode).not.to.be.null
    })
})

describe('component render', () => {
    beforeEach(() => {
        // "Clear view" before each test
        Array.prototype.slice.call(document.body.childNodes).forEach((c: Node) => document.body.removeChild(c))
    })

    it('does not call the layout effect listener if the props has not changed', () => {
        const mock = sinon.spy({
            beforeRender: () => { }
        })

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const Component = myra.memo((_p: { val: number }) => {
            myra.useLayoutEffect(() => mock.beforeRender())
            return <div />
        })

        const vNode = <Component val={45} />
        const oldNodes = render(document.body, [vNode], [])
        render(document.body, [<Component val={45} />], oldNodes)

        expect(mock.beforeRender.callCount).to.eq(1)
    })

    it('calls the layout effect listener if the supplied props are not equal to the previous props', () => {
        const mock = sinon.spy({
            callback: () => { }
        })

        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const Component = (_p: { prop: string }) => {
            myra.useLayoutEffect(() => mock.callback())
            return <div />
        }

        const vNode = <Component prop="a value" />
        const oldNodes = render(document.body, [vNode], [])

        const newVNode = <Component prop="a new value" />
        render(document.body, [newVNode], oldNodes)

        expect(mock.callback.callCount).to.eq(2)
    })

    it('does not call the layout effect listener if the children has not changed', () => {
        const mock = sinon.spy({
            callback: () => { }
        })

        const Component = myra.memo(props => {
            myra.useLayoutEffect(() => mock.callback())
            return <div>{props.children}</div>
        })

        const vNode = <Component>Child A</Component>
        const oldNodes = render(document.body, [vNode], [])

        const newVNode = <Component>Child A</Component>
        render(document.body, [newVNode], oldNodes)

        expect(mock.callback.callCount).to.eq(1)
    })

    it('calls the layout effect event if the supplied children are not equal to the previous children', () => {
        const mock = sinon.spy({
            callback: () => { }
        })

        const Component = myra.define(props => {
            myra.useLayoutEffect(() => mock.callback())
            return <div>{props.children}</div>
        })

        const vNode = <Component>Child A</Component>
        const oldNodes = render(document.body, [vNode], [])

        const newVNode = <Component>Child B</Component>
        render(document.body, [newVNode], oldNodes)

        expect(mock.callback.callCount).to.eq(2)
    })
})

describe('component return value normalization', () => {
    beforeEach(() => {
        Array.prototype.slice.call(document.body.childNodes).forEach((c: Node) => document.body.removeChild(c))
    })

    it('renders a comment node when a component returns null', () => {
        const Component = () => null

        const vNode = <Component />
        render(document.body, [vNode], [])

        expect(document.body.firstChild).not.to.be.null
        expect(document.body.firstChild!.nodeType).to.eq(Node.COMMENT_NODE)
    })

    it('renders a comment node when a component returns undefined', () => {
        const Component = (() => undefined) as unknown as () => JSX.Element

        const vNode = <Component />
        render(document.body, [vNode], [])

        expect(document.body.firstChild).not.to.be.null
        expect(document.body.firstChild!.nodeType).to.eq(Node.COMMENT_NODE)
    })

    it('renders a comment node when a component returns false', () => {
        const Component = (() => false) as unknown as () => JSX.Element

        const vNode = <Component />
        render(document.body, [vNode], [])

        expect(document.body.firstChild).not.to.be.null
        expect(document.body.firstChild!.nodeType).to.eq(Node.COMMENT_NODE)
    })

    it('renders a comment node when a component returns true', () => {
        const Component = (() => true) as unknown as () => JSX.Element

        const vNode = <Component />
        render(document.body, [vNode], [])

        expect(document.body.firstChild).not.to.be.null
        expect(document.body.firstChild!.nodeType).to.eq(Node.COMMENT_NODE)
    })

    it('renders a text node when a component returns a string', () => {
        const Component = (() => 'hello') as unknown as () => JSX.Element

        const vNode = <Component />
        render(document.body, [vNode], [])

        expect(document.body.firstChild).not.to.be.null
        expect(document.body.firstChild!.nodeType).to.eq(Node.TEXT_NODE)
        expect(document.body.firstChild!.textContent).to.eq('hello')
    })

    it('renders a text node when a component returns a number', () => {
        const Component = (() => 42) as unknown as () => JSX.Element

        const vNode = <Component />
        render(document.body, [vNode], [])

        expect(document.body.firstChild).not.to.be.null
        expect(document.body.firstChild!.nodeType).to.eq(Node.TEXT_NODE)
        expect(document.body.firstChild!.textContent).to.eq('42')
    })

    it('transitions from null to an element correctly', () => {
        let show = false
        const Component = () => show ? <div id="it" /> : null

        const vNode = <Component />
        const oldNodes = render(document.body, [vNode], [])

        show = true
        const newVNode = <Component />
        render(document.body, [newVNode], oldNodes)

        expect(q('#it')).not.to.be.null
    })

    it('transitions from an element to null correctly', () => {
        let show = true
        const Component = () => show ? <div id="it" /> : null

        const vNode = <Component />
        const oldNodes = render(document.body, [vNode], [])

        show = false
        const newVNode = <Component />
        render(document.body, [newVNode], oldNodes)

        expect(q('#it')).to.be.null
        expect(document.body.firstChild!.nodeType).to.eq(Node.COMMENT_NODE)
    })
})

describe('tryHandleComponentError', () => {
    beforeEach(() => {
        Array.prototype.slice.call(document.body.childNodes).forEach((c: Node) => document.body.removeChild(c))
    })

    it('does nothing when the parent element is no longer connected to the DOM', () => {
        const detachedEl = document.createElement('div')
        // detachedEl is not appended to document, so parentNode === null
        const renderNode: RenderNode = {
            children: [],
            errorHandler: sinon.spy(() => <nothing />)
        }

        // Should not throw and should not call the error handler
        tryHandleComponentError(detachedEl, renderNode, false, new Error('test'))

        expect((renderNode.errorHandler as sinon.SinonSpy).called).to.be.false
    })

    it('rethrows the original error when the error handler itself throws', () => {
        const Component = (() => {
            myra.useErrorHandler(() => {
                throw new Error('handler error')
            })
            throw new Error('original error')
        }) as unknown as () => JSX.Element

        let caughtError: Error | undefined
        try {
            render(document.body, [<Component />], [])
        } catch (e) {
            caughtError = e as Error
        }

        expect(caughtError).to.exist
        expect(caughtError!.message).to.eq('original error')
    })
})
