import { render } from '../src/component'
import { ComponentProps, ElementVNode } from '../src/contract'
import { useState } from '../src/hooks'
import * as myra from '../src/myra'

// const keyPressEvent = (keyCode: number) => {
//     const event = document.createEvent('Event')

//     event.initEvent('keyup', true, true)

//     Object.defineProperty(event, 'keyCode', { value: keyCode })

//     Object.defineProperty(event, 'which', { value: keyCode })

//     return event
// }

/**
 * evolve
 */
describe('render', () => {

    beforeEach((done) => {
        // "Clear view" before each test
        Array.prototype.slice.call(document.body.childNodes).forEach((c: Node) => document.body.removeChild(c))

        done()
    })

    it('renders a "nothing" comment node from a virtual node', (done) => {
        const view = <nothing />

        render(document.body, [view], [])
        const node = view.domRef!
        expect(node.nodeType).toBe(Node.COMMENT_NODE)
        expect(node.nodeValue).toBe('Nothing')

        done()
    })

    it(`replaces a nothing node with a text node`, (done) => {

        const view1 = <div><nothing /></div>
        render(document.body, [view1], [])

        expect(document.body.firstChild?.firstChild?.nodeType).toBe(Node.COMMENT_NODE)
        expect(document.body.firstChild?.firstChild?.nodeValue).toBe('Nothing')

        render(document.body, [<div>text</div>], [view1])
        expect(document.body.firstChild?.childNodes.length).toBe(1)
        expect(document.body.firstChild?.firstChild?.textContent).toEqual('text')

        done()
    })

    it(`replaces a nothing node with an element node`, (done) => {

        const view1 = <div><nothing /></div>
        render(document.body, [view1], [])

        expect(document.body.firstChild?.firstChild?.nodeType).toBe(Node.COMMENT_NODE)
        expect(document.body.firstChild?.firstChild?.nodeValue).toBe('Nothing')

        render(document.body, [<div><span /></div>], [view1])
        expect(document.body.firstChild?.childNodes.length).toBe(1)
        expect((document.body.firstChild?.firstChild as HTMLSpanElement).tagName).toEqual('SPAN')

        done()
    })

    it(`replaces a nothing node with a fragment node`, (done) => {

        const view1 = <div><nothing /></div>
        render(document.body, [view1], [])

        expect(document.body.firstChild?.firstChild?.nodeType).toBe(Node.COMMENT_NODE)
        expect(document.body.firstChild?.firstChild?.nodeValue).toBe('Nothing')

        render(document.body, [<div><><span /></></div>], [view1])
        expect(document.body.firstChild?.childNodes.length).toBe(1)
        expect((document.body.firstChild?.firstChild as HTMLSpanElement).tagName).toEqual('SPAN')

        done()
    })

    it(`replaces a nothing node with a component node`, (done) => {

        const view1 = <nothing />

        const Component = () => {
            return <div id="component-id" />
        }
        render(document.body, [view1], [])

        expect(document.body.firstChild?.textContent).toEqual('Nothing')

        const view2 = <Component />

        render(document.body, [view2], [view1])

        expect(document.body.childNodes.length).toBe(1)
        expect((document.body.firstChild as Element).id).toEqual('component-id')
        done()
    })

    it('renders an element node from a virtual node', (done) => {
        const view = <div></div>

        render(document.body, [view], [])
        const node = view.domRef as HTMLDivElement
        expect(node.nodeType).toBe(Node.ELEMENT_NODE)
        expect(node.tagName).toBe('DIV')

        done()
    })


    it(`replaces an element node with a text node`, (done) => {

        const view1 = <div><span /></div>
        render(document.body, [view1], [])

        expect((document.body.firstChild?.firstChild as HTMLDivElement).tagName).toEqual('SPAN')

        render(document.body, [<div>text</div>], [view1])
        expect(document.body.firstChild?.childNodes.length).toBe(1)
        expect(document.body.firstChild?.firstChild?.textContent).toEqual('text')

        done()
    })

    it(`replaces an element node with a nothing node`, (done) => {

        const view1 = <div></div>
        render(document.body, [view1], [])

        expect((document.body.firstChild as HTMLDivElement).tagName).toEqual('DIV')

        render(document.body, [<nothing />], [view1])

        expect(document.body.childNodes.length).toBe(1)
        expect(document.body.firstChild?.nodeType).toBe(Node.COMMENT_NODE)
        expect(document.body.firstChild?.nodeValue).toBe('Nothing')

        done()
    })

    it(`replaces an element node with a fragment node`, (done) => {

        const view1 = <div></div>
        render(document.body, [view1], [])

        expect((document.body.firstChild as HTMLDivElement).tagName).toEqual('DIV')

        render(document.body, [<><span /></>], [view1])
        expect(document.body.childNodes.length).toBe(1)
        expect((document.body.firstChild as HTMLSpanElement).tagName).toEqual('SPAN')

        done()
    })

    it(`replaces an element node with a component node`, (done) => {

        const view1 = <div></div>

        const Component = () => {
            return <div id="component-id" />
        }
        render(document.body, [view1], [])

        expect((document.body.firstChild as HTMLDivElement).tagName).toEqual('DIV')

        const view2 = <Component />

        render(document.body, [view2], [view1])
        expect(document.body.childNodes.length).toBe(1)

        expect((document.body.firstChild as Element).id).toEqual('component-id')
        done()
    })

    it('renders a text node from a virtual node', (done) => {
        const view = <div>text</div>

        render(document.body, [view], [])
        const parentNode = view.domRef as HTMLDivElement
        expect(parentNode.childNodes.length).toBe(1)
        expect(parentNode.childNodes[0].nodeType).toBe(Node.TEXT_NODE)
        expect(parentNode.childNodes[0].textContent).toBe('text')

        done()
    })

    it(`replaces a text node with a nothing node`, (done) => {

        const view1 = <div>text</div>
        render(document.body, [view1], [])

        expect(document.body.firstChild?.firstChild?.textContent).toEqual('text')

        render(document.body, [<div><nothing /></div>], [view1])

        expect(document.body.firstChild?.childNodes.length).toBe(1)
        expect(document.body.firstChild?.firstChild?.nodeType).toBe(Node.COMMENT_NODE)
        expect(document.body.firstChild?.firstChild?.nodeValue).toBe('Nothing')

        done()
    })

    it(`replaces a text node with an element node`, (done) => {

        const view1 = <div>text</div>
        render(document.body, [view1], [])

        expect(document.body.firstChild?.firstChild?.textContent).toEqual('text')

        render(document.body, [<div><span /></div>], [view1])
        expect(document.body.firstChild?.childNodes.length).toBe(1)
        expect((document.body.firstChild?.firstChild as HTMLSpanElement).tagName).toEqual('SPAN')

        done()
    })

    it(`replaces a text node with a fragment node`, (done) => {

        const view1 = <div>text</div>
        render(document.body, [view1], [])

        expect(document.body.firstChild?.firstChild?.textContent).toEqual('text')

        render(document.body, [<div><><span /></></div>], [view1])
        expect(document.body.firstChild?.childNodes.length).toBe(1)
        expect((document.body.firstChild?.firstChild as HTMLSpanElement).tagName).toEqual('SPAN')

        done()
    })

    it(`replaces a text node with a component node`, (done) => {

        const view1 = <div>text</div>

        const Component = () => {
            return <div id="component-id" />
        }
        render(document.body, [view1], [])

        expect(document.body.firstChild?.firstChild?.textContent).toEqual('text')

        const view2 = <div><Component /></div>

        render(document.body, [view2], [view1])
        expect(document.body.childNodes.length).toBe(1)

        expect((document.body.firstChild?.firstChild as Element).id).toEqual('component-id')
        done()
    })

    it('renders a component from a component virtual node', (done) => {
        const TestComponent = () => <div id="testComponent"></div>

        const view = <div><TestComponent /></div>

        render(document.body, [view], [])
        const node = view.domRef as HTMLDivElement
        expect((node.childNodes[0] as HTMLDivElement).id).toBe('testComponent')

        done()
    })

    it(`replaces a component node with a nothing node`, (done) => {

        const Component = () => {
            return <div id="component-id" />
        }
        const componentInstance = <Component />
        render(document.body, [componentInstance], [])

        expect((document.body.firstChild as Element).id).toEqual('component-id')

        render(document.body, [<nothing />], [componentInstance])
        expect(document.body.childNodes.length).toBe(1)
        expect(document.body.firstChild?.textContent).toEqual('Nothing')

        done()

    })

    it(`replaces a component node with a text node`, (done) => {

        const Component = () => {
            return <div id="component-id" />
        }
        const view1 = <div><Component /></div>
        render(document.body, [view1], [])

        expect((document.body.firstChild?.firstChild as Element).id).toEqual('component-id')

        render(document.body, [<div>text</div>], [view1])
        expect(document.body.firstChild?.childNodes.length).toBe(1)
        expect(document.body.firstChild?.firstChild?.textContent).toEqual('text')

        done()
    })

    it(`replaces a component node with an element node`, (done) => {

        const Component = () => {
            return <div id="component-id" />
        }
        const view1 = <div><Component /></div>
        render(document.body, [view1], [])

        expect((document.body.firstChild?.firstChild as Element).id).toEqual('component-id')

        render(document.body, [<div><span /></div>], [view1])
        expect(document.body.firstChild?.childNodes.length).toBe(1)
        expect((document.body.firstChild?.firstChild as HTMLSpanElement).tagName).toEqual('SPAN')

        done()
    })

    it(`replaces a component node with a fragment node`, (done) => {

        const Component = () => {
            return <div id="component-id" />
        }
        const view1 = <div><Component /></div>
        render(document.body, [view1], [])

        expect((document.body.firstChild?.firstChild as Element).id).toEqual('component-id')

        render(document.body, [<div><><span /></></div>], [view1])
        expect(document.body.firstChild?.childNodes.length).toBe(1)
        expect((document.body.firstChild?.firstChild as HTMLSpanElement).tagName).toEqual('SPAN')

        done()
    })

    it(`removes a component when it's parent is replaced`, (done) => {

        const Component = () => {
            return <div id="component-id" />
        }
        const vNode = <div><Component /></div>
        render(document.body, [vNode], [])

        requestAnimationFrame(() => {

            expect(document.getElementById('component-id')).not.toBeNull()

            render(document.body, [<nothing />], [vNode])
            requestAnimationFrame(() => {
                expect(document.getElementById('component-id')).toBeNull()

                done()
            })
        })

    })

    it('renders a child node that was previously not rendered', (done) => {
        let setShowChildOuter: myra.Evolve<boolean> = function () { return true }

        const ChildComponent = () => <div id="child-node"></div>
        const Component = () => {
            const [showChild, setShowChild] = myra.useState(false)
            setShowChildOuter = setShowChild
            return (
                <div>
                    {showChild &&
                        <ChildComponent />
                    }
                </div>
            )
        }

        myra.mount(<Component />, document.body)

        requestAnimationFrame(() => {
            setShowChildOuter(true)
            requestAnimationFrame(() => {
                const child = document.getElementById('child-node')
                expect(child).not.toBeNull()
                done()
            })
        })
    })

    it('removes excessive child nodes', (done) => {
        const viewItems1 = ['a', 'b', 'c', 'd']
        const viewItems2 = ['a', 'c']
        const view1 =
            <div>
                {viewItems1.map(item => <div>{item}</div>)}
            </div>
        const view2 =
            <div>
                {viewItems2.map(item => <div>{item}</div>)}
            </div>

        render(document.body, [view1], [])
        let node = view1.domRef as HTMLDivElement

        expect(node.childElementCount).toBe(viewItems1.length)

        render(document.body, [view2], [view1])
        node = view2.domRef as HTMLDivElement

        expect(node.childElementCount).toBe(viewItems2.length)

        done()
    })

    it('removes excessive keyed child nodes', (done) => {
        const viewItems1 = ['a', 'b', 'c', 'd']
        const viewItems2 = ['a', 'c']
        const view1 =
            <div>
                {viewItems1.map(item => <div key={item}>{item}</div>)}
            </div>
        const view2 =
            <div>
                {viewItems2.map(item => <div key={item}>{item}</div>)}
            </div>

        render(document.body, [view1], [])
        let node = view1.domRef as HTMLDivElement

        expect(node.childElementCount).toBe(viewItems1.length)

        render(document.body, [view2], [view1])
        node = view2.domRef as HTMLDivElement

        expect(node.childElementCount).toBe(viewItems2.length)
        expect(node.children[0].textContent).toBe('a')
        expect(node.children[1].textContent).toBe('c')

        done()
    })

    it('correctly inserts and appends keyed child nodes', (done) => {
        const viewItems1 = ['b', 'd']
        const viewItems2 = ['a', 'b', 'c', 'd', 'e']
        const view1 =
            <div>
                {viewItems1.map(item => <div key={item}>{item}</div>)}
            </div>
        const view2 =
            <div>
                {viewItems2.map(item => <div key={item}>{item}</div>)}
            </div>

        render(document.body, [view1], [])
        let node = view1.domRef as HTMLDivElement

        expect(node.childElementCount).toBe(viewItems1.length)

        render(document.body, [view2], [view1])
        node = view2.domRef as HTMLDivElement

        expect(node.childElementCount).toBe(viewItems2.length)
        expect(node.children[0].textContent).toBe('a')
        expect(node.children[1].textContent).toBe('b')
        expect(node.children[2].textContent).toBe('c')
        expect(node.children[3].textContent).toBe('d')
        expect(node.children[4].textContent).toBe('e')

        done()
    })

    it('adds child nodes if needed', (done) => {
        const viewItems1 = ['a', 'b']
        const viewItems2 = ['a', 'b', 'c', 'd']
        const view1 =
            <div>
                {viewItems1.map(item => <div>{item}</div>)}
            </div>
        const view2 =
            <div>
                {viewItems2.map(item => <div>{item}</div>)}
            </div>
        render(document.body, [view1], [])

        let node = view1.domRef as HTMLDivElement

        expect(node.childElementCount).toBe(viewItems1.length)

        render(document.body, [view2], [view1])
        node = view2.domRef as HTMLDivElement

        expect(node.childElementCount).toBe(viewItems2.length)

        done()
    })

    it('creates and returns an element node from an element virtual node', (done) => {
        const view = <div />

        render(document.body, [view], [])
        const node = view.domRef as Element

        expect(node.nodeType).toBe(Node.ELEMENT_NODE)
        expect(node.tagName).toBe('DIV')

        done()
    })

    it('returns an element node with attributes set', (done) => {
        const view =
            <input
                class="testClass"
                id="testId"
                type="text"
                disabled={true}
                checked={true}
                value="5" />

        render(document.body, [view], [])

        const node = view.domRef as HTMLInputElement

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
            onclickUpdate: () => { /* dummy */ }
        }
        spyOn(mocks, 'onclickUpdate')

        const view =
            <button onclick={mocks.onclickUpdate}></button>

        render(document.body, [view], [])

        const node = view.domRef as HTMLButtonElement
        expect(node.onclick).not.toBeNull()

        node.click()

        expect(mocks.onclickUpdate).toHaveBeenCalledTimes(1)

        done()
    })

    it('does not set an event listener that doesn\'t exist on the element', (done) => {
        const mocks = {
            onCustomClick: () => { /* dummy */ }
        } as any

        const view =
            <button {...mocks}></button>

        render(document.body, [view], [])

        const node = view.domRef as any
        expect(node.getAttribute('onCustomClick')).toBeNull()

        done()
    })

    it('does not set an object as an element attribute', (done) => {
        const mocks = {
            objAttr: { foo: 'bar' }
        } as any

        const view =
            <button {...mocks}></button>

        render(document.body, [view], [])

        const node = view.domRef as HTMLButtonElement
        expect(node.getAttribute('objAttr')).toBeNull()

        done()
    })

    it('does not set an array as an element attribute', (done) => {
        const mocks = {
            arrayAttr: ['foo', 'bar']
        } as any

        const view =
            <button {...mocks}></button>

        render(document.body, [view], [])

        const node = view.domRef as HTMLButtonElement
        expect(node.getAttribute('arrayAttr')).toBeNull()

        done()
    })

    it('replaces the old event listener with a the new one', (done) => {
        const mocks = {
            onclickUpdate1: () => { /* dummy */ },
            onclickUpdate2: () => { /* dummy */ }
        }
        spyOn(mocks, 'onclickUpdate1')
        spyOn(mocks, 'onclickUpdate2')

        const view1 = <button onclick={mocks.onclickUpdate1}></button>

        const view2 = <button onclick={mocks.onclickUpdate2}></button>

        render(document.body, [view1], [])

        let node = view1.domRef as HTMLButtonElement

        render(document.body, [view2], [view1])

        node = view2.domRef as HTMLButtonElement

        node.click()

        expect(mocks.onclickUpdate1).not.toHaveBeenCalled()
        expect(mocks.onclickUpdate2).toHaveBeenCalledTimes(1)

        done()
    })

    it('updates attributes if they have changed', (done) => {
        const view1 =
            <div class="foo" id="bar"></div>

        const view2 =
            <div class="bar" id="foo"></div>

        render(document.body, [view1], [])

        let node = view1.domRef as HTMLDivElement

        expect(node.className).toBe('foo')
        expect(node.id).toBe('bar')

        render(document.body, [view2], [view1])

        node = view2.domRef as HTMLDivElement

        expect(node.className).toBe('bar')
        expect(node.id).toBe('foo')

        done()
    })

    it('removes attributes from existing element', (done) => {
        const view1 =
            <div class="foo" id="bar"></div>

        const view2 =
            <div class="foo"></div>

        render(document.body, [view1], [])

        let node = view1.domRef as HTMLDivElement

        expect(node.id).toBe('bar')

        render(document.body, [view2], [view1])

        node = view2.domRef as HTMLDivElement

        expect(node.id).toBe('')

        done()
    })

    it('removes attributes from existing element if the attribute is undefined', (done) => {
        const view1 =
            <div class="foo" id="bar"></div>

        const view2 =
            <div class="foo" id={undefined}></div>

        render(document.body, [view1], [])

        let node = view1.domRef as HTMLDivElement

        expect(node.id).toBe('bar')

        render(document.body, [view2], [view1])

        node = view2.domRef as HTMLDivElement

        expect(node.id).toBe('')

        done()
    })

    it('replaces the element if the tagName has changed', (done) => {
        const view1 = <div />

        const view2 = <span />

        render(document.body, [view1], [])

        let node = view1.domRef as HTMLDivElement

        (node as any)._id = 1
        expect(node.tagName).toBe('DIV')

        render(document.body, [view2], [view1])

        node = view2.domRef as HTMLDivElement

        expect((node as any)._id).not.toBeDefined()
        expect(node.tagName).toBe('SPAN')

        done()
    })


    it('passes props to the view context', () => {

        type ChildComponentProps = {
            test: string
        }

        const mocks = {
            assertProps: (props: ChildComponentProps & ComponentProps) =>
                expect(props).toEqual({ test: 'test', children: [] })
        }

        spyOn(mocks, 'assertProps').and.callThrough()

        const ChildComponent = (props: ChildComponentProps) => {
            mocks.assertProps(props as ChildComponentProps & ComponentProps)
            return <nothing />
        }

        const ParentComponent = () => <ChildComponent test="test" />

        render(document.body, [<ParentComponent />], [])

        expect(mocks.assertProps).toHaveBeenCalledTimes(1)
    })


    it('retains view state when element children are reordered with keys', (done) => {

        type Item = {
            id: number
        }
        const items = [
            { id: 1 },
            { id: 2 },
            { id: 3 },
            { id: 4 },
            { id: 5 },
        ] as Item[]

        type State = { clicked: boolean; itemId: number }
        type Props = { item: Item; forceUpdate: boolean }

        const ItemComponent = (props: Props) => {
            const [state, evolve] = useState<State>({ clicked: false, itemId: props.item.id })

            const setClicked = () => evolve(s => ({ ...s, clicked: true }))

            return (
                <button id={`item-${state.itemId}`}
                    class={state.clicked ? "clicked" : ""}
                    onclick={setClicked}>
                </button>
            )
        }

        const view1 =
            <div>
                {items.map(x => <div key={x.id.toString()}><ItemComponent forceUpdate item={x} /></div>)}
            </div>

        render(document.body, [view1], [])

        let btn = (view1.domRef as HTMLDivElement).querySelector('button')!
        btn.click()

        requestAnimationFrame(() => {

            expect(btn.className).toBe("clicked")
            expect(btn.id).toBe("item-1")

            const view2 =
                <div>
                    {items.reverse().map(x => <div key={x.id.toString()}><ItemComponent forceUpdate item={x} /></div>)}
                </div>

            render(document.body, [view2], [view1])

            btn = (view2.domRef as HTMLDivElement).querySelector('button')!
            expect(btn.id).toBe("item-5")
            expect(btn.className).toBe("")

            // The last element should've been updated
            btn = ((view2.domRef as HTMLDivElement).lastChild as HTMLDivElement).firstChild as HTMLButtonElement

            expect(btn.id).toBe("item-1")
            expect(btn.className).toBe("clicked")

            done()
        })
    })

    it('does not retain view state when element children are reordered without keys', (done) => {

        type Item = {
            id: number
        }
        const items = [
            { id: 1 },
            { id: 2 },
            { id: 3 },
            { id: 4 },
            { id: 5 },
        ] as Item[]

        type State = { clicked: boolean }
        type Props = { item: Item; forceUpdate: boolean }

        const ItemComponent = (props: Props) => {
            const [state, evolve] = useState<State>({ clicked: false })

            const setClicked = () => evolve({ clicked: true })

            return (
                <button id={`item-${props.item.id}`}
                    class={state.clicked ? "clicked" : ""}
                    onclick={setClicked}>
                </button>
            )
        }

        const view1 =
            <div>
                {items.map(x => <div><ItemComponent forceUpdate item={x} /></div>)}
            </div>

        render(document.body, [view1], [])

        let btn = (view1.domRef as HTMLDivElement).querySelector('button')!
        btn.click()

        requestAnimationFrame(() => {
            expect(btn.className).toBe("clicked")
            expect(btn.id).toBe("item-1")

            const view2 =
                <div>
                    {items.reverse().map(x => <div><ItemComponent forceUpdate item={x} /></div>)}
                </div>

            render(document.body, [view2], [view1])

            btn = (view2.domRef as HTMLDivElement).querySelector('button')!
            expect(btn.id).toBe("item-5")
            expect(btn.className).toBe("clicked")

            // The last element should've been updated
            btn = ((view2.domRef as HTMLDivElement).lastChild as HTMLDivElement).firstChild as HTMLButtonElement

            expect(btn.id).toBe("item-1")
            expect(btn.className).toBe("")
            done()
        })
    })

    it('retains view state when component children are reordered with keys', (done) => {

        type Item = {
            id: number
        }
        const items = [
            { id: 1 },
            { id: 2 },
            { id: 3 },
            { id: 4 },
            { id: 5 },
        ] as Item[]

        type State = { clicked: boolean }
        type Props = { key: string; item: Item }

        const ItemComponent = (props: Props) => {
            const [state, evolve] = useState<State>({ clicked: false })

            const setClicked = () => evolve({ clicked: true })

            return (
                <button id={`item-${props.item.id}`}
                    class={state.clicked ? "clicked" : ""}
                    onclick={setClicked}>
                </button>
            )
        }

        const view1 =
            <div>
                {items.map(x => <ItemComponent key={x.id.toString()} item={x} />)}
            </div>

        render(document.body, [view1], [])

        let btn = (view1.domRef as HTMLDivElement).querySelector('button')!
        btn.click()

        requestAnimationFrame(() => {
            expect(btn.className).toBe("clicked")
            expect(btn.id).toBe("item-1")

            const view2 =
                <div>
                    {items.reverse().map(x => <ItemComponent key={x.id.toString()} item={x} />)}
                </div>

            render(document.body, [view2], [view1])

            btn = (view2.domRef as HTMLDivElement).querySelector('button')!
            expect(btn.className).toBe("")
            expect(btn.id).toBe("item-5")

            // The last element should've been updated
            btn = (view2.domRef as HTMLDivElement).lastChild as HTMLButtonElement
            expect(btn.className).toBe("clicked")
            expect(btn.id).toBe("item-1")

            done()
        })
    })

    it('does not retain view state when component children reordered without keys', (done) => {

        type Item = {
            id: number
        }
        const items = [
            { id: 1 },
            { id: 2 },
            { id: 3 },
            { id: 4 },
            { id: 5 },
        ] as Item[]

        type State = { clicked: boolean }
        type Props = { item: Item }

        const ItemComponent = (props: Props) => {
            const [state, evolve] = useState<State>({ clicked: false })

            const setClicked = () => evolve({ clicked: true })

            return (
                <button id={`item-${props.item.id}`}
                    class={state.clicked ? "clicked" : ""}
                    onclick={setClicked}>
                </button>
            )
        }

        const view1 =
            <div>
                {items.map(x => <ItemComponent item={x} />)}
            </div>

        render(document.body, [view1], [])

        let btn = (view1.domRef as HTMLDivElement).querySelector('button')!
        btn.click()

        requestAnimationFrame(() => {
            expect(btn.className).toBe("clicked")
            expect(btn.id).toBe("item-1")

            const view2 =
                <div>
                    {items.reverse().map(x => <ItemComponent item={x} />)}
                </div>

            render(document.body, [view2], [view1])

            btn = (view2.domRef as HTMLDivElement).querySelector('button')!
            expect(btn.className).toBe("clicked")
            expect(btn.id).toBe("item-5")

            // The last element should've been updated
            btn = (view2.domRef as HTMLDivElement).lastChild as HTMLButtonElement
            expect(btn.className).toBe("")
            expect(btn.id).toBe("item-1")
            done()
        })
    })

    it('retains component state when component children are reordered with keys', (done) => {

        type Item = {
            id: number
        }
        const items = [
            { id: 1 },
            { id: 2 },
            { id: 3 },
            { id: 4 },
            { id: 5 },
        ] as Item[]

        type Props = { key: string; item: Item; forceUpdate: number }

        let btnVNode: ElementVNode<HTMLButtonElement> | undefined = undefined

        const ItemComponent = (props: Props) => {
            const [clicked, evolve] = useState(false)

            const setClicked = () => evolve(true)

            const v = <button id={`item-${props.item.id}`} class={clicked ? "clicked" : ""}
                onclick={setClicked}>
            </button>
            if (props.item.id === 1) {
                btnVNode = v as ElementVNode<HTMLButtonElement>
            }
            return v
        }

        const view1 =
            <div>
                {items.map(x => <ItemComponent key={x.id.toString()} item={x} forceUpdate={0} />)}
            </div> as ElementVNode<HTMLDivElement>

        render(document.body, [view1], [])

        let btn = view1.domRef!.querySelector('button')!
        btn.click()

        requestAnimationFrame(() => {
            expect(btn.className).toBe("clicked")
            expect(btn.id).toBe("item-1")

            // Clear id so it's set from state
            btn.id = ""
            btn.className = ""
            // We also need to modify the node, else the attributes won't be updated

            delete btnVNode!.props.id
            delete btnVNode!.props.class
            const reversedItems = items.reverse()
            const view2 =
                <div>
                    {reversedItems.map(x => <ItemComponent key={x.id.toString()} item={x} forceUpdate={1} />)}
                </div> as ElementVNode<HTMLDivElement>

            render(document.body, [view2], [view1])

            btn = view2.domRef!.querySelector('button')!
            expect(btn.className).toBe("")
            expect(btn.id).toBe("item-5")

            // The last element should've been updated with the same values
            btn = view2.domRef!.lastChild as HTMLButtonElement
            expect(btn.className).toBe("clicked")
            expect(btn.id).toBe("item-1")
            done()
        })
    })

    it('does not retain component state when component children are reordered without keys', (done) => {

        type Item = {
            id: number
        }
        const items = [
            { id: 1 },
            { id: 2 },
            { id: 3 },
            { id: 4 },
            { id: 5 },
        ] as Item[]

        type State = { clicked: boolean; }
        type Props = { item: Item; forceUpdate: boolean }

        let btnVNode: ElementVNode<HTMLButtonElement> | undefined = undefined

        const ItemComponent = (props: Props) => {
            const [state, evolve] = useState<State>({ clicked: false })

            const setClicked = () => evolve({ clicked: true })

            const v =
                <button
                    id={`item-${props.item.id}`}
                    class={state.clicked ? "clicked" : ""}
                    onclick={setClicked}>
                </button>
            if (props.item.id === 1) {
                btnVNode = v as ElementVNode<HTMLButtonElement>
            }
            return v
        }

        const view1 =
            <div>
                {items.map(x => <ItemComponent item={x} forceUpdate={true} />)}
            </div> as ElementVNode<HTMLDivElement>

        render(document.body, [view1], [])

        let btn = view1.domRef!.querySelector('button')!
        btn.click()
        requestAnimationFrame(() => {
            expect(btn.className).toBe("clicked")
            expect(btn.id).toBe("item-1")

            // Clear id so it's set from state
            btn.id = ""
            btn.className = ""

            // We also need to modify the node, else the attributes won't be updated
            delete btnVNode!.props.id
            delete btnVNode!.props.class

            const reversedItems = items.reverse()
            const view2 =
                <div>
                    {reversedItems.map(x => <ItemComponent item={x} forceUpdate={true} />)}
                </div> as ElementVNode<HTMLDivElement>

            render(document.body, [view2], [view1])

            btn = view2.domRef!.querySelector('button')!

            expect(btn.className).toBe("clicked")
            expect(btn.id).toBe("item-5")

            // The last element should've been updated with the same values
            btn = view2.domRef!.lastChild as HTMLButtonElement

            expect(btn.className).toBe("")
            expect(btn.id).toBe("item-1")
            done()
        })
    })


    // it('unmounts a component which is a child of removed virtual node', () => {
    //     const mountMock = {
    //         unmount: () => { }
    //     }

    //     spyOn(mountMock, 'unmount').and.callThrough()

    //     const ChildComponent = () => {
    //         useLifecycle(ev => ev.phase === LifecyclePhase.BeforeUnmount && mountMock.unmount())
    //         return <div />
    //     }

    //     const view1 = <div><div><ChildComponent /></div></div>
    //     render(document.body, [view1], [])

    //     const view2 = <div></div>
    //     render(document.body, [view2], [view1])

    //     expect(mountMock.unmount).toHaveBeenCalledTimes(1)
    // })

    it('renders svg nodes with correct namespace', () => {
        const view = <svg id="svg-test1"></svg>
        render(document.body, [view], [])

        const el = document.getElementById('svg-test1') as SVGElement | null
        expect(el).toBeDefined()
        expect(el!.namespaceURI).toBe('http://www.w3.org/2000/svg')
    })

    it('renders svg child nodes with correct namespace', () => {
        const view =
            <svg height="100" width="100">
                <circle id="svg-test2" cx="50" cy="50" r="50" fill="red" />
            </svg>

        render(document.body, [view], [])

        const el = document.getElementById('svg-test2') as SVGElement | null
        expect(el).toBeDefined()
        expect(el!.namespaceURI).toBe('http://www.w3.org/2000/svg')
    })

})

it('keeps focus of element when rendering keyed siblings', (done) => {
    const view1 = <div>
        <input />
    </div>

    const view2 = <div>
        <input />
        <span key="test"></span>
    </div>

    render(document.body, [view1], [])

    let node = (view1.domRef as HTMLDivElement).firstChild as HTMLInputElement
    node.focus()

    expect(node).toBe(document.activeElement as HTMLInputElement)

    render(document.body, [view2], [view1])

    expect(node).toBe(document.activeElement as HTMLInputElement)

    done()
})

