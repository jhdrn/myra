import { render } from '../src/component'
import * as myra from '../src/myra'
import { expect } from 'chai'
import * as sinon from 'sinon'

const q = (x: string) => document.querySelector(x)

/**
 * mount
 */
describe('mount', () => {
    beforeEach((done) => {
        // "Clear view" before each test
        Array.prototype.slice.call(document.body.childNodes).forEach((c: Node) => document.body.removeChild(c))

        done()
    })

    it('mounts the component', done => {

        const Component = () => <div id="root" />

        myra.mount(<Component />, document.body)

        setTimeout(() => {
            const rootNode = q('#root')

            expect(rootNode).not.to.be.null

            done()
        })
    })

    it('mounts any JSX element', done => {

        myra.mount(<div id="root" />, document.body)

        setTimeout(() => {
            const rootNode = q('#root')

            expect(rootNode).not.to.be.null

            done()
        })
    })
})

describe('component render', () => {
    beforeEach((done) => {
        // "Clear view" before each test
        Array.prototype.slice.call(document.body.childNodes).forEach((c: Node) => document.body.removeChild(c))

        done()
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
        render(document.body, [vNode], [])
        render(document.body, [<Component val={45} />], [vNode])

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
        render(document.body, [vNode], [])

        const newVNode = <Component prop="a new value" />
        render(document.body, [newVNode], [vNode])

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
        render(document.body, [vNode], [])

        const newVNode = <Component>Child A</Component>
        render(document.body, [newVNode], [vNode])

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
        render(document.body, [vNode], [])

        const newVNode = <Component>Child B</Component>
        render(document.body, [newVNode], [vNode])

        expect(mock.callback.callCount).to.eq(2)
    })
})
