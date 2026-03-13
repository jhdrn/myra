import * as myra from '../src/myra'
import { render } from '../src/component'
import { ComponentProps, TextVNode, VNodeType } from '../src/contract'
import { expect } from 'chai'
import * as sinon from 'sinon'

const tick = (ms = 0) => new Promise<void>(resolve => setTimeout(resolve, ms))

const q = (x: string) => document.querySelector(x)

describe('fragment', () => {
    beforeEach(() => {
        // "Clear view" before each test
        Array.prototype.slice.call(document.body.childNodes).forEach((c: Node) => document.body.removeChild(c))
    })

    it('renders fragment content', async () => {

        const Component = () => <><div id="fragment-node1" /></>

        myra.mount(<Component />, document.body)

        await tick()
        const node = q('body > #fragment-node1')

        expect(node).not.to.be.null
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

    it('renders nested fragment content', async () => {

        const Component = () => <div><><div id="fragment-node2" /></></div>

        myra.mount(<Component />, document.body)

        await tick()
        const node = q('body > div > #fragment-node2')

        expect(node).not.to.be.null
    })


    it('renders multiple fragment child nodes', async () => {

        const Component = () => <><div id="fragment-node3" /><div id="fragment-node4" /></>

        myra.mount(<Component />, document.body)

        await tick()
        const node1 = q('body > #fragment-node3')
        const node2 = q('body > #fragment-node4')

        expect(node1).not.to.be.null
        expect(node2).not.to.be.null
    })

    it('renders fragment in fragment child nodes', async () => {

        const Component = () => <><><div id="fragment-node5" /><div id="fragment-node6" /></></>

        const fragmentContainer = document.createElement('div')
        document.body.appendChild(fragmentContainer)

        myra.mount(<Component />, fragmentContainer)

        await tick()
        const node1 = fragmentContainer.firstChild
        const node2 = fragmentContainer.lastChild

        expect(node1).not.to.be.null
        expect((node1 as HTMLElement).id).to.be.eq('fragment-node5')
        expect(node2).not.to.be.null
        expect((node2 as HTMLElement).id).to.be.eq('fragment-node6')
    })

    it('renders special fragment child nodes', async () => {

        const ChildComponent = () => <div id="fragment-child1"></div>
        const Component = () => <><nothing /><ChildComponent /></>

        const fragmentContainer = document.createElement('div')
        document.body.appendChild(fragmentContainer)

        myra.mount(<Component />, fragmentContainer)

        await tick()
        const nothingNode = fragmentContainer.firstChild
        const childNode = fragmentContainer.firstElementChild
        expect(nothingNode).not.to.be.null
        expect(nothingNode?.nodeType).to.be.eq(Node.COMMENT_NODE)
        expect(childNode).not.to.be.null
    })

    it('removes child nodes', async () => {

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
        await tick()
        const childNode = fragmentContainer.firstElementChild
        expect(childNode).to.be.null
    })

    it('removes DOM nodes when fragment is removed', () => {

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
    })

    it('removes DOM nodes when component with a child fragment is removed', () => {

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
    })

    it('removes DOM nodes when fragment structure is removed', () => {

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
    })

    it('removes DOM nodes when fragment structure is replaced by element node', () => {

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
    })

    it('removes DOM nodes when fragment structure with component children is replaced by element node', () => {

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
    })

    it('removes DOM nodes when fragment structure is replaced by nothing node', () => {

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
    })

    it('removes DOM nodes when fragment structure is replaced by text node', () => {

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
    })

    it('removes fragment in fragment child nodes', async () => {

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
        await tick()
        const childNode = fragmentContainer.firstElementChild
        expect(childNode).to.be.null
    })


    it('renders a nothing node if fragment has no children', () => {

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
    })

    it('removes component fragment child nodes when replaced by nothing node', () => {

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
    })

    it('removes component fragment child nodes when replaced by text node', () => {

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
    })

    it('removes component fragment child nodes when replaced by element node', () => {

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
    })

    it('renders fragment content replacing a component node with fragment root', () => {

        const fragmentContainer = document.createElement('div')
        document.body.appendChild(fragmentContainer)

        const Component = () => <><div></div><div></div></>

        const view1 = <Component />
        render(fragmentContainer, [view1], [])

        expect(fragmentContainer.childNodes.length).to.be.eq(2)

        const view2 =
            <>
                <span></span>
            </>

        render(fragmentContainer, [view2], [view1])

        expect(fragmentContainer.childNodes.length).to.be.eq(1)
        expect((fragmentContainer.firstChild as Element).tagName).to.be.eq('SPAN')
    })

    it('renders element replacing a component node with fragment root', () => {

        const fragmentContainer = document.createElement('div')
        document.body.appendChild(fragmentContainer)

        const Component = () => <><div></div><div></div></>

        const view1 = <Component />
        render(fragmentContainer, [view1], [])

        expect(fragmentContainer.childNodes.length).to.be.eq(2)

        render(fragmentContainer, [<span></span>], [view1])

        expect(fragmentContainer.childNodes.length).to.be.eq(1)
        expect((fragmentContainer.firstChild as Element).tagName).to.be.eq('SPAN')
    })

    it('renders nothing replacing a component node with fragment root', () => {

        const fragmentContainer = document.createElement('div')
        document.body.appendChild(fragmentContainer)

        const Component = () => <><div></div><div></div></>

        const view1 = <Component />
        render(fragmentContainer, [view1], [])

        expect(fragmentContainer.childNodes.length).to.be.eq(2)

        render(fragmentContainer, [<nothing />], [view1])

        expect(fragmentContainer.childNodes.length).to.be.eq(1)
        expect(fragmentContainer.firstChild?.nodeType).to.be.eq(Node.COMMENT_NODE)
    })

    it('renders text replacing a component node with fragment root', () => {

        const fragmentContainer = document.createElement('div')
        document.body.appendChild(fragmentContainer)

        const Component = () => <><div></div><div></div></>

        const view1 = <Component />
        render(fragmentContainer, [view1], [])

        expect(fragmentContainer.childNodes.length).to.be.eq(2)

        const textVNode: TextVNode = { _: VNodeType.Text, text: 'replacement' }
        render(fragmentContainer, [textVNode], [view1])

        expect(fragmentContainer.childNodes.length).to.be.eq(1)
        expect(fragmentContainer.firstChild?.nodeType).to.be.eq(Node.TEXT_NODE)
        expect(fragmentContainer.firstChild?.textContent).to.be.eq('replacement')
    })

    it('removes ghost DOM nodes when replacing a component (fragment root, component child) with a fragment', () => {

        // Regression: the old node is a ComponentVNode whose rendition is a
        // FragmentVNode whose child is itself a ComponentVNode rendering a non-fragment
        // leaf. getFragmentChildNodesRec returns that inner ComponentVNode, and the
        // direct .domRef accesses at lines 453/460 were undefined, causing the old
        // DOM node to be silently skipped (ghost node).

        const fragmentContainer = document.createElement('div')
        document.body.appendChild(fragmentContainer)

        const LeafComp = () => <div id="old-inner-leaf"></div>
        const OuterComp = () => <><LeafComp /></>

        const view1 = <OuterComp />
        render(fragmentContainer, [view1], [])

        expect(fragmentContainer.querySelector('#old-inner-leaf')).not.to.be.null
        expect(fragmentContainer.childNodes.length).to.be.eq(1)

        const view2 = <><span id="new-fragment-child"></span></>
        render(fragmentContainer, [view2], [view1])

        // Old leaf must be gone (no ghost node)
        expect(fragmentContainer.querySelector('#old-inner-leaf')).to.be.null
        expect(fragmentContainer.querySelector('#new-fragment-child')).not.to.be.null
        expect(fragmentContainer.childNodes.length).to.be.eq(1)
    })

    it('removes DOM nodes when fragment contains a component with fragment root', () => {

        const fragmentContainer = document.createElement('div')
        document.body.appendChild(fragmentContainer)

        const Inner = () => <><div id="inner-a"></div><div id="inner-b"></div></>

        const view1 =
            <div>
                <>
                    <Inner />
                    <div id="sibling"></div>
                </>
            </div>

        render(fragmentContainer, [view1], [])

        expect(fragmentContainer.firstChild?.childNodes.length).to.be.eq(3)
        expect((fragmentContainer.firstChild?.childNodes[0] as HTMLElement).id).to.be.eq('inner-a')
        expect((fragmentContainer.firstChild?.childNodes[1] as HTMLElement).id).to.be.eq('inner-b')
        expect((fragmentContainer.firstChild?.childNodes[2] as HTMLElement).id).to.be.eq('sibling')

        const view2 = <div><span id="only"></span></div>

        render(fragmentContainer, [view2], [view1])

        expect(fragmentContainer.firstChild?.childNodes.length).to.be.eq(1)
        expect((fragmentContainer.firstChild?.firstChild as HTMLElement).id).to.be.eq('only')
    })

    it('collects leaf DOM nodes for component chains ending in a fragment', () => {

        const fragmentContainer = document.createElement('div')
        document.body.appendChild(fragmentContainer)

        // Component chain: Outer → Middle → Inner (fragment root)
        const Inner = () => <><div id="deep-a"></div><div id="deep-b"></div></>
        const Middle = () => <Inner />
        const Outer = () => <Middle />

        const view1 =
            <div>
                <>
                    <Outer />
                    <span id="after"></span>
                </>
            </div>

        render(fragmentContainer, [view1], [])

        expect(fragmentContainer.firstChild?.childNodes.length).to.be.eq(3)

        const view2 = <div><p id="replaced"></p></div>

        render(fragmentContainer, [view2], [view1])

        expect(fragmentContainer.firstChild?.childNodes.length).to.be.eq(1)
        expect((fragmentContainer.firstChild?.firstChild as HTMLElement).id).to.be.eq('replaced')
    })

    it('removes component fragment child nodes when replaced by memo node', () => {

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
    })


    it('updates element attributes when a fragment is replaced by an element node', () => {

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

    it('removes fragment in fragment child nodes', async () => {

        let setItemsOuter!: myra.Evolve<string[]>
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

        await tick()
        setItemsOuter(x => x.slice(1))

        await tick()
        expect(fragmentContainer.childElementCount).to.be.eq(6)
        expect((fragmentContainer.firstChild as HTMLElement).id).to.be.eq('element1b')
        expect((fragmentContainer.children[1] as HTMLElement).id).to.be.eq('element2b')
        expect((fragmentContainer.children[2] as HTMLElement).id).to.be.eq('element3b')
        expect((fragmentContainer.children[3] as HTMLElement).id).to.be.eq('element1c')
        expect((fragmentContainer.children[4] as HTMLElement).id).to.be.eq('element2c')
        expect((fragmentContainer.lastChild as HTMLElement).id).to.be.eq('element3c')
    })

    it('removes and "unmounts" component child nodes', async () => {
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
        await tick()
        const childNode = fragmentContainer.firstElementChild
        expect(childNode).to.be.null

        expect(mock.unmount.callCount).to.eq(1)
    })

    it('removes component with fragment child node', async () => {
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

        await tick()
        expect((fragmentContainer.firstChild as HTMLElement).id).to.be.eq('fragment-child5')
        expect((fragmentContainer.childNodes[1] as Node).textContent).to.be.eq('text')
        expect((fragmentContainer.lastChild as HTMLElement).id).to.be.eq('fragment-child6')

        setDidRenderOuter(true)

        await tick()
        expect((fragmentContainer.firstChild as Node).textContent).to.be.eq('Nothing')
        expect((fragmentContainer.lastChild as HTMLElement).id).to.be.eq('fragment-child6')
        expect(fragmentContainer.childNodes.length).to.eq(2)
    })

    it('removes fragment non-firstChild child nodes', async () => {

        let setItemsOuter!: myra.Evolve<string[]>
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

        await tick()
        setItemsOuter(x => [x[0], x[2]])
        await tick()

        expect(fragmentContainer.childNodes.length).to.be.eq(5)
        expect(fragmentContainer.childNodes[0].textContent).to.be.eq('item ')
        expect(fragmentContainer.childNodes[1].textContent).to.be.eq('a')
        expect(fragmentContainer.childNodes[2].textContent).to.be.eq('item ')
        expect(fragmentContainer.childNodes[3].textContent).to.be.eq('c')
        expect(fragmentContainer.childNodes[4].textContent).to.be.eq('d')
    })

    it('retains view state when fragment children are reordered with keys', async () => {

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

        await tick()
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
    })

    it('does not retain view state when fragment children reordered without keys', async () => {

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

        await tick()
        let btn = (view1.domRef as HTMLDivElement).querySelector('button')!
        btn.click()

        await tick()
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
    })


    it('retains view state when component children are reordered with keys', async () => {

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

        await tick()
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
    })

    it('does not retain view state when component children reordered without keys', async () => {

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

        await tick()
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
    })

    it('replaces component DOM node when a fragment containing a component with non-fragment root is replaced by a component', () => {

        // Regression: when a Fragment's only child is a Component that renders
        // a non-fragment leaf, getFragmentChildNodesRec returns a ComponentVNode.
        // ComponentVNode.domRef is always undefined, so the old domRef check
        // silently skipped it — leaving the old DOM node in the parent (ghost node)
        // and never calling cleanupRecursively (leaked effects).

        const fragmentContainer = document.createElement('div')
        document.body.appendChild(fragmentContainer)

        const OldComp = () => <div id="old-comp-leaf"></div>
        const NewComp = () => <span id="new-comp-leaf"></span>

        const view1 = <><OldComp /></>
        render(fragmentContainer, [view1], [])

        expect(fragmentContainer.querySelector('#old-comp-leaf')).not.to.be.null

        const view2 = <NewComp />
        render(fragmentContainer, [view2], [view1])

        expect(fragmentContainer.childNodes.length).to.be.eq(1)
        expect(fragmentContainer.querySelector('#old-comp-leaf')).to.be.null
        expect(fragmentContainer.querySelector('#new-comp-leaf')).not.to.be.null
    })

    it('removes all ghost DOM nodes when a fragment with multiple component children is replaced by a component', () => {

        // Regression: multiple ComponentVNodes in the old fragment must each have
        // their DOM resolved through the rendition chain and removed.

        const fragmentContainer = document.createElement('div')
        document.body.appendChild(fragmentContainer)

        const CompA = () => <div id="ghost-a"></div>
        const CompB = () => <div id="ghost-b"></div>
        const NewComp = () => <span id="replacement"></span>

        const view1 = <><CompA /><CompB /></>
        render(fragmentContainer, [view1], [])

        expect(fragmentContainer.childNodes.length).to.be.eq(2)

        const view2 = <NewComp />
        render(fragmentContainer, [view2], [view1])

        expect(fragmentContainer.childNodes.length).to.be.eq(1)
        expect(fragmentContainer.querySelector('#ghost-a')).to.be.null
        expect(fragmentContainer.querySelector('#ghost-b')).to.be.null
        expect(fragmentContainer.querySelector('#replacement')).not.to.be.null
    })

    it('calls effect cleanup when a fragment containing a component with non-fragment root is replaced', async () => {

        // Regression: cleanupRecursively was never called for the old ComponentVNode,
        // so useEffect cleanup callbacks were silently skipped.

        const fragmentContainer = document.createElement('div')
        document.body.appendChild(fragmentContainer)

        const cleanup = sinon.spy()
        const OldComp = () => {
            myra.useEffect(() => cleanup, [])
            return <div id="old-for-cleanup"></div>
        }
        const NewComp = () => <span id="new-after-cleanup"></span>

        const view1 = <><OldComp /></>
        render(fragmentContainer, [view1], [])

        await tick()
        const view2 = <NewComp />
        render(fragmentContainer, [view2], [view1])

        expect(cleanup.callCount).to.eq(1)
    })

    it('does not throw when re-rendering a fragment whose child component renders a non-fragment leaf', () => {

        // Regression: getFragmentChildNodesRec was returning a ComponentVNode for
        // components that render a non-fragment leaf. The fragment-to-fragment path
        // in renderFragmentVNode unconditionally accessed child.domRef.parentElement
        // (line 429), which threw a TypeError because ComponentVNode.domRef is always
        // undefined.

        const fragmentContainer = document.createElement('div')
        document.body.appendChild(fragmentContainer)

        const Child = () => <div id="child-leaf"></div>

        const view1 = <><Child /></>
        render(fragmentContainer, [view1], [])

        expect(fragmentContainer.querySelector('#child-leaf')).not.to.be.null

        // Re-render fragment-to-fragment — must not throw
        const view2 = <><Child /></>
        expect(() => render(fragmentContainer, [view2], [view1])).not.to.throw()

        expect(fragmentContainer.querySelector('#child-leaf')).not.to.be.null
    })

    it('correctly positions nodes after a reordered multi-child keyed fragment', () => {

        // Regression test: when a keyed fragment with multiple DOM children is
        // moved via DocumentFragment.insertBefore, the fragment is emptied on
        // insertion so domNode.nextSibling is always null. The loop must instead
        // read lastFragmentChild.nextSibling to keep track of its position.
        //
        // Old order: [div#a (keyed), Fragment key="b" (spans b1+b2), span.static]
        // New order: [Fragment key="b", div#a (keyed), span.static]
        // Expected DOM: [span#b1, span#b2, div#a, span.static]

        const container = document.createElement('div')
        document.body.appendChild(container)

        const view1 =
            <div>
                <div id="a" key="a" />
                <myra.Fragment key="b">
                    <span id="b1" />
                    <span id="b2" />
                </myra.Fragment>
                <span id="static" />
            </div>

        render(document.body, [view1], [])

        const parent = view1.domRef as HTMLDivElement

        const view2 =
            <div>
                <myra.Fragment key="b">
                    <span id="b1" />
                    <span id="b2" />
                </myra.Fragment>
                <div id="a" key="a" />
                <span id="static" />
            </div>

        render(document.body, [view2], [view1])

        const children = Array.from(parent.childNodes) as HTMLElement[]
        expect(children).to.have.length(4)
        expect(children[0].id).to.eq('b1')
        expect(children[1].id).to.eq('b2')
        expect(children[2].id).to.eq('a')
        expect(children[3].id).to.eq('static')
    })

    it('correctly positions all nodes when multiple multi-child keyed fragments are reordered', () => {

        // Regression: verify that two keyed fragments each with 2 children
        // followed by a trailing keyed element reorder correctly.
        //
        // Old: [Fragment key="X" (x1,x2), Fragment key="Y" (y1,y2), div#z (key="Z")]
        // New: [Fragment key="Y", Fragment key="X", div#z (key="Z")]
        // Expected DOM: [span#y1, span#y2, span#x1, span#x2, div#z]

        const container = document.createElement('div')
        document.body.appendChild(container)

        const view1 =
            <div>
                <myra.Fragment key="X">
                    <span id="x1" />
                    <span id="x2" />
                </myra.Fragment>
                <myra.Fragment key="Y">
                    <span id="y1" />
                    <span id="y2" />
                </myra.Fragment>
                <div id="z" key="Z" />
            </div>

        render(document.body, [view1], [])

        const parent = view1.domRef as HTMLDivElement

        const view2 =
            <div>
                <myra.Fragment key="Y">
                    <span id="y1" />
                    <span id="y2" />
                </myra.Fragment>
                <myra.Fragment key="X">
                    <span id="x1" />
                    <span id="x2" />
                </myra.Fragment>
                <div id="z" key="Z" />
            </div>

        render(document.body, [view2], [view1])

        const children = Array.from(parent.childNodes) as HTMLElement[]
        expect(children).to.have.length(5)
        expect(children[0].id).to.eq('y1')
        expect(children[1].id).to.eq('y2')
        expect(children[2].id).to.eq('x1')
        expect(children[3].id).to.eq('x2')
        expect(children[4].id).to.eq('z')
    })

})
