import * as myra from '../src/myra'
import { render } from '../src/component'
import { ComponentProps, TextVNode, VNodeType } from '../src/contract'
import { expect } from 'chai'
import * as sinon from 'sinon'

const q = (x: string) => document.querySelector(x)

describe('fragment', () => {
    beforeEach((done) => {
        // "Clear view" before each test
        Array.prototype.slice.call(document.body.childNodes).forEach((c: Node) => document.body.removeChild(c))

        done()
    })

    it('renders fragment content', done => {

        const Component = () => <><div id="fragment-node1" /></>

        myra.mount(<Component />, document.body)

        requestAnimationFrame(() => {
            const node = q('body > #fragment-node1')

            expect(node).not.to.be.null

            done()
        })
    })

    it('renders fragment content replacing a nothing node', () => {

        const fragmentContainer = document.createElement('div')
        document.body.appendChild(fragmentContainer)

        const view1 = <nothing />

        render(fragmentContainer, [view1], [])

        const view2 =
            <>
                <div></div>
                <div></div>
            </>

        render(fragmentContainer, [view2], [view1])

        expect(fragmentContainer.childNodes.length).to.be.eq(2)
    })

    it('renders fragment content replacing a text node', () => {

        const fragmentContainer = document.createElement('div')
        document.body.appendChild(fragmentContainer)

        const view1: TextVNode = {
            _: VNodeType.Text,
            text: 'text'
        }

        render(fragmentContainer, [view1], [])

        const view2 =
            <>
                <div></div>
                <div></div>
            </>

        render(fragmentContainer, [view2], [view1])

        expect(fragmentContainer.childNodes.length).to.be.eq(2)
    })


    it('renders fragment content replacing an element node', () => {

        const fragmentContainer = document.createElement('div')
        document.body.appendChild(fragmentContainer)

        const view1 = <span></span>

        render(fragmentContainer, [view1], [])

        const view2 =
            <>
                <div></div>
                <div></div>
            </>

        render(fragmentContainer, [view2], [view1])

        expect(fragmentContainer.childNodes.length).to.be.eq(2)
        expect((fragmentContainer.firstChild as Element).tagName).to.be.eq('DIV')
        expect((fragmentContainer.lastChild as Element).tagName).to.be.eq('DIV')
    })


    it('renders fragment content replacing a component node', () => {

        const fragmentContainer = document.createElement('div')
        document.body.appendChild(fragmentContainer)

        const Component = () => <span></span>

        const view1 = <Component />
        render(fragmentContainer, [view1], [])

        const view2 =
            <>
                <div></div>
                <div></div>
            </>

        render(fragmentContainer, [view2], [view1])

        expect(fragmentContainer.childNodes.length).to.be.eq(2)
        expect((fragmentContainer.firstChild as Element).tagName).to.be.eq('DIV')
        expect((fragmentContainer.lastChild as Element).tagName).to.be.eq('DIV')
    })

    it('renders nested fragment content', done => {

        const Component = () => <div><><div id="fragment-node2" /></></div>

        myra.mount(<Component />, document.body)

        requestAnimationFrame(() => {
            const node = q('body > div > #fragment-node2')

            expect(node).not.to.be.null

            done()
        })
    })


    it('renders multiple fragment child nodes', done => {

        const Component = () => <><div id="fragment-node3" /><div id="fragment-node4" /></>

        myra.mount(<Component />, document.body)

        requestAnimationFrame(() => {
            const node1 = q('body > #fragment-node3')
            const node2 = q('body > #fragment-node4')

            expect(node1).not.to.be.null
            expect(node2).not.to.be.null

            done()
        })
    })

    it('renders fragment in fragment child nodes', done => {

        const Component = () => <><><div id="fragment-node5" /><div id="fragment-node6" /></></>

        const fragmentContainer = document.createElement('div')
        document.body.appendChild(fragmentContainer)

        myra.mount(<Component />, fragmentContainer)

        requestAnimationFrame(() => {
            const node1 = fragmentContainer.firstChild
            const node2 = fragmentContainer.lastChild

            expect(node1).not.to.be.null
            expect((node1 as HTMLElement).id).to.be.eq('fragment-node5')
            expect(node2).not.to.be.null
            expect((node2 as HTMLElement).id).to.be.eq('fragment-node6')

            done()
        })
    })

    it('renders special fragment child nodes', done => {

        const ChildComponent = () => <div id="fragment-child1"></div>
        const Component = () => <><nothing /><ChildComponent /></>

        const fragmentContainer = document.createElement('div')
        document.body.appendChild(fragmentContainer)

        myra.mount(<Component />, fragmentContainer)

        requestAnimationFrame(() => {
            const nothingNode = fragmentContainer.firstChild
            const childNode = fragmentContainer.firstElementChild
            expect(nothingNode).not.to.be.null
            expect(nothingNode?.nodeType).to.be.eq(Node.COMMENT_NODE)
            expect(childNode).not.to.be.null

            done()
        })
    })

    it('removes child nodes', done => {

        let setDidRenderOuter: myra.Evolve<boolean> = function () { return true }
        const Component = () => {
            const [didRender, setDidRender] = myra.useState(false)
            setDidRenderOuter = setDidRender

            return (
                <>
                    {!didRender &&
                        <div id="fragment-child2"></div>
                    }
                </>
            )
        }

        const fragmentContainer = document.createElement('div')
        document.body.appendChild(fragmentContainer)

        myra.mount(<Component />, fragmentContainer)

        setDidRenderOuter(true)
        requestAnimationFrame(() => {
            const childNode = fragmentContainer.firstElementChild
            expect(childNode).to.be.null
            done()
        })
    })

    it('removes DOM nodes when fragment is removed', done => {

        const fragmentContainer = document.createElement('div')
        document.body.appendChild(fragmentContainer)

        const view1 =
            <div>
                <div></div>
                <>
                    <div id="a"></div>
                    <div id="b"></div>
                    <div id="c"></div>
                </>
                <div></div>
            </div>

        render(fragmentContainer, [view1], [])

        expect(fragmentContainer.firstChild?.childNodes.length).to.be.eq(5)

        const view2 =
            <div>
                <div></div>
            </div>


        render(fragmentContainer, [view2], [view1])

        expect(fragmentContainer.firstChild?.childNodes.length).to.be.eq(1)
        expect(fragmentContainer.firstChild?.firstChild?.nodeType).to.be.eq(Node.ELEMENT_NODE)
        done()
    })

    it('removes DOM nodes when component with a child fragment is removed', done => {

        const fragmentContainer = document.createElement('div')
        document.body.appendChild(fragmentContainer)

        const Component = () =>

            <>
                <div id="a"></div>
                <div id="b"></div>
                <div id="c"></div>
            </>

        const view1 =
            <div>
                <div id="x"></div>
                <Component />
                <div></div>
            </div>

        render(fragmentContainer, [view1], [])

        expect(fragmentContainer.firstChild?.childNodes.length).to.be.eq(5)

        const view2 =
            <div>
                <div id="x"></div>
            </div>


        render(fragmentContainer, [view2], [view1])

        expect(fragmentContainer.firstChild?.childNodes.length).to.be.eq(1)
        expect((fragmentContainer.firstChild?.firstChild as HTMLElement).id).to.be.eq('x')
        done()
    })

    it('removes DOM nodes when fragment structure is removed', done => {

        const fragmentContainer = document.createElement('div')
        document.body.appendChild(fragmentContainer)

        const Component = () =>
            <>
                <div></div>
                <div></div>
            </>

        const view1 =
            <div>
                <div id="x"></div>
                <>
                    <div id="a"></div>
                    <div id="b"></div>
                    <div id="c"></div>
                    <>
                        <div id="d"></div>
                        <div id="e"></div>
                        <Component />
                    </>
                </>
                <div id="y"></div>
            </div>

        render(fragmentContainer, [view1], [])

        expect(fragmentContainer.firstChild?.childNodes.length).to.be.eq(9)

        const view2 =
            <div>
                <div id="x"></div>
            </div>


        render(fragmentContainer, [view2], [view1])

        expect(fragmentContainer.firstChild?.childNodes.length).to.be.eq(1)
        expect((fragmentContainer.firstChild?.firstChild as HTMLElement).id).to.be.eq('x')
        done()
    })

    it('removes DOM nodes when fragment structure is replaced by element node', done => {

        const fragmentContainer = document.createElement('div')
        document.body.appendChild(fragmentContainer)

        const Component = () =>
            <>
                <div></div>
                <div></div>
            </>

        const view1 =
            <div>
                <div id="x"></div>
                <>
                    <div id="a"></div>
                    <div id="b"></div>
                    <div id="c"></div>
                    <>
                        <div id="d"></div>
                        <div id="e"></div>
                        <Component />
                    </>
                </>
            </div>

        render(fragmentContainer, [view1], [])

        expect(fragmentContainer.firstChild?.childNodes.length).to.be.eq(8)

        const view2 =
            <div>
                <div id="x"></div>
                <div id="y"></div>
            </div>


        render(fragmentContainer, [view2], [view1])

        expect(fragmentContainer.firstChild?.childNodes.length).to.be.eq(2)
        expect((fragmentContainer.firstChild?.firstChild as HTMLElement).id).to.be.eq('x')
        expect((fragmentContainer.firstChild?.lastChild as HTMLElement).id).to.be.eq('y')
        done()
    })

    it('removes DOM nodes when fragment structure with component children is replaced by element node', done => {

        const fragmentContainer = document.createElement('div')
        document.body.appendChild(fragmentContainer)

        const ComponentA = ({ children }: ComponentProps) => <div>{children}</div>
        const ComponentB = () =>
            <>
                <div id="x"></div>
                <span id="y"></span>
            </>

        const view1 =
            <>
                <ComponentA><p></p></ComponentA>
                <ComponentA />
            </>

        render(fragmentContainer, [view1], [])

        expect(fragmentContainer.childNodes.length).to.be.eq(2)

        const view2 =
            <div>
                <ComponentB />
            </div>


        render(fragmentContainer, [view2], [view1])

        expect(fragmentContainer.firstChild?.childNodes.length).to.be.eq(2)
        expect((fragmentContainer.firstChild?.firstChild as HTMLElement).id).to.be.eq('x')
        expect((fragmentContainer.firstChild?.lastChild as HTMLElement).id).to.be.eq('y')
        done()
    })

    it('removes DOM nodes when fragment structure is replaced by nothing node', done => {

        const fragmentContainer = document.createElement('div')
        document.body.appendChild(fragmentContainer)

        const Component = () =>
            <>
                <div></div>
                <div></div>
            </>

        const view1 =
            <div>
                <div id="x"></div>
                <>
                    <div id="a"></div>
                    <div id="b"></div>
                    <div id="c"></div>
                    <>
                        <div id="d"></div>
                        <div id="e"></div>
                        <Component />
                    </>
                </>
            </div>

        render(fragmentContainer, [view1], [])

        expect(fragmentContainer.firstChild?.childNodes.length).to.be.eq(8)

        const view2 =
            <div>
                <div id="x"></div>
                <nothing />
            </div>


        render(fragmentContainer, [view2], [view1])

        expect(fragmentContainer.firstChild?.childNodes.length).to.be.eq(2)
        expect((fragmentContainer.firstChild?.firstChild as HTMLElement).id).to.be.eq('x')
        expect(fragmentContainer.firstChild?.lastChild?.nodeType).to.be.eq(Node.COMMENT_NODE)
        done()
    })

    it('removes DOM nodes when fragment structure is replaced by text node', done => {

        const fragmentContainer = document.createElement('div')
        document.body.appendChild(fragmentContainer)

        const Component = () =>
            <>
                <div></div>
                <div></div>
            </>

        const view1 =
            <div>
                <div id="x"></div>
                <>
                    <div id="a"></div>
                    <div id="b"></div>
                    <div id="c"></div>
                    <>
                        <div id="d"></div>
                        <div id="e"></div>
                        <Component />
                    </>
                </>
            </div>

        render(fragmentContainer, [view1], [])

        expect(fragmentContainer.firstChild?.childNodes.length).to.be.eq(8)

        const view2 =
            <div>
                <div id="x"></div>
                text
            </div>


        render(fragmentContainer, [view2], [view1])

        expect(fragmentContainer.firstChild?.childNodes.length).to.be.eq(2)
        expect((fragmentContainer.firstChild?.firstChild as HTMLElement).id).to.be.eq('x')
        expect(fragmentContainer.firstChild?.lastChild?.nodeType).to.be.eq(Node.TEXT_NODE)
        expect(fragmentContainer.firstChild?.lastChild?.textContent).to.be.eq('text')
        done()
    })

    it('removes fragment in fragment child nodes', done => {

        let setDidRenderOuter: myra.Evolve<boolean> = function () { return true }
        const Component = () => {
            const [didRender, setDidRender] = myra.useState(false)
            setDidRenderOuter = setDidRender

            return (
                <>
                    <>
                        {!didRender &&
                            <>
                                <div id="fragment-child3"></div>
                            </>
                        }
                    </>
                </>
            )
        }

        const fragmentContainer = document.createElement('div')
        document.body.appendChild(fragmentContainer)

        myra.mount(<Component />, fragmentContainer)

        setDidRenderOuter(true)
        requestAnimationFrame(() => {
            const childNode = fragmentContainer.firstElementChild
            expect(childNode).to.be.null
            done()
        })
    })


    it('renders a nothing node if fragment has no children', done => {

        const fragmentContainer = document.createElement('div')
        fragmentContainer.className = 'fragment-container'
        document.body.appendChild(fragmentContainer)

        const view1 =
            <>
            </>

        render(fragmentContainer, [view1], [])

        const nothingNode = fragmentContainer.firstChild
        expect(nothingNode).not.to.be.null
        expect(nothingNode?.nodeType).to.be.eq(Node.COMMENT_NODE)
        done()
    })

    it('removes component fragment child nodes when replaced by nothing node', done => {

        const fragmentContainer = document.createElement('div')
        fragmentContainer.className = 'fragment-container'
        document.body.appendChild(fragmentContainer)

        const ChildComponent = () => <><div></div></>
        const view1 =
            <>
                <ChildComponent />
            </>

        render(fragmentContainer, [view1], [])

        const view2 = <>
            <nothing />
        </>

        render(fragmentContainer, [view2], [view1])

        const nothingNode = fragmentContainer.firstChild
        expect(nothingNode).not.to.be.null
        expect(nothingNode?.nodeType).to.be.eq(Node.COMMENT_NODE)
        done()
    })

    it('removes component fragment child nodes when replaced by text node', done => {

        const fragmentContainer = document.createElement('div')
        fragmentContainer.className = 'fragment-container'
        document.body.appendChild(fragmentContainer)

        const ChildComponent = () => <><div></div></>
        const view1 =
            <>
                <ChildComponent />
            </>

        render(fragmentContainer, [view1], [])

        const view2 = <>
            text
        </>

        render(fragmentContainer, [view2], [view1])

        const textNode = fragmentContainer.firstChild
        expect(textNode).not.to.be.null
        expect(textNode?.nodeType).to.be.eq(Node.TEXT_NODE)
        expect(textNode?.textContent).to.be.eq('text')
        done()
    })

    it('removes component fragment child nodes when replaced by element node', done => {

        const fragmentContainer = document.createElement('div')
        fragmentContainer.className = 'fragment-container'
        document.body.appendChild(fragmentContainer)

        const ChildComponent = () => <><div></div></>
        const view1 =
            <>
                <ChildComponent />
            </>

        render(fragmentContainer, [view1], [])

        const view2 = <>
            <span></span>
        </>

        render(fragmentContainer, [view2], [view1])

        const textNode = fragmentContainer.firstChild
        expect(textNode).not.to.be.null
        expect(textNode?.nodeType).to.be.eq(Node.ELEMENT_NODE)
        expect((textNode as Element).tagName).to.be.eq('SPAN')
        done()
    })

    it('removes component fragment child nodes when replaced by memo node', done => {

        const fragmentContainer = document.createElement('div')
        fragmentContainer.className = 'fragment-container'
        document.body.appendChild(fragmentContainer)

        const ChildComponent = () => <><div></div></>
        const view1 =
            <>
                <ChildComponent />
            </>

        render(fragmentContainer, [view1], [])

        const Memo = myra.memo(() =>
            <>
                <span></span>
            </>
        )
        const view2 = <Memo />

        render(fragmentContainer, [view2], [view1])

        const node = fragmentContainer.firstChild
        expect(node).not.to.be.null
        expect(node?.nodeType).to.be.eq(Node.ELEMENT_NODE)
        expect((node as Element).tagName).to.be.eq('SPAN')
        done()
    })


    it('updates element attributes when a fragment is replaced by an element node', done => {

        const fragmentContainer = document.createElement('div')
        fragmentContainer.className = 'fragment-container'
        document.body.appendChild(fragmentContainer)


        const view1 =
            <>
                <div class="A" title="A"></div>
            </>

        render(fragmentContainer, [view1], [])

        const view2 =
            <div title="B"></div>


        render(fragmentContainer, [view2], [view1])

        const element = fragmentContainer.firstChild as Element
        const titleAttr = element.attributes.getNamedItem('title')
        expect(element).not.to.be.null
        expect(titleAttr).not.to.be.null
        expect(titleAttr?.value).to.be.eq('B')
        expect(element.classList.length).to.be.eq(0)
        done()
    })

    it('replaces and inserts fragment child nodes in correct order', () => {

        const fragmentContainer = document.createElement('div')
        document.body.appendChild(fragmentContainer)

        const view1 = <div>
            <>
                <span>
                    A1
                </span>
            </>
            <span>
                B1
            </span>
        </div>

        render(fragmentContainer, [view1], [])

        const view2 = <table>
            <>
                <div>A2</div>
                <div>B2</div>
                <>
                    <div>C2</div>
                    <div>D2</div>
                </>
            </>
            <span>E2</span>
        </table>

        render(fragmentContainer, [view2], [view1])

        const div = fragmentContainer.firstChild as HTMLDivElement

        expect(div.childNodes.length).to.be.eq(5)
        expect(div.childNodes[0].textContent).to.be.eq('A2')
        expect((div.childNodes[0] as Element).tagName).to.be.eq('DIV')
        expect(div.childNodes[1].textContent).to.be.eq('B2')
        expect((div.childNodes[1] as Element).tagName).to.be.eq('DIV')
        expect(div.childNodes[2].textContent).to.be.eq('C2')
        expect((div.childNodes[2] as Element).tagName).to.be.eq('DIV')
        expect(div.childNodes[3].textContent).to.be.eq('D2')
        expect((div.childNodes[3] as Element).tagName).to.be.eq('DIV')
        expect(div.childNodes[4].textContent).to.be.eq('E2')
        expect((div.childNodes[4] as Element).tagName).to.be.eq('SPAN')

    })

    it('replaces and inserts nested fragment child nodes in correct order', () => {

        const fragmentContainer = document.createElement('div')
        document.body.appendChild(fragmentContainer)

        const view1 = <>
            <>
                A
                <>
                    A-A
                </>
            </>
            <>
                B
            </>
        </>

        render(fragmentContainer, [view1], [])

        const view2 = <>
            <>
                A
                <>
                    A-A
                </>
                <>
                    A-B
                </>
            </>
            <>
                B
            </>
        </>

        render(fragmentContainer, [view2], [view1])

        expect(fragmentContainer.childNodes.length).to.be.eq(4)
        expect(fragmentContainer.childNodes[0].textContent).to.be.eq('A')
        expect(fragmentContainer.childNodes[1].textContent).to.be.eq('A-A')
        expect(fragmentContainer.childNodes[2].textContent).to.be.eq('A-B')
        expect(fragmentContainer.childNodes[3].textContent).to.be.eq('B')

    })

    it('removes fragment in fragment child nodes', done => {

        let setItemsOuter: myra.Evolve<string[]>
        const Component = () => {
            const [items, setItems] = myra.useState(['a', 'b', 'c'])
            setItemsOuter = setItems
            return (
                <>
                    {items.map(x =>
                        <>
                            <div id={'element1' + x}></div>
                            <div id={'element2' + x}></div>
                            <>
                                <div id={'element3' + x}></div>
                            </>
                        </>
                    )

                    }
                </>
            )
        }

        const fragmentContainer = document.createElement('div')
        fragmentContainer.className = 'fragment-container'
        document.body.appendChild(fragmentContainer)

        myra.mount(<Component />, fragmentContainer)

        requestAnimationFrame(() => {
            setItemsOuter(x => x.slice(1))

            requestAnimationFrame(() => {

                expect(fragmentContainer.childElementCount).to.be.eq(6)
                expect((fragmentContainer.firstChild as HTMLElement).id).to.be.eq('element1b')
                expect((fragmentContainer.children[1] as HTMLElement).id).to.be.eq('element2b')
                expect((fragmentContainer.children[2] as HTMLElement).id).to.be.eq('element3b')
                expect((fragmentContainer.children[3] as HTMLElement).id).to.be.eq('element1c')
                expect((fragmentContainer.children[4] as HTMLElement).id).to.be.eq('element2c')
                expect((fragmentContainer.lastChild as HTMLElement).id).to.be.eq('element3c')
                done()
            })
        })
    })

    it('removes and "unmounts" component child nodes', done => {
        const mock = sinon.spy({
            unmount: () => { }
        })
        const ChildComponent = () => {
            myra.useEffect(() => {
                return mock.unmount
            }, [])
            return <div id="fragment-child4"></div>
        }

        let setDidRenderOuter: myra.Evolve<boolean> = function () { return true }
        const Component = () => {
            const [didRender, setDidRender] = myra.useState(false)

            setDidRenderOuter = setDidRender

            return (
                <>
                    {!didRender &&
                        <ChildComponent />
                    }
                </>
            )
        }

        const fragmentContainer = document.createElement('div')
        document.body.appendChild(fragmentContainer)

        myra.mount(<Component />, fragmentContainer)

        setDidRenderOuter(true)
        requestAnimationFrame(() => {
            const childNode = fragmentContainer.firstElementChild
            expect(childNode).to.be.null

            expect(mock.unmount.callCount).to.eq(1)
            done()
        })
    })

    it('removes component with fragment child node', done => {
        const ChildComponent = () => {
            return (
                <>
                    <div id="fragment-child5"></div>
                    text
                </>
            )
        }

        let setDidRenderOuter: myra.Evolve<boolean> = function () { return true }
        const Component = () => {
            const [didRender, setDidRender] = myra.useState(false)

            setDidRenderOuter = setDidRender

            return (
                <>
                    {!didRender &&
                        <ChildComponent />
                    }
                    <div id="fragment-child6"></div>
                </>
            )
        }

        const fragmentContainer = document.createElement('div')
        document.body.appendChild(fragmentContainer)

        myra.mount(<Component />, fragmentContainer)

        requestAnimationFrame(() => {
            expect((fragmentContainer.firstChild as HTMLElement).id).to.be.eq('fragment-child5')
            expect((fragmentContainer.childNodes[1] as Node).textContent).to.be.eq('text')
            expect((fragmentContainer.lastChild as HTMLElement).id).to.be.eq('fragment-child6')

            setDidRenderOuter(true)

            requestAnimationFrame(() => {
                expect((fragmentContainer.firstChild as Node).textContent).to.be.eq('Nothing')
                expect((fragmentContainer.lastChild as HTMLElement).id).to.be.eq('fragment-child6')
                expect(fragmentContainer.childNodes.length).to.eq(2)

                done()
            })
        })
    })

    it('removes fragment non-firstChild child nodes', done => {

        let setItemsOuter: myra.Evolve<string[]>
        const Component = () => {
            const [items, setItems] = myra.useState(['a', 'b', 'c'])
            setItemsOuter = setItems
            return (
                <>
                    {items.map(x =>
                        <>
                            item {x}
                        </>
                    )}
                    <>
                        d
                    </>
                </>
            )
        }

        const fragmentContainer = document.createElement('div')
        fragmentContainer.className = 'fragment-container'
        document.body.appendChild(fragmentContainer)

        myra.mount(<Component />, fragmentContainer)

        requestAnimationFrame(() => {
            setItemsOuter(x => [x[0], x[2]])
            requestAnimationFrame(() => {

                expect(fragmentContainer.childNodes.length).to.be.eq(5)
                expect(fragmentContainer.childNodes[0].textContent).to.be.eq('item ')
                expect(fragmentContainer.childNodes[1].textContent).to.be.eq('a')
                expect(fragmentContainer.childNodes[2].textContent).to.be.eq('item ')
                expect(fragmentContainer.childNodes[3].textContent).to.be.eq('c')
                expect(fragmentContainer.childNodes[4].textContent).to.be.eq('d')
                done()
            })
        })

    })

    it('retains view state when fragment children are reordered with keys', (done) => {

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
            const [state, evolve] = myra.useState<State>({ clicked: false })

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
                {items.map(x =>
                    <myra.Fragment key={x.id.toString()}>
                        <ItemComponent item={x} />
                    </myra.Fragment>
                )}
            </div>

        render(document.body, [view1], [])

        let btn = (view1.domRef as HTMLDivElement).querySelector('button')!
        btn.click()

        requestAnimationFrame(() => {
            expect(btn.className).to.be.eq("clicked")
            expect(btn.id).to.be.eq("item-1")

            const view2 =
                <div>
                    {items.reverse().map(x =>
                        <myra.Fragment key={x.id.toString()}>
                            <ItemComponent item={x} />
                        </myra.Fragment>
                    )}
                </div>

            render(document.body, [view2], [view1])

            btn = (view2.domRef as HTMLDivElement).querySelector('button')!
            expect(btn.className).to.be.eq("")
            expect(btn.id).to.be.eq("item-5")

            // The last element should've been updated
            btn = (view2.domRef as HTMLDivElement).lastChild as HTMLButtonElement
            expect(btn.className).to.be.eq("clicked")
            expect(btn.id).to.be.eq("item-1")

            done()
        })
    })

    it('does not retain view state when fragment children reordered without keys', (done) => {

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
            const [state, evolve] = myra.useState<State>({ clicked: false })

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
                {items.map(x => <><ItemComponent item={x} /></>)}
            </div>

        render(document.body, [view1], [])

        requestAnimationFrame(() => {
            let btn = (view1.domRef as HTMLDivElement).querySelector('button')!
            btn.click()

            requestAnimationFrame(() => {
                expect(btn.className).to.be.eq("clicked")
                expect(btn.id).to.be.eq("item-1")

                const view2 =
                    <div>
                        {items.reverse().map(x => <><ItemComponent item={x} /></>)}
                    </div>

                render(document.body, [view2], [view1])

                btn = (view2.domRef as HTMLDivElement).querySelector('button')!
                expect(btn.className).to.be.eq("clicked")
                expect(btn.id).to.be.eq("item-5")

                // The last element should've been updated
                btn = (view2.domRef as HTMLDivElement).lastChild as HTMLButtonElement
                expect(btn.className).to.be.eq("")
                expect(btn.id).to.be.eq("item-1")
                done()
            })
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
            const [state, evolve] = myra.useState<State>({ clicked: false })

            const setClicked = () => evolve({ clicked: true })

            return (
                <>
                    <button id={`item-${props.item.id}`}
                        class={state.clicked ? "clicked" : ""}
                        onclick={setClicked}>
                    </button>
                </>
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
            expect(btn.className).to.be.eq("clicked")
            expect(btn.id).to.be.eq("item-1")

            const view2 =
                <div>
                    {items.reverse().map(x => <ItemComponent key={x.id.toString()} item={x} />)}
                </div>

            render(document.body, [view2], [view1])

            btn = (view2.domRef as HTMLDivElement).querySelector('button')!
            expect(btn.className).to.be.eq("")
            expect(btn.id).to.be.eq("item-5")

            // The last element should've been updated
            btn = (view2.domRef as HTMLDivElement).lastChild as HTMLButtonElement
            expect(btn.className).to.be.eq("clicked")
            expect(btn.id).to.be.eq("item-1")

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
            const [state, evolve] = myra.useState<State>({ clicked: false })

            const setClicked = () => evolve({ clicked: true })

            return (
                <>
                    <button id={`item-${props.item.id}`}
                        class={state.clicked ? "clicked" : ""}
                        onclick={setClicked}>
                    </button>
                </>
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
            expect(btn.className).to.be.eq("clicked")
            expect(btn.id).to.be.eq("item-1")

            const view2 =
                <div>
                    {items.reverse().map(x => <ItemComponent item={x} />)}
                </div>

            render(document.body, [view2], [view1])

            btn = (view2.domRef as HTMLDivElement).querySelector('button')!
            expect(btn.className).to.be.eq("clicked")
            expect(btn.id).to.be.eq("item-5")

            // The last element should've been updated
            btn = (view2.domRef as HTMLDivElement).lastChild as HTMLButtonElement
            expect(btn.className).to.be.eq("")
            expect(btn.id).to.be.eq("item-1")
            done()
        })
    })

})
