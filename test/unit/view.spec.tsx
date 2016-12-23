import { defineComponent, mountComponent, evolve, ElementDescriptor } from 'core'
import { render } from 'core/view'
import { initComponent } from 'core/component'
import * as jsxFactory from 'core/jsxFactory'

const randomName = () => Math.random().toString()

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
describe('core.view.render', () => {

    beforeEach((done) => {
        // "Clear view" before each test
        Array.prototype.slice.call(document.body.childNodes).forEach((c: Node) => document.body.removeChild(c))

        done()
    })

    it('creates and returns a text node from a text node descriptor', (done) => {
        const view = <text>a text</text>

        render(document.body, view, view, undefined)

        expect(view.node!.nodeType).toBe(Node.TEXT_NODE)
        expect(view.node!.nodeValue).toBe('a text')

        done()
    })

    it('updates a text node with a new value', (done) => {
        const view1 = <text>a text</text>
        const view2 = <text>a new text</text>

        render(document.body, view1, view1, undefined)
        let node = view1.node!
        expect(node.nodeValue).toBe('a text')

        render(document.body, view2, view1, node)
        node = view2.node!
        expect(node.nodeValue).toBe('a new text')

        done()
    })

    it('creates and returns a "nothing" comment node from a nothing node descriptor', (done) => {
        const view = <nothing />

        render(document.body, view, view, undefined)
        const node = view.node!
        expect(node.nodeType).toBe(Node.COMMENT_NODE)
        expect(node.nodeValue).toBe('Nothing')

        done()
    })

    it('mounts a component from a component node descriptor', (done) => {
        const TestComponent = defineComponent({
            name: 'TestComponent1',
            init: { state: undefined },
            view: (_) => <div id="testComponent"></div>
        })

        const view = <div><TestComponent /></div>

        render(document.body, view, view, undefined)
        const node = view.node as HTMLDivElement
        expect((node.childNodes[0] as HTMLDivElement).id).toBe('testComponent')

        done()
    })

    it('remounts a component if forceUpdate is set to true', (done) => {
        const mocks = {
            mount: (m: any) => evolve(m)
        }

        spyOn(mocks, 'mount').and.callThrough()

        const testComponent = defineComponent({
            name: 'TestComponent2',
            init: { state: undefined },
            onMount: mocks.mount,
            view: (_) => <div id="testComponent"></div>
        })

        const view1 = testComponent({})
        const view2 = testComponent({ forceUpdate: true })

        render(document.body, view1, view1, undefined)
        const node = view1.node! as HTMLDivElement
        const componentId = view1.id

        render(document.body, view2, view1, node)

        expect(view2.id).toBe(componentId)
        expect(mocks.mount).toHaveBeenCalledTimes(2)

        done()
    })

    it(`render unmounts a component when it's replaced`, (done) => {
        const mocks = {
            unmount: (s: any) => {
                done()
                return evolve(s)
            }
        }

        spyOn(mocks, 'unmount').and.callThrough()

        const TestComponent = defineComponent({
            name: 'TestComponent3',
            init: { state: undefined },
            onUnmount: mocks.unmount,
            view: (_) => <div></div>
        })
        const instance = TestComponent({})
        initComponent(instance, document.body)

        render(document.body, <nothing />, instance, undefined)

        expect(mocks.unmount).toHaveBeenCalledTimes(1)
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

        render(document.body, view1, view1, undefined)
        let node = view1.node as HTMLDivElement

        expect(node.childElementCount).toBe(viewItems1.length)

        render(document.body, view2, view1, node)
        node = view2.node as HTMLDivElement

        expect(node.childElementCount).toBe(viewItems2.length)

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
        render(document.body, view1, view1, undefined)

        let node = view1.node as HTMLDivElement

        expect(node.childElementCount).toBe(viewItems1.length)

        render(document.body, view2, view1, node)
        node = view2.node as HTMLDivElement

        expect(node.childElementCount).toBe(viewItems2.length)

        done()
    })

    it('creates and returns an element node from an element node descriptor', (done) => {
        const view = <div />

        render(document.body, view, view, undefined)
        const node = view.node as Element

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

        render(document.body, view, view, undefined)

        const node = view.node as HTMLInputElement

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
            onclickUpdate: () => {

            }
        }
        spyOn(mocks, 'onclickUpdate')

        const view =
            <button onclick={mocks.onclickUpdate}></button>

        render(document.body, view, view, undefined)

        const node = view.node as HTMLButtonElement
        expect(node.onclick).not.toBeNull()

        node.click()

        expect(mocks.onclickUpdate).toHaveBeenCalledTimes(1)

        done()
    })

    it('replaces the old event listener with a the new one', (done) => {
        const mocks = {
            onclickUpdate1: () => {
            },

            onclickUpdate2: () => {
            }
        }
        spyOn(mocks, 'onclickUpdate1')
        spyOn(mocks, 'onclickUpdate2')

        const view1 = <button onclick={mocks.onclickUpdate1}></button>

        const view2 = <button onclick={mocks.onclickUpdate2}></button>

        render(document.body, view1, view1, undefined)

        let node = view1.node as HTMLButtonElement

        render(document.body, view2, view1, node)

        node = view2.node as HTMLButtonElement

        node.click()

        expect(mocks.onclickUpdate1).not.toHaveBeenCalled()
        expect(mocks.onclickUpdate2).toHaveBeenCalledTimes(1)

        done()
    })

    it('calls element.focus() when focus attribute is set to true', (done) => {

        const view = <input focus={true} />

        render(document.body, view, view, undefined)

        const node = view.node as HTMLTextAreaElement

        expect(node).toEqual(document.activeElement)

        done()
    })


    it('updates attributes if they have changed', (done) => {
        const view1 =
            <div class="foo" id="bar"></div>

        const view2 =
            <div class="bar" id="foo"></div>

        render(document.body, view1, view1, undefined)

        let node = view1.node as HTMLDivElement

        expect(node.className).toBe('foo')
        expect(node.id).toBe('bar')

        render(document.body, view2, view1, node)

        node = view2.node as HTMLDivElement

        expect(node.className).toBe('bar')
        expect(node.id).toBe('foo')

        done()
    })

    it('removes attributes from existing element', (done) => {
        const view1 =
            <div class="foo" id="bar"></div>

        const view2 =
            <div class="foo"></div>

        render(document.body, view1, view1, undefined)

        let node = view1.node as HTMLDivElement

        expect(node.id).toBe('bar')

        render(document.body, view2, view1, node)

        node = view2.node as HTMLDivElement

        expect(node.id).toBe('')

        done()
    })

    it('removes attributes from existing element if the attribute is undefined', (done) => {
        const view1 =
            <div class="foo" id="bar"></div>

        const view2 =
            <div class="foo" id={undefined}></div>

        render(document.body, view1, view1, undefined)

        let node = view1.node as HTMLDivElement

        expect(node.id).toBe('bar')

        render(document.body, view2, view1, node)

        node = view2.node as HTMLDivElement

        expect(node.id).toBe('')

        done()
    })

    it('replaces the element if the tagName has changed', (done) => {
        const view1 = <div />

        const view2 = <span />

        render(document.body, view1, view1, undefined)

        let node = view1.node as HTMLDivElement

        (node as any)._id = 1
        expect(node.tagName).toBe('DIV')

        render(document.body, view2, view1, node)

        node = view2.node as HTMLDivElement

        expect((node as any)._id).not.toBeDefined()
        expect(node.tagName).toBe('SPAN')

        done()
    })

    it('removes old event listeners when element is replaced', (done) => {
        const view1 = <button onclick={() => (m: any) => m} />

        const view2 = <nothing />

        render(document.body, view1, view1, undefined)

        const node = view1.node as HTMLButtonElement

        expect(node.onclick).not.toBeNull()

        render(document.body, view2, view1, node)

        expect(node.onclick).toBeNull()

        done()
    })


    it('passes props to the view context', () => {

        type ChildComponentProps = {
            test: string
        }

        const mocks = {
            assertProps: (props: ChildComponentProps) =>
                expect(props).toEqual({ test: 'test' })
        }

        spyOn(mocks, 'assertProps').and.callThrough()

        const ChildComponent = defineComponent<undefined, ChildComponentProps>({
            name: 'ChildComponent',
            init: {
                state: undefined
            },
            view: ctx => {
                mocks.assertProps(ctx.props)
                return <nothing />
            }
        })

        const ParentComponent = defineComponent({
            name: 'ParentComponent',
            init: { state: undefined },
            view: () => <ChildComponent test="test" />
        })

        mountComponent(ParentComponent, document.body)

        expect(mocks.assertProps).toHaveBeenCalledTimes(1)
    })

    it('retains view state when element children are reordered with keys', () => {

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

        const setClicked = (s: State) =>
            evolve(s, x => x.clicked = true)

        const ItemComponent = defineComponent<State, Props>({
            name: randomName(),
            init: { state: { clicked: false, itemId: -1 } },
            onMount: (s, p) => evolve(s, x => x.itemId = p.item.id),
            view: ctx =>
                <button id={`item-${ctx.state.itemId}`}
                    class={ctx.state.clicked ? "clicked" : ""}
                    onclick={_ => ctx.apply(setClicked)}>
                </button>
        })

        const view1 =
            <div>
                {items.map(x => <div key={x.id}><ItemComponent forceUpdate item={x} /></div>)}
            </div>

        render(document.body, view1, view1, undefined)

        let btn = (view1.node as HTMLDivElement).querySelector('button') !
        btn.click()

        expect(btn.className).toBe("clicked")
        expect(btn.id).toBe("item-1")

        const view2 =
            <div>
                {items.reverse().map(x => <div key={x.id}><ItemComponent forceUpdate item={x} /></div>)}
            </div>

        render(document.body, view2, view1, view1.node)

        btn = (view2.node as HTMLDivElement).querySelector('button') !
        expect(btn.id).toBe("item-5")
        expect(btn.className).toBe("")

        // The last element shoul've been updated
        btn = ((view2.node as HTMLDivElement).lastChild as HTMLDivElement).firstChild as HTMLButtonElement

        expect(btn.id).toBe("item-1")
        expect(btn.className).toBe("clicked")
    })

    it('does not retain view state when element children are reordered without keys', () => {

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

        const setClicked = (s: State) =>
            evolve(s, x => x.clicked = true)

        const ItemComponent = defineComponent<State, Props>({
            name: randomName(),
            init: { state: { clicked: false, itemId: -1 } },
            onMount: (s, p) => evolve(s, x => x.itemId = p.item.id),
            view: ctx =>
                <button id={`item-${ctx.state.itemId}`}
                    class={ctx.state.clicked ? "clicked" : ""}
                    onclick={_ => ctx.apply(setClicked)}>
                </button>
        })

        const view1 =
            <div>
                {items.map(x => <div><ItemComponent forceUpdate item={x} /></div>)}
            </div>

        render(document.body, view1, view1, undefined)

        let btn = (view1.node as HTMLDivElement).querySelector('button') !
        btn.click()

        expect(btn.className).toBe("clicked")
        expect(btn.id).toBe("item-1")

        const view2 =
            <div>
                {items.reverse().map(x => <div><ItemComponent forceUpdate item={x} /></div>)}
            </div>

        render(document.body, view2, view1, view1.node)

        btn = (view2.node as HTMLDivElement).querySelector('button') !
        expect(btn.id).toBe("item-5")
        expect(btn.className).toBe("clicked")

        // The last element shoul've been updated
        btn = ((view2.node as HTMLDivElement).lastChild as HTMLDivElement).firstChild as HTMLButtonElement

        expect(btn.id).toBe("item-1")
        expect(btn.className).toBe("")
    })

    it('retains view state when component children are reordered with keys', () => {

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
        type Props = { key: number; item: Item }

        const setClicked = (s: State) =>
            evolve(s, x => x.clicked = true)

        const ItemComponent = defineComponent<State, Props>({
            name: randomName(),
            init: { state: { clicked: false, itemId: -1 } },
            onMount: (s, p) => evolve(s, x => x.itemId = p.item.id),
            view: ctx =>
                <button
                    id={`item-${ctx.state.itemId}`}
                    class={ctx.state.clicked ? "clicked" : ""}
                    onclick={_ => ctx.apply(setClicked)}>
                </button>
        })

        const view1 =
            <div>
                {items.map(x => <ItemComponent key={x.id} item={x} />)}
            </div>

        render(document.body, view1, view1, undefined)

        let btn = (view1.node as HTMLDivElement).querySelector('button') !
        btn.click()

        expect(btn.className).toBe("clicked")
        expect(btn.id).toBe("item-1")

        const view2 =
            <div>
                {items.reverse().map(x => <ItemComponent key={x.id} item={x} />)}
            </div>

        render(document.body, view2, view1, view1.node)

        btn = (view2.node as HTMLDivElement).querySelector('button') !
        expect(btn.className).toBe("")
        expect(btn.id).toBe("item-5")

        // The last element should've been updated
        btn = (view2.node as HTMLDivElement).lastChild as HTMLButtonElement
        expect(btn.className).toBe("clicked")
        expect(btn.id).toBe("item-1")
    })

    it('does not retain view state when component children reordered without keys', () => {

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
        type Props = { item: Item }

        const setClicked = (s: State) =>
            evolve(s, x => x.clicked = true)

        const ItemComponent = defineComponent<State, Props>({
            name: randomName(),
            init: { state: { clicked: false, itemId: -1 } },
            onMount: (s, p) => evolve(s, x => x.itemId = p.item.id),
            view: ctx =>
                <button
                    id={`item-${ctx.state.itemId}`}
                    class={ctx.state.clicked ? "clicked" : ""}
                    onclick={_ => ctx.apply(setClicked)}>
                </button>
        })

        const view1 =
            <div>
                {items.map(x => <ItemComponent item={x} />)}
            </div>

        render(document.body, view1, view1, undefined)

        let btn = (view1.node as HTMLDivElement).querySelector('button') !
        btn.click()

        expect(btn.className).toBe("clicked")
        expect(btn.id).toBe("item-1")

        const view2 =
            <div>
                {items.reverse().map(x => <ItemComponent item={x} />)}
            </div>

        render(document.body, view2, view1, view1.node)

        btn = (view2.node as HTMLDivElement).querySelector('button') !
        expect(btn.className).toBe("clicked")
        expect(btn.id).toBe("item-5")

        // The last element should've been updated
        btn = (view2.node as HTMLDivElement).lastChild as HTMLButtonElement
        expect(btn.className).toBe("")
        expect(btn.id).toBe("item-1")
    })

    it('retains component state when component children are reordered with keys', () => {

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
        type Props = { key: number; item: Item; forceUpdate: boolean }

        const setClicked = (s: State) =>
            evolve(s, x => x.clicked = true)

        let btnDescriptor: ElementDescriptor<HTMLButtonElement> | undefined = undefined

        const ItemComponent = defineComponent<State, Props>({
            name: randomName(),
            init: { state: { clicked: false, itemId: -1 } },
            onMount: (s, p) => evolve(s, x => x.itemId = p.item.id),
            view: ctx => {
                const v = <button id={`item-${ctx.state.itemId}`} class={ctx.state.clicked ? "clicked" : ""}
                    onclick={_ => ctx.apply(setClicked)}>
                </button>
                if (ctx.state.itemId === 1) {
                    btnDescriptor = v as ElementDescriptor<HTMLButtonElement>
                }
                return v
            }
        })

        const view1 =
            <div>
                {items.map(x => <ItemComponent key={x.id} item={x} forceUpdate={true} />)}
            </div> as ElementDescriptor<HTMLDivElement>

        render(document.body, view1, view1, undefined)

        let btn = view1.node!.querySelector('button') !
        btn.click()

        expect(btn.className).toBe("clicked")
        expect(btn.id).toBe("item-1")

        // Clear id so it's set from state
        btn.id = ""
        btn.className = ""
        // We also need to modify the descriptor, else the attributes won't be updated

        delete btnDescriptor!.attributes.id
        delete btnDescriptor!.attributes.class
        const reversedItems = items.reverse()
        const view2 =
            <div>
                {reversedItems.map(x => <ItemComponent key={x.id} item={x} forceUpdate={true} />)}
            </div> as ElementDescriptor<HTMLDivElement>

        render(document.body, view2, view1, view1.node)

        btn = view2.node!.querySelector('button') !
        expect(btn.className).toBe("")
        expect(btn.id).toBe("item-5")

        // The last element should've been updated with the same values
        btn = view2.node!.lastChild as HTMLButtonElement
        expect(btn.className).toBe("clicked")
        expect(btn.id).toBe("item-1")
    })

    it('does not retain component state when component children are reordered without keys', () => {

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

        const setClicked = (s: State) =>
            evolve(s, x => x.clicked = true)

        let btnDescriptor: ElementDescriptor<HTMLButtonElement> | undefined = undefined

        const ItemComponent = defineComponent<State, Props>({
            name: randomName(),
            init: { state: { clicked: false, itemId: -1 } },
            onMount: (s, p) => evolve(s, x => x.itemId = p.item.id),
            view: ctx => {
                const v = <button id={`item-${ctx.state.itemId}`} class={ctx.state.clicked ? "clicked" : ""}
                    onclick={_ => ctx.apply(setClicked)}>
                </button>
                if (ctx.state.itemId === 1) {
                    btnDescriptor = v as ElementDescriptor<HTMLButtonElement>
                }
                return v
            }
        })

        const view1 =
            <div>
                {items.map(x => <ItemComponent item={x} forceUpdate={true} />)}
            </div> as ElementDescriptor<HTMLDivElement>

        render(document.body, view1, view1, undefined)

        let btn = view1.node!.querySelector('button') !
        btn.click()

        expect(btn.className).toBe("clicked")
        expect(btn.id).toBe("item-1")

        // Clear id so it's set from state
        btn.id = ""
        btn.className = ""
        // We also need to modify the descriptor, else the attributes won't be updated

        delete btnDescriptor!.attributes.id
        delete btnDescriptor!.attributes.class
        const reversedItems = items.reverse()
        const view2 =
            <div>
                {reversedItems.map(x => <ItemComponent item={x} forceUpdate={true} />)}
            </div> as ElementDescriptor<HTMLDivElement>

        render(document.body, view2, view1, view1.node)

        btn = view2.node!.querySelector('button') !
        expect(btn.className).toBe("clicked")
        expect(btn.id).toBe("item-5")

        // The last element should've been updated with the same values
        btn = view2.node!.lastChild as HTMLButtonElement
        expect(btn.className).toBe("")
        expect(btn.id).toBe("item-1")
    })

    it('unmounts a component which is a child of removed descriptor', () => {
        const mountMock = {
            unmount: (x: number) => evolve(x)
        }

        spyOn(mountMock, 'unmount').and.callThrough()

        const ChildComponent = defineComponent({
            name: randomName(),
            init: { state: 0 },
            onUnmount: mountMock.unmount,
            view: () => <div />
        })

        const view1 = <div><div><ChildComponent /></div></div>
        render(document.body, view1, view1, undefined)

        const view2 = <div></div>
        render(document.body, view2, view1, view1.node)

        expect(mountMock.unmount).toHaveBeenCalledTimes(1)
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
