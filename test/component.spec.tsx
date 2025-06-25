import { expect } from 'chai'
import { render } from '../src/component'
import * as myra from '../src/myra'

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


describe('memo render count', () => {
    it('should only render once if props do not change', () => {
        let renderCount = 0
        const MemoComponent = myra.memo((props: { value: number }) => {
            renderCount++
            return <div>{props.value}</div>
        })
        const vNode = <MemoComponent value={1} />
        render(document.body, [vNode], [])
        render(document.body, [<MemoComponent value={1} />], [vNode])
        expect(renderCount).to.eq(1)
    })
    it('should render again if props change', () => {
        let renderCount = 0
        const MemoComponent = myra.memo((props: { value: number }) => {
            renderCount++
            return <div>{props.value}</div>
        })
        const vNode = <MemoComponent value={1} />
        render(document.body, [vNode], [])
        render(document.body, [<MemoComponent value={2} />], [vNode])
        expect(renderCount).to.eq(2)
    })
    it('should render again if children change', () => {
        let renderCount = 0
        const MemoComponent = myra.memo((props: { children?: JSX.Element | string }) => {
            renderCount++
            return <div>{props.children}</div>
        })
        const vNode = <MemoComponent>foo</MemoComponent>
        render(document.body, [vNode], [])
        render(document.body, [<MemoComponent>bar</MemoComponent>], [vNode])
        expect(renderCount).to.eq(2)
    })
    it('should not render again if children are the same reference', () => {
        let renderCount = 0
        const Child = myra.memo(() => <span>foo</span>)
        const MemoComponent = myra.memo((props: { children?: JSX.Element }) => {
            renderCount++
            return <div>{props.children}</div>
        })
        const vNode = <MemoComponent><Child /></MemoComponent>
        render(document.body, [vNode], [])
        render(document.body, [<MemoComponent><Child /></MemoComponent>], [vNode])
        expect(renderCount).to.eq(1)
    })
})
