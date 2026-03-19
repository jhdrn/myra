import { render } from '../src/component'
import { ButtonAttributes, ComponentProps, ElementVNode, NothingVNode, TextVNode, VNodeType } from '../src/contract'
import { useState } from '../src/hooks'
import * as myra from '../src/myra'
import { expect } from 'chai'
import * as sinon from 'sinon'

const tick = (ms = 0) => new Promise<void>(resolve => setTimeout(resolve, ms))

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

    beforeEach(() => {
        // "Clear view" before each test
        Array.prototype.slice.call(document.body.childNodes).forEach((c: Node) => document.body.removeChild(c))
    })

    it('renders a "nothing" comment node from a virtual node', () => {
        const view = <nothing />

        const [rn] = render(document.body, [view], [])
        const node = rn.domRef!
        expect(node.nodeType).to.be.eq(Node.COMMENT_NODE)
        expect(node.nodeValue).to.be.eq('Nothing')
    })

    it('replaces a nothing node with a text node', () => {

        const view1 = <div><nothing /></div>
        const oldNodes = render(document.body, [view1], [])

        expect(document.body.firstChild?.firstChild?.nodeType).to.be.eq(Node.COMMENT_NODE)
        expect(document.body.firstChild?.firstChild?.nodeValue).to.be.eq('Nothing')

        render(document.body, [<div>text</div>], oldNodes)
        expect(document.body.firstChild?.childNodes.length).to.be.eq(1)
        expect(document.body.firstChild?.firstChild?.textContent).to.eq('text')
    })

    it('replaces a nothing node with an element node', () => {

        const view1 = <div><nothing /></div>
        const oldNodes = render(document.body, [view1], [])

        expect(document.body.firstChild?.firstChild?.nodeType).to.be.eq(Node.COMMENT_NODE)
        expect(document.body.firstChild?.firstChild?.nodeValue).to.be.eq('Nothing')

        render(document.body, [<div><span /></div>], oldNodes)
        expect(document.body.firstChild?.childNodes.length).to.be.eq(1)
        expect((document.body.firstChild?.firstChild as HTMLSpanElement).tagName).to.eq('SPAN')
    })

    it('replaces a nothing node with a fragment node', () => {

        const view1 = <div><nothing /></div>
        const oldNodes = render(document.body, [view1], [])

        expect(document.body.firstChild?.firstChild?.nodeType).to.be.eq(Node.COMMENT_NODE)
        expect(document.body.firstChild?.firstChild?.nodeValue).to.be.eq('Nothing')

        render(document.body, [<div><><span /></></div>], oldNodes)
        expect(document.body.firstChild?.childNodes.length).to.be.eq(1)
        expect((document.body.firstChild?.firstChild as HTMLSpanElement).tagName).to.eq('SPAN')
    })

    it('replaces a nothing node with a component node', () => {

        const view1 = <nothing />

        const Component = () => {
            return <div id="component-id" />
        }
        const oldNodes = render(document.body, [view1], [])

        expect(document.body.firstChild?.textContent).to.eq('Nothing')

        const view2 = <Component />

        render(document.body, [view2], oldNodes)

        expect(document.body.childNodes.length).to.be.eq(1)
        expect((document.body.firstChild as Element).id).to.eq('component-id')
    })

    it('renders an element node from a virtual node', () => {
        const view = <div></div>

        const [rn] = render(document.body, [view], [])
        const node = rn.domRef as HTMLDivElement
        expect(node.nodeType).to.be.eq(Node.ELEMENT_NODE)
        expect(node.tagName).to.be.eq('DIV')
    })


    it('replaces an element node with a text node', () => {

        const view1 = <div><span /></div>
        const oldNodes = render(document.body, [view1], [])

        expect((document.body.firstChild?.firstChild as HTMLDivElement).tagName).to.eq('SPAN')

        render(document.body, [<div>text</div>], oldNodes)
        expect(document.body.firstChild?.childNodes.length).to.be.eq(1)
        expect(document.body.firstChild?.firstChild?.textContent).to.eq('text')
    })

    it('replaces an element node with a nothing node', () => {

        const view1 = <div></div>
        const oldNodes = render(document.body, [view1], [])

        expect((document.body.firstChild as HTMLDivElement).tagName).to.eq('DIV')

        render(document.body, [<nothing />], oldNodes)

        expect(document.body.childNodes.length).to.be.eq(1)
        expect(document.body.firstChild?.nodeType).to.be.eq(Node.COMMENT_NODE)
        expect(document.body.firstChild?.nodeValue).to.be.eq('Nothing')
    })

    it('replaces an element node with a fragment node', () => {

        const view1 = <div></div>
        const oldNodes = render(document.body, [view1], [])

        expect((document.body.firstChild as HTMLDivElement).tagName).to.eq('DIV')

        render(document.body, [<><span /></>], oldNodes)
        expect(document.body.childNodes.length).to.be.eq(1)
        expect((document.body.firstChild as HTMLSpanElement).tagName).to.eq('SPAN')
    })

    it('replaces an element node with a component node', () => {

        const view1 = <div></div>

        const Component = () => {
            return <div id="component-id" />
        }
        const oldNodes = render(document.body, [view1], [])

        expect((document.body.firstChild as HTMLDivElement).tagName).to.eq('DIV')

        const view2 = <Component />

        render(document.body, [view2], oldNodes)
        expect(document.body.childNodes.length).to.be.eq(1)

        expect((document.body.firstChild as Element).id).to.eq('component-id')
    })

    it('renders a text node from a virtual node', () => {
        const view = <div>text</div>

        const [rn] = render(document.body, [view], [])
        const parentNode = rn.domRef as HTMLDivElement
        expect(parentNode.childNodes.length).to.be.eq(1)
        expect(parentNode.childNodes[0].nodeType).to.be.eq(Node.TEXT_NODE)
        expect(parentNode.childNodes[0].textContent).to.be.eq('text')
    })

    it('replaces a text node with a nothing node', () => {

        const view1 = <div>text</div>
        const oldNodes = render(document.body, [view1], [])

        expect(document.body.firstChild?.firstChild?.textContent).to.eq('text')

        render(document.body, [<div><nothing /></div>], oldNodes)

        expect(document.body.firstChild?.childNodes.length).to.be.eq(1)
        expect(document.body.firstChild?.firstChild?.nodeType).to.be.eq(Node.COMMENT_NODE)
        expect(document.body.firstChild?.firstChild?.nodeValue).to.be.eq('Nothing')
    })

    it('replaces a text node with an element node', () => {

        const view1 = <div>text</div>
        const oldNodes = render(document.body, [view1], [])

        expect(document.body.firstChild?.firstChild?.textContent).to.eq('text')

        render(document.body, [<div><span /></div>], oldNodes)
        expect(document.body.firstChild?.childNodes.length).to.be.eq(1)
        expect((document.body.firstChild?.firstChild as HTMLSpanElement).tagName).to.eq('SPAN')
    })

    it('replaces a text node with a fragment node', () => {

        const view1 = <div>text</div>
        const oldNodes = render(document.body, [view1], [])

        expect(document.body.firstChild?.firstChild?.textContent).to.eq('text')

        render(document.body, [<div><><span /></></div>], oldNodes)
        expect(document.body.firstChild?.childNodes.length).to.be.eq(1)
        expect((document.body.firstChild?.firstChild as HTMLSpanElement).tagName).to.eq('SPAN')
    })

    it('replaces a text node with a component node', () => {

        const view1 = <div>text</div>

        const Component = () => {
            return <div id="component-id" />
        }
        const oldNodes = render(document.body, [view1], [])

        expect(document.body.firstChild?.firstChild?.textContent).to.eq('text')

        const view2 = <div><Component /></div>

        render(document.body, [view2], oldNodes)
        expect(document.body.childNodes.length).to.be.eq(1)

        expect((document.body.firstChild?.firstChild as Element).id).to.eq('component-id')
    })

    it('renders a component from a component virtual node', () => {
        const TestComponent = () => <div id="testComponent"></div>

        const view = <div><TestComponent /></div>

        const [rn] = render(document.body, [view], [])
        const node = rn.domRef as HTMLDivElement
        expect((node.childNodes[0] as HTMLDivElement).id).to.be.eq('testComponent')
    })

    it('replaces a component node with a nothing node', () => {

        const Component = () => {
            return <div id="component-id" />
        }
        const componentInstance = <Component />
        const oldNodes = render(document.body, [componentInstance], [])

        expect((document.body.firstChild as Element).id).to.eq('component-id')

        render(document.body, [<nothing />], oldNodes)
        expect(document.body.childNodes.length).to.be.eq(1)
        expect(document.body.firstChild?.textContent).to.eq('Nothing')
    })

    it('replaces a component node with a text node', () => {

        const Component = () => {
            return <div id="component-id" />
        }
        const view1 = <div><Component /></div>
        const oldNodes = render(document.body, [view1], [])

        expect((document.body.firstChild?.firstChild as Element).id).to.eq('component-id')

        render(document.body, [<div>text</div>], oldNodes)
        expect(document.body.firstChild?.childNodes.length).to.be.eq(1)
        expect(document.body.firstChild?.firstChild?.textContent).to.eq('text')
    })

    it('replaces a component node with an element node', () => {

        const Component = () => {
            return <div id="component-id" />
        }
        const view1 = <div><Component /></div>
        const oldNodes = render(document.body, [view1], [])

        expect((document.body.firstChild?.firstChild as Element).id).to.eq('component-id')

        render(document.body, [<div><span /></div>], oldNodes)
        expect(document.body.firstChild?.childNodes.length).to.be.eq(1)
        expect((document.body.firstChild?.firstChild as HTMLSpanElement).tagName).to.eq('SPAN')
    })

    it('replaces a component node with a fragment node', () => {

        const Component = () => {
            return <div id="component-id" />
        }
        const view1 = <div><Component /></div>
        const oldNodes = render(document.body, [view1], [])

        expect((document.body.firstChild?.firstChild as Element).id).to.eq('component-id')

        render(document.body, [<div><><span /></></div>], oldNodes)
        expect(document.body.firstChild?.childNodes.length).to.be.eq(1)
        expect((document.body.firstChild?.firstChild as HTMLSpanElement).tagName).to.eq('SPAN')
    })

    it('removes a component when it\'s parent is replaced', async () => {

        const Component = () => {
            return <div id="component-id" />
        }
        const vNode = <div><Component /></div>
        const oldNodes = render(document.body, [vNode], [])

        await tick()
        expect(document.getElementById('component-id')).not.to.be.null

        render(document.body, [<nothing />], oldNodes)
        await tick()
        expect(document.getElementById('component-id')).to.be.null
    })

    it('renders a child node that was previously not rendered', async () => {
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

        setShowChildOuter(true)
        await tick()
        const child = document.getElementById('child-node')
        expect(child).not.to.be.null
    })

    it('removes excessive child nodes', () => {
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

        const oldNodes = render(document.body, [view1], [])
        let node = document.body.firstChild as HTMLDivElement

        expect(node.childElementCount).to.be.eq(viewItems1.length)

        render(document.body, [view2], oldNodes)
        node = document.body.firstChild as HTMLDivElement

        expect(node.childElementCount).to.be.eq(viewItems2.length)
    })

    it('removes excessive keyed child nodes', () => {
        const viewItems1 = ['a', 'b', 'c', 'd', 'e', 'f']
        const viewItems2 = ['c', 'e']
        const view1 =
            <div>
                {viewItems1.map(item => <div key={item}>{item}</div>)}
            </div>
        const view2 =
            <div>
                {viewItems2.map(item => <div key={item}>{item}</div>)}
            </div>

        const oldNodes = render(document.body, [view1], [])
        let node = document.body.firstChild as HTMLDivElement

        expect(node.childElementCount).to.be.eq(viewItems1.length)

        render(document.body, [view2], oldNodes)
        node = document.body.firstChild as HTMLDivElement

        expect(node.childElementCount).to.be.eq(viewItems2.length)
        expect(node.children[0].textContent).to.be.eq('c')
        expect(node.children[1].textContent).to.be.eq('e')
    })

    it('removes excessive keyed component child nodes', () => {
        const viewItems1 = ['a', 'b', 'c', 'd', 'e', 'f']
        const viewItems2 = ['c', 'e']


        const Component = myra.define(props => {
            return (
                <div>{props.key}</div>
            )
        })

        const view1 =
            <div>
                {viewItems1.map(item => <Component key={item} />)}
            </div>
        const view2 =
            <div>
                {viewItems2.map(item => <Component key={item} />)}
            </div>

        const oldNodes = render(document.body, [view1], [])
        let node = document.body.firstChild as HTMLDivElement

        expect(node.childElementCount).to.be.eq(viewItems1.length)

        render(document.body, [view2], oldNodes)
        node = document.body.firstChild as HTMLDivElement

        expect(node.childElementCount).to.be.eq(viewItems2.length)
        expect(node.children[0].textContent).to.be.eq('c')
        expect(node.children[1].textContent).to.be.eq('e')
    })

    it('correctly inserts and appends keyed child nodes', () => {
        const viewItems1 = ['c', 'e']
        const viewItems2 = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
        const view1 =
            <div>
                {viewItems1.map(item => <div key={item}>{item}</div>)}
            </div>
        const view2 =
            <div>
                {viewItems2.map(item => <div key={item}>{item}</div>)}
            </div>

        const oldNodes = render(document.body, [view1], [])
        let node = document.body.firstChild as HTMLDivElement

        expect(node.childElementCount).to.be.eq(viewItems1.length)

        render(document.body, [view2], oldNodes)
        node = document.body.firstChild as HTMLDivElement

        expect(node.childElementCount).to.be.eq(viewItems2.length)
        expect(node.children[0].textContent).to.be.eq('a')
        expect(node.children[1].textContent).to.be.eq('b')
        expect(node.children[2].textContent).to.be.eq('c')
        expect(node.children[3].textContent).to.be.eq('d')
        expect(node.children[4].textContent).to.be.eq('e')
        expect(node.children[5].textContent).to.be.eq('f')
        expect(node.children[6].textContent).to.be.eq('g')
    })


    it('correctly inserts and appends keyed an non-keyed child nodes', () => {

        const keyedItems = ['a', 'c', 'd', 'g']
        const viewItems1 = ['c', 'e']
        const viewItems2 = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
        const view1 =
            <div>
                {viewItems1.map(item => <div key={keyedItems.includes(item) ? item : undefined}>{item}</div>)}
            </div>
        const view2 =
            <div>
                {viewItems2.map(item => <div key={keyedItems.includes(item) ? item : undefined}>{item}</div>)}
            </div>

        const oldNodes = render(document.body, [view1], [])
        let node = document.body.firstChild as HTMLDivElement

        expect(node.childElementCount).to.be.eq(viewItems1.length)

        render(document.body, [view2], oldNodes)
        node = document.body.firstChild as HTMLDivElement

        expect(node.childElementCount).to.be.eq(viewItems2.length)
        expect(node.children[0].textContent).to.be.eq('a')
        expect(node.children[1].textContent).to.be.eq('b')
        expect(node.children[2].textContent).to.be.eq('c')
        expect(node.children[3].textContent).to.be.eq('d')
        expect(node.children[4].textContent).to.be.eq('e')
        expect(node.children[5].textContent).to.be.eq('f')
        expect(node.children[6].textContent).to.be.eq('g')
    })


    it('correctly updates keyed an non-keyed child nodes', () => {

        const keyedItems = ['a', 'c', 'd', 'g']
        const viewItems1 = ['c', 'e']
        const viewItems2 = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
        const view1 =
            <div>
                {viewItems1.map(item => <div key={keyedItems.includes(item) ? item : undefined}>{item}</div>)}
            </div>
        const view2 =
            <div>
                {viewItems2.map(item => <div key={!keyedItems.includes(item) ? item : undefined}>{item}</div>)}
            </div>

        const oldNodes = render(document.body, [view1], [])
        let node = document.body.firstChild as HTMLDivElement

        expect(node.childElementCount).to.be.eq(viewItems1.length)

        render(document.body, [view2], oldNodes)
        node = document.body.firstChild as HTMLDivElement

        expect(node.childElementCount).to.be.eq(viewItems2.length)
        expect(node.children[0].textContent).to.be.eq('a')
        expect(node.children[1].textContent).to.be.eq('b')
        expect(node.children[2].textContent).to.be.eq('c')
        expect(node.children[3].textContent).to.be.eq('d')
        expect(node.children[4].textContent).to.be.eq('e')
        expect(node.children[5].textContent).to.be.eq('f')
        expect(node.children[6].textContent).to.be.eq('g')
    })

    it('correctly inserts and appends keyed fragment child nodes', () => {
        const viewItems1 = ['c', 'e']
        const viewItems2 = ['a', 'b', 'c', 'd', 'e', 'f', 'g']
        const view1 =
            <div>
                {viewItems1.map(item => <myra.Fragment key={item}>{item}</myra.Fragment>)}
            </div>
        const view2 =
            <div>
                {viewItems2.map(item => <myra.Fragment key={item}>{item}</myra.Fragment>)}
            </div>

        const oldNodes = render(document.body, [view1], [])
        let node = document.body.firstChild as HTMLDivElement

        expect(node.childNodes.length).to.be.eq(viewItems1.length)

        render(document.body, [view2], oldNodes)
        node = document.body.firstChild as HTMLDivElement

        expect(node.childNodes.length).to.be.eq(viewItems2.length)
        expect(node.childNodes[0].textContent).to.be.eq('a')
        expect(node.childNodes[1].textContent).to.be.eq('b')
        expect(node.childNodes[2].textContent).to.be.eq('c')
        expect(node.childNodes[3].textContent).to.be.eq('d')
        expect(node.childNodes[4].textContent).to.be.eq('e')
        expect(node.childNodes[5].textContent).to.be.eq('f')
        expect(node.childNodes[6].textContent).to.be.eq('g')
    })

    it('correctly inserts and appends keyed component child nodes', () => {
        const viewItems1 = ['c', 'e']
        const viewItems2 = ['a', 'b', 'c', 'd', 'e', 'f', 'g']

        const Component = myra.define(props => {
            return (
                <div>{props.key}</div>
            )
        })

        const view1 =
            <div>
                {viewItems1.map(item => <Component key={item} />)}
            </div>
        const view2 =
            <div>
                {viewItems2.map(item => <Component key={item} />)}
            </div>

        const oldNodes1 = render(document.body, [view1], [])
        let node = document.body.firstChild as HTMLDivElement

        expect(node.childElementCount).to.be.eq(viewItems1.length)

        render(document.body, [view2], oldNodes1)
        node = document.body.firstChild as HTMLDivElement

        expect(node.childElementCount).to.be.eq(viewItems2.length)
        expect(node.children[0].textContent).to.be.eq('a')
        expect(node.children[1].textContent).to.be.eq('b')
        expect(node.children[2].textContent).to.be.eq('c')
        expect(node.children[3].textContent).to.be.eq('d')
        expect(node.children[4].textContent).to.be.eq('e')
        expect(node.children[5].textContent).to.be.eq('f')
        expect(node.children[6].textContent).to.be.eq('g')
    })

    it('correctly updates and appends keyed child nodes', () => {
        const viewItems1 = ['a', 'b', 'c']
        const viewItems2 = ['b', 'c', 'd']

        const view1 =
            <div>
                {viewItems1.map(item => <div key={item}>{item}</div>)}
            </div>
        const view2 =
            <div>
                {viewItems2.map(item => <div key={item}>{item}</div>)}
            </div>

        const oldNodes2 = render(document.body, [view1], [])
        let node = document.body.firstChild as HTMLDivElement

        expect(node.childElementCount).to.be.eq(viewItems1.length)

        render(document.body, [view2], oldNodes2)
        node = document.body.firstChild as HTMLDivElement

        expect(node.childElementCount).to.be.eq(viewItems2.length)
        expect(node.children[0].textContent).to.be.eq('b')
        expect(node.children[1].textContent).to.be.eq('c')
        expect(node.children[2].textContent).to.be.eq('d')
    })

    it('correctly updates and appends keyed fragment child nodes', () => {
        const viewItems1 = ['a', 'b', 'c']
        const viewItems2 = ['b', 'c', 'd']

        const view1 =
            <div>
                {viewItems1.map(item => <myra.Fragment key={item}>{item}</myra.Fragment>)}
            </div>
        const view2 =
            <div>
                {viewItems2.map(item => <myra.Fragment key={item}>{item}</myra.Fragment>)}
            </div>

        const oldNodes3 = render(document.body, [view1], [])
        let node = document.body.firstChild as HTMLDivElement

        expect(node.childNodes.length).to.be.eq(viewItems1.length)

        render(document.body, [view2], oldNodes3)
        node = document.body.firstChild as HTMLDivElement

        expect(node.childNodes.length).to.be.eq(viewItems2.length)
        expect(node.childNodes[0].textContent).to.be.eq('b')
        expect(node.childNodes[1].textContent).to.be.eq('c')
        expect(node.childNodes[2].textContent).to.be.eq('d')
    })

    it('correctly updates and appends keyed component child nodes', () => {
        const viewItems1 = ['a', 'b', 'c']
        const viewItems2 = ['b', 'c', 'd']

        const Component = myra.define(props => {
            return (
                <div>{props.key}</div>
            )
        })

        const view1 =
            <div>
                {viewItems1.map(item => <Component key={item} />)}
            </div>
        const view2 =
            <div>
                {viewItems2.map(item => <Component key={item} />)}
            </div>

        const oldNodes4 = render(document.body, [view1], [])
        let node = document.body.firstChild as HTMLDivElement

        expect(node.childElementCount).to.be.eq(viewItems1.length)

        render(document.body, [view2], oldNodes4)
        node = document.body.firstChild as HTMLDivElement

        expect(node.childElementCount).to.be.eq(viewItems2.length)
        expect(node.children[0].textContent).to.be.eq('b')
        expect(node.children[1].textContent).to.be.eq('c')
        expect(node.children[2].textContent).to.be.eq('d')
    })

    it('adds child nodes if needed', () => {
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
        const oldNodes5 = render(document.body, [view1], [])

        let node = document.body.firstChild as HTMLDivElement

        expect(node.childElementCount).to.be.eq(viewItems1.length)

        render(document.body, [view2], oldNodes5)
        node = document.body.firstChild as HTMLDivElement

        expect(node.childElementCount).to.be.eq(viewItems2.length)
    })

    it('creates and returns an element node from an element virtual node', () => {
        const view = <div />

        const [rn] = render(document.body, [view], [])
        const node = rn.domRef as Element

        expect(node.nodeType).to.be.eq(Node.ELEMENT_NODE)
        expect(node.tagName).to.be.eq('DIV')
    })

    it('returns an element node with attributes set', () => {
        const view =
            <input
                class="testClass"
                id="testId"
                type="text"
                disabled={true}
                checked={true}
                value="5" />

        const [rn] = render(document.body, [view], [])

        const node = rn.domRef as HTMLInputElement

        expect(node.id).to.be.eq('testId')
        expect(node.className).to.be.eq('testClass')
        expect(node.type).to.be.eq('text')
        expect(node.disabled).to.be.eq(true)
        expect(node.checked).to.be.eq(true)
        expect(node.value).to.be.eq('5')
    })

    it('returns an element with onclick event listener set', () => {
        const mocks = sinon.spy({
            onclickUpdate: () => { /* dummy */ }
        })

        const view =
            <button onclick={mocks.onclickUpdate}></button>

        const [rn] = render(document.body, [view], [])

        const node = rn.domRef as HTMLButtonElement
        expect(node.onclick).not.to.be.null

        node.click()

        expect(mocks.onclickUpdate.callCount).to.eq(1)
    })

    it('does not set an event listener that doesn\'t exist on the element', () => {
        const mocks = {
            onCustomClick: () => { /* dummy */ }
        } as unknown as ButtonAttributes

        const view =
            <button {...mocks}></button>

        const [rn] = render(document.body, [view], [])

        const node = rn.domRef as HTMLButtonElement
        expect(node.getAttribute('onCustomClick')).to.be.null
    })

    it('does not set an object as an element attribute', () => {
        const mocks = {
            objAttr: { foo: 'bar' }
        } as unknown as ButtonAttributes

        const view =
            <button {...mocks}></button>

        const [rn] = render(document.body, [view], [])

        const node = rn.domRef as HTMLButtonElement
        expect(node.getAttribute('objAttr')).to.be.null
    })

    it('does not set an array as an element attribute', () => {
        const mocks = {
            arrayAttr: ['foo', 'bar']
        } as unknown as ButtonAttributes

        const view =
            <button {...mocks}></button>

        const [rn] = render(document.body, [view], [])

        const node = rn.domRef as HTMLButtonElement
        expect(node.getAttribute('arrayAttr')).to.be.null
    })

    it('replaces the old event listener with a the new one', () => {
        const mocks = sinon.spy({
            onclickUpdate1: () => { /* dummy */ },
            onclickUpdate2: () => { /* dummy */ }
        })

        const view1 = <button onclick={mocks.onclickUpdate1}></button>

        const view2 = <button onclick={mocks.onclickUpdate2}></button>

        const oldNodes = render(document.body, [view1], [])

        render(document.body, [view2], oldNodes)

        const node = document.body.firstChild as HTMLButtonElement

        node.click()

        expect(mocks.onclickUpdate1.called).not.to.be.true
        expect(mocks.onclickUpdate2.callCount).to.eq(1)
    })

    it('does not re-set event listener when handler reference is unchanged', () => {
        const handler = sinon.spy()

        const view1 = <button onclick={handler}></button>
        const oldNodes = render(document.body, [view1], [])

        const node = document.body.firstChild as HTMLButtonElement

        // Intercept onclick assignment to count how many times it is written
        let setCount = 0
        let currentOnclick = node.onclick
        Object.defineProperty(node, 'onclick', {
            get() { return currentOnclick },
            set(v) { setCount++; currentOnclick = v },
            configurable: true
        })

        const view2 = <button onclick={handler}></button>
        render(document.body, [view2], oldNodes)

        expect(setCount).to.eq(0)

        // Handler must still fire
        node.click()
        expect(handler.callCount).to.eq(1)
    })

    it('removes an event listener when omitted on re-render', () => {
        const handler = sinon.spy()

        const view1 = <button onclick={handler}></button>
        const oldNodes = render(document.body, [view1], [])

        const node = document.body.firstChild as HTMLButtonElement

        const view2 = <button></button>
        render(document.body, [view2], oldNodes)

        node.click()
        expect(handler.called).to.be.false
        expect(node.onclick).to.be.null
    })

    it('updates attributes if they have changed', () => {
        const view1 =
            <div class="foo" id="bar"></div>

        const view2 =
            <div class="bar" id="foo"></div>

        const oldNodes = render(document.body, [view1], [])

        let node = document.body.firstChild as HTMLDivElement

        expect(node.className).to.be.eq('foo')
        expect(node.id).to.be.eq('bar')

        render(document.body, [view2], oldNodes)

        node = document.body.firstChild as HTMLDivElement

        expect(node.className).to.be.eq('bar')
        expect(node.id).to.be.eq('foo')
    })

    it('does not re-set attribute when value is unchanged', () => {
        const view1 = <div class="foo"></div>
        const oldNodes = render(document.body, [view1], [])

        const node = document.body.firstChild as HTMLDivElement

        let setCount = 0
        let currentClass = node.className
        Object.defineProperty(node, 'className', {
            get() { return currentClass },
            set(v) { setCount++; currentClass = v },
            configurable: true
        })

        const view2 = <div class="foo"></div>
        render(document.body, [view2], oldNodes)

        expect(setCount).to.eq(0)
        expect(node.className).to.eq('foo')
    })

    it('adds an attribute introduced on re-render', () => {
        const view1 = <div></div>
        const oldNodes = render(document.body, [view1], [])

        const node = document.body.firstChild as HTMLDivElement
        expect(node.hasAttribute('id')).to.be.false

        const view2 = <div id="new"></div>
        render(document.body, [view2], oldNodes)

        expect(node.id).to.eq('new')
    })

    it('removes attributes from existing element', () => {
        const view1 =
            <div class="foo" id="bar"></div>

        const view2 =
            <div class="foo"></div>

        const oldNodes1 = render(document.body, [view1], [])

        let node = document.body.firstChild as HTMLDivElement

        expect(node.id).to.be.eq('bar')

        render(document.body, [view2], oldNodes1)

        node = document.body.firstChild as HTMLDivElement

        expect(node.id).to.be.eq('')
    })

    it('removes attributes from existing element if the attribute is undefined', () => {
        const view1 =
            <div class="foo" id="bar"></div>

        const view2 =
            <div class="foo" id={undefined}></div>

        const oldNodes2 = render(document.body, [view1], [])

        let node = document.body.firstChild as HTMLDivElement

        expect(node.id).to.be.eq('bar')

        render(document.body, [view2], oldNodes2)

        node = document.body.firstChild as HTMLDivElement

        expect(node.id).to.be.eq('')
    })

    it('replaces the element if the tagName has changed', () => {
        const view1 = <div />

        const view2 = <span />

        const oldNodes = render(document.body, [view1], [])

        let node = document.body.firstChild as HTMLDivElement

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (node as any)._id = 1
        expect(node.tagName).to.be.eq('DIV')

        render(document.body, [view2], oldNodes)

        node = document.body.firstChild as HTMLDivElement

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((node as any)._id).not.to.be.ok
        expect(node.tagName).to.be.eq('SPAN')
    })


    it('passes props to the view context', () => {

        type ChildComponentProps = {
            test: string
        }

        const mocks = sinon.spy({
            assertProps: (props: ChildComponentProps & ComponentProps) =>
                expect(props).to.deep.eq({ test: 'test', children: [] })
        })

        const ChildComponent = (props: ChildComponentProps) => {
            mocks.assertProps(props as ChildComponentProps & ComponentProps)
            return <nothing />
        }

        const ParentComponent = () => <ChildComponent test="test" />

        render(document.body, [<ParentComponent />], [])

        expect(mocks.assertProps.callCount).to.eq(1)
    })


    it('retains view state when element children are reordered with keys', async () => {

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
                    class={state.clicked ? 'clicked' : ''}
                    onclick={setClicked}>
                </button>
            )
        }

        const view1 =
            <div>
                {items.map(x => <div key={x.id.toString()}><ItemComponent forceUpdate item={x} /></div>)}
            </div>

        const oldNodes = render(document.body, [view1], [])

        await tick()
        let btn = (document.body.firstChild as HTMLDivElement).querySelector('button')!
        btn.click()

        await tick()
        expect(btn.className).to.be.eq('clicked')
        expect(btn.id).to.be.eq('item-1')

        const view2 =
            <div>
                {items.reverse().map(x => <div key={x.id.toString()}><ItemComponent forceUpdate item={x} /></div>)}
            </div>

        render(document.body, [view2], oldNodes)

        btn = (document.body.firstChild as HTMLDivElement).querySelector('button')!
        expect(btn.id).to.be.eq('item-5')
        expect(btn.className).to.be.eq('')

        // The last element should've been updated
        btn = ((document.body.firstChild as HTMLDivElement).lastChild as HTMLDivElement).firstChild as HTMLButtonElement

        expect(btn.id).to.be.eq('item-1')
        expect(btn.className).to.be.eq('clicked')
    })

    it('does not retain view state when element children are reordered without keys', async () => {

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
                    class={state.clicked ? 'clicked' : ''}
                    onclick={setClicked}>
                </button>
            )
        }

        const view1 =
            <div>
                {items.map(x => <div><ItemComponent forceUpdate item={x} /></div>)}
            </div>

        const oldNodes = render(document.body, [view1], [])

        let btn = (document.body.firstChild as HTMLDivElement).querySelector('button')!
        btn.click()

        await tick()
        expect(btn.className).to.be.eq('clicked')
        expect(btn.id).to.be.eq('item-1')

        const view2 =
            <div>
                {items.reverse().map(x => <div><ItemComponent forceUpdate item={x} /></div>)}
            </div>

        render(document.body, [view2], oldNodes)

        btn = (document.body.firstChild as HTMLDivElement).querySelector('button')!
        expect(btn.id).to.be.eq('item-5')
        expect(btn.className).to.be.eq('clicked')

        // The last element should've been updated
        btn = ((document.body.firstChild as HTMLDivElement).lastChild as HTMLDivElement).firstChild as HTMLButtonElement

        expect(btn.id).to.be.eq('item-1')
        expect(btn.className).to.be.eq('')
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
            const [state, evolve] = useState<State>({ clicked: false })

            const setClicked = () => evolve({ clicked: true })

            return (
                <button id={`item-${props.item.id}`}
                    class={state.clicked ? 'clicked' : ''}
                    onclick={setClicked}>
                </button>
            )
        }

        const view1 =
            <div>
                {items.map(x => <ItemComponent key={x.id.toString()} item={x} />)}
            </div>

        const oldNodes = render(document.body, [view1], [])

        let btn = (document.body.firstChild as HTMLDivElement).querySelector('button')!
        btn.click()

        await tick()
        expect(btn.className).to.be.eq('clicked')
        expect(btn.id).to.be.eq('item-1')

        const view2 =
            <div>
                {items.reverse().map(x => <ItemComponent key={x.id.toString()} item={x} />)}
            </div>

        render(document.body, [view2], oldNodes)

        btn = (document.body.firstChild as HTMLDivElement).querySelector('button')!
        expect(btn.className).to.be.eq('')
        expect(btn.id).to.be.eq('item-5')

        // The last element should've been updated
        btn = (document.body.firstChild as HTMLDivElement).lastChild as HTMLButtonElement
        expect(btn.className).to.be.eq('clicked')
        expect(btn.id).to.be.eq('item-1')
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
            const [state, evolve] = useState<State>({ clicked: false })

            const setClicked = () => evolve({ clicked: true })

            return (
                <button id={`item-${props.item.id}`}
                    class={state.clicked ? 'clicked' : ''}
                    onclick={setClicked}>
                </button>
            )
        }

        const view1 =
            <div>
                {items.map(x => <ItemComponent item={x} />)}
            </div>

        const oldNodes = render(document.body, [view1], [])

        let btn = (document.body.firstChild as HTMLDivElement).querySelector('button')!
        btn.click()

        await tick()
        expect(btn.className).to.be.eq('clicked')
        expect(btn.id).to.be.eq('item-1')

        const view2 =
            <div>
                {items.reverse().map(x => <ItemComponent item={x} />)}
            </div>

        render(document.body, [view2], oldNodes)

        btn = (document.body.firstChild as HTMLDivElement).querySelector('button')!
        expect(btn.className).to.be.eq('clicked')
        expect(btn.id).to.be.eq('item-5')

        // The last element should've been updated
        btn = (document.body.firstChild as HTMLDivElement).lastChild as HTMLButtonElement
        expect(btn.className).to.be.eq('')
        expect(btn.id).to.be.eq('item-1')
    })

    it('retains component state when component children are reordered with keys', async () => {

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

            const v = <button id={`item-${props.item.id}`} class={clicked ? 'clicked' : ''}
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

        const oldNodes = render(document.body, [view1], [])

        let btn = (document.body.firstChild as HTMLDivElement).querySelector('button')!
        btn.click()

        await tick()
        expect(btn.className).to.be.eq('clicked')
        expect(btn.id).to.be.eq('item-1')

        // Clear id so it's set from state
        btn.id = ''
        btn.className = ''
        // We also need to modify the node, else the attributes won't be updated

        delete btnVNode!.props.id
        delete btnVNode!.props.class
        const reversedItems = items.reverse()
        const view2 =
            <div>
                {reversedItems.map(x => <ItemComponent key={x.id.toString()} item={x} forceUpdate={1} />)}
            </div> as ElementVNode<HTMLDivElement>

        render(document.body, [view2], oldNodes)

        btn = (document.body.firstChild as HTMLDivElement).querySelector('button')!
        expect(btn.className).to.be.eq('')
        expect(btn.id).to.be.eq('item-5')

        // The last element should've been updated with the same values
        btn = (document.body.firstChild as HTMLDivElement).lastChild as HTMLButtonElement
        expect(btn.className).to.be.eq('clicked')
        expect(btn.id).to.be.eq('item-1')
    })

    it('does not retain component state when component children are reordered without keys', async () => {

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
                    class={state.clicked ? 'clicked' : ''}
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

        const oldNodes = render(document.body, [view1], [])
        await tick()

        let btn = (document.body.firstChild as HTMLDivElement).querySelector('button')!
        btn.click()
        await tick()
        expect(btn.className).to.be.eq('clicked')
        expect(btn.id).to.be.eq('item-1')

        // Clear id so it's set from state
        btn.id = ''
        btn.className = ''

        // We also need to modify the node, else the attributes won't be updated
        delete btnVNode!.props.id
        delete btnVNode!.props.class

        const reversedItems = items.reverse()
        const view2 =
            <div>
                {reversedItems.map(x => <ItemComponent item={x} forceUpdate={true} />)}
            </div> as ElementVNode<HTMLDivElement>

        render(document.body, [view2], oldNodes)

        btn = (document.body.firstChild as HTMLDivElement).querySelector('button')!

        expect(btn.className).to.be.eq('clicked')
        expect(btn.id).to.be.eq('item-5')

        // The last element should've been updated with the same values
        btn = (document.body.firstChild as HTMLDivElement).lastChild as HTMLButtonElement

        expect(btn.className).to.be.eq('')
        expect(btn.id).to.be.eq('item-1')
    })


    // it('unmounts a component which is a child of removed virtual node', () => {
    //     const mountMock = {
    //         unmount: () => { }
    //     }

    //     sinon.spy(mountMock, 'unmount')

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

    it('replaces domRef with new text node when old domRef is not a text node', () => {
        const container = document.createElement('div')
        document.body.appendChild(container)

        const textVNode: TextVNode = { _: VNodeType.Text, text: 'hello' }
        const oldNodes = render(container, [textVNode], [])

        // Replace text domRef with a span — simulates corrupt DOM state
        const span = document.createElement('span')
        container.replaceChild(span, container.firstChild!)
        oldNodes[0].domRef = span

        render(container, [{ _: VNodeType.Text, text: 'world' } as TextVNode], oldNodes)

        expect(container.firstChild!.nodeType).to.eq(Node.TEXT_NODE)
        expect(container.firstChild!.textContent).to.eq('world')
    })

    it('reuses existing comment node when re-rendering nothing with nothing', () => {
        const container = document.createElement('div')
        document.body.appendChild(container)

        const nothingVNode: NothingVNode = { _: VNodeType.Nothing }
        const oldNodes = render(container, [nothingVNode], [])
        const originalComment = container.firstChild!

        render(container, [{ _: VNodeType.Nothing } as NothingVNode], oldNodes)

        expect(container.firstChild).to.eq(originalComment)
        expect(container.firstChild!.nodeType).to.eq(Node.COMMENT_NODE)
    })

    it('replaces domRef with new comment node when old domRef is not a comment node', () => {
        const container = document.createElement('div')
        document.body.appendChild(container)

        const nothingVNode: NothingVNode = { _: VNodeType.Nothing }
        const oldNodes = render(container, [nothingVNode], [])

        // Replace comment domRef with a span — simulates corrupt DOM state
        const span = document.createElement('span')
        container.replaceChild(span, container.firstChild!)
        oldNodes[0].domRef = span

        render(container, [{ _: VNodeType.Nothing } as NothingVNode], oldNodes)

        expect(container.firstChild!.nodeType).to.eq(Node.COMMENT_NODE)
    })

    it('appends new node when old DOM node is no longer in the parent', () => {
        const container = document.createElement('div')
        document.body.appendChild(container)

        const textVNode: TextVNode = { _: VNodeType.Text, text: 'some text' }
        const oldNodes = render(container, [textVNode], [])

        // Detach the text node from its parent
        container.removeChild(container.firstChild!)

        // Re-render with nothing — replaceNode falls back to insertOrAppendDOMNode
        render(container, [{ _: VNodeType.Nothing } as NothingVNode], oldNodes)

        expect(container.firstChild!.nodeType).to.eq(Node.COMMENT_NODE)
    })

    it('appends fragment when replacing a component-with-fragment whose leaf nodes have no domRef', () => {
        const container = document.createElement('div')
        document.body.appendChild(container)

        const Component = () => <><div /></>
        const oldNodes = render(container, [<Component />], [])

        // Clear the fragment's children to simulate no leaf DOM refs
        oldNodes[0].rendition!.children = []

        render(container, [<><span /></>], oldNodes)

        expect(container.querySelector('span')).to.exist
    })

    it('appends element when replacing a component-with-empty-fragment with an element', () => {
        const container = document.createElement('div')
        document.body.appendChild(container)

        const Component = () => <><div /></>
        const oldNodes = render(container, [<Component />], [])

        oldNodes[0].rendition!.children = []

        render(container, [<span id="appended-el" />], oldNodes)

        expect(container.querySelector('#appended-el')).to.exist
    })

    it('appends nothing node when replacing a component-with-empty-fragment with nothing', () => {
        const container = document.createElement('div')
        document.body.appendChild(container)

        const Component = () => <><div /></>
        const oldNodes = render(container, [<Component />], [])

        oldNodes[0].rendition!.children = []

        render(container, [{ _: VNodeType.Nothing } as NothingVNode], oldNodes)

        // A comment node should have been appended
        const comments = Array.from(container.childNodes).filter(n => n.nodeType === Node.COMMENT_NODE)
        expect(comments.length).to.be.greaterThan(0)
    })

    it('appends text node when replacing a component-with-empty-fragment with text', () => {
        const container = document.createElement('div')
        document.body.appendChild(container)

        const Component = () => <><div /></>
        const oldNodes = render(container, [<Component />], [])

        oldNodes[0].rendition!.children = []

        render(container, [{ _: VNodeType.Text, text: 'appended' } as TextVNode], oldNodes)

        const textNodes = Array.from(container.childNodes).filter(n => n.nodeType === Node.TEXT_NODE)
        expect(textNodes.length).to.be.greaterThan(0)
        expect(textNodes[textNodes.length - 1].textContent).to.eq('appended')
    })

    it('appends fragment replacing a non-fragment when old DOM node is not in parent', () => {
        const container = document.createElement('div')
        document.body.appendChild(container)

        const oldNodes = render(container, [<span id="old-frag" />], [])

        // Remove the old node from parent
        container.removeChild(container.firstChild!)

        render(container, [<><div id="new-frag" /></>], oldNodes)

        expect(container.querySelector('#new-frag')).to.exist
    })

    it('renders svg nodes with correct namespace', () => {
        const view = <svg id="svg-test1"></svg>
        render(document.body, [view], [])

        const el = document.getElementById('svg-test1') as SVGElement | null
        expect(el).to.be.ok
        expect(el!.namespaceURI).to.be.eq('http://www.w3.org/2000/svg')
    })

    it('renders svg child nodes with correct namespace', () => {
        const view =
            <svg height="100" width="100">
                <circle id="svg-test2" cx="50" cy="50" r="50" fill="red" />
            </svg>

        render(document.body, [view], [])

        const el = document.getElementById('svg-test2') as SVGElement | null
        expect(el).to.be.ok
        expect(el!.namespaceURI).to.be.eq('http://www.w3.org/2000/svg')
    })

    it('clears old child nodes when re-rendering with no new children', () => {
        const view1 = <div><span id="child" /></div>
        const oldNodes = render(document.body, [view1], [])

        expect((document.body.firstChild as HTMLDivElement).childElementCount).to.eq(1)

        const view2 = <div></div>
        render(document.body, [view2], oldNodes)

        expect((document.body.firstChild as HTMLDivElement).childElementCount).to.eq(0)
    })

    it('reuses an unkeyed old node when a new keyed node has no matching old key', () => {
        const view1 =
            <div>
                <span key="a">a</span>
                <span key="b">b</span>
            </div>
        const oldNodes = render(document.body, [view1], [])

        // "b" is replaced by "x" — old "b" DOM node becomes an unkeyed pool entry
        const view2 =
            <div>
                <span key="a">a</span>
                <span key="x">x</span>
            </div>
        render(document.body, [view2], oldNodes)

        const div = document.body.firstChild as HTMLDivElement
        expect(div.childElementCount).to.eq(2)
        expect(div.children[0].textContent).to.eq('a')
        expect(div.children[1].textContent).to.eq('x')
    })

    it('removes event listeners when a component is replaced by a different component', () => {
        const handler = sinon.spy()
        const CompA = () => <div onclick={handler} id="comp-a" />
        const CompB = () => <span id="comp-b" />

        const oldNodes = render(document.body, [<CompA />], [])
        render(document.body, [<CompB />], oldNodes)

        const span = document.getElementById('comp-b')
        expect(span).to.exist
        // If onclick was not removed, the div would still have it — verifying
        // that cleanupRecursively ran with removeEventListeners=true
        expect((document.getElementById('comp-a') as HTMLDivElement | null)).to.be.null
    })

    it('resolves DOM node through a nested component chain in keyed reconciliation', () => {
        const Inner = () => <div />
        const Outer = () => <Inner />

        const view1 =
            <div>
                <Outer key="a" />
                <Outer key="b" />
            </div>
        const oldNodes = render(document.body, [view1], [])

        // Reorder to exercise getRenderNodeDomRef → getLeafFromComponent recursion
        const view2 =
            <div>
                <Outer key="b" />
                <Outer key="a" />
            </div>
        render(document.body, [view2], oldNodes)

        expect((document.body.firstChild as HTMLDivElement).childElementCount).to.eq(2)
    })

    it('updates ref.current when an element with a ref is re-rendered', () => {
        let ref!: ReturnType<typeof myra.useRef<HTMLDivElement>>

        const Component = () => {
            ref = myra.useRef<HTMLDivElement>()
            return <div ref={ref} id="ref-target" />
        }

        const oldNodes = render(document.body, [<Component />], [])
        expect(ref.current).to.exist

        render(document.body, [<Component />], oldNodes)

        expect(ref.current).to.eq(document.getElementById('ref-target'))
    })

    it('reads input value from DOM element when updating value attribute', () => {
        const view1 = <input value="initial" />
        const oldNodes = render(document.body, [view1], [])

        const input = document.body.firstChild as HTMLInputElement
        expect(input.value).to.eq('initial')

        const view2 = <input value="updated" />
        render(document.body, [view2], oldNodes)

        expect(input.value).to.eq('updated')
    })

    it('sets value on a textarea element', () => {
        const view = <textarea value="hello" />
        render(document.body, [view], [])

        const textarea = document.body.firstChild as HTMLTextAreaElement
        expect(textarea.value).to.eq('hello')
    })

    it('falls back to setAttribute when a property setter throws', () => {
        const view1 = <div id="setter-test" />
        const oldNodes = render(document.body, [view1], [])

        const el = document.body.firstChild as HTMLDivElement
        // Override the id setter so it throws, forcing fallback to setAttribute
        Object.defineProperty(el, 'id', {
            get: () => 'setter-test',
            set: () => { throw new Error('setter error') },
            configurable: true
        })

        const view2 = <div id="new-id" />
        render(document.body, [view2], oldNodes)

        expect(el.getAttribute('id')).to.eq('new-id')
    })

    it('removes an externally-set attribute when the new prop value is undefined', () => {
        const view1 = <div></div>
        const oldNodes = render(document.body, [view1], [])

        const el = document.body.firstChild as HTMLDivElement
        el.setAttribute('data-custom', 'value')
        expect(el.hasAttribute('data-custom')).to.be.true

        // 'data-custom' is not in oldProps, so the first loop won't remove it.
        // New prop is undefined → hits the else-if removeAttribute path.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const view2 = <div {...{ 'data-custom': undefined } as any}></div>
        render(document.body, [view2], oldNodes)

        expect(el.hasAttribute('data-custom')).to.be.false
    })

    it('sets value on a select element', () => {
        // Render options first, then set value on re-render so the option exists
        const view1 =
            <select>
                <option value="a">a</option>
                <option value="b">b</option>
            </select>
        const oldNodes = render(document.body, [view1], [])

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const props = { value: 'b' } as any
        const view2 =
            <select {...props}>
                <option value="a">a</option>
                <option value="b">b</option>
            </select>
        render(document.body, [view2], oldNodes)

        const select = document.body.firstChild as HTMLSelectElement
        expect(select.value).to.eq('b')
    })

})

it('keeps focus of element when rendering keyed siblings', () => {
    document.body.innerHTML = ''
    const view1 = <div>
        <input />
    </div>

    const view2 = <div>
        <input />
        <span key="test"></span>
    </div>

    const oldNodes = render(document.body, [view1], [])

    const node = (document.body.firstChild as HTMLDivElement).firstChild as HTMLInputElement
    node.focus()

    expect(node).to.be.eq(document.activeElement as HTMLInputElement)

    render(document.body, [view2], oldNodes)

    expect(node).to.be.eq(document.activeElement as HTMLInputElement)
})

/**
 * Shared-queue batching
 */
describe('batching', () => {

    beforeEach(() => {
        Array.prototype.slice.call(document.body.childNodes).forEach((c: Node) => document.body.removeChild(c))
    })

    it('batches sibling component renders into a single flush', async () => {
        let renderCountA = 0
        let renderCountB = 0
        let setA: myra.Evolve<number> = () => 0
        let setB: myra.Evolve<number> = () => 0

        const A = () => {
            const [n, set] = myra.useState(0)
            setA = set
            renderCountA++
            return <span id="a">{n}</span>
        }
        const B = () => {
            const [n, set] = myra.useState(0)
            setB = set
            renderCountB++
            return <span id="b">{n}</span>
        }
        const Root = () => <div><A /><B /></div>

        myra.mount(<Root />, document.body)
        await tick()

        renderCountA = 0
        renderCountB = 0

        // Both siblings update in the same tick — should produce one render each
        setA(1)
        setB(1)
        await tick()

        expect(renderCountA).to.eq(1)
        expect(renderCountB).to.eq(1)
        expect(document.getElementById('a')!.textContent).to.eq('1')
        expect(document.getElementById('b')!.textContent).to.eq('1')
    })

    it('batches context fan-out: all consumers update in a single flush', async () => {
        const Ctx = myra.createContext(0)
        let renderCountC1 = 0
        let renderCountC2 = 0
        let setVal: myra.Evolve<number> = () => 0

        const Consumer1 = () => {
            renderCountC1++
            const v = myra.useContext(Ctx)
            return <span id="c1">{v}</span>
        }
        const Consumer2 = () => {
            renderCountC2++
            const v = myra.useContext(Ctx)
            return <span id="c2">{v}</span>
        }
        const Provider = () => {
            const [val, set] = myra.useState(0)
            setVal = set
            return (
                <Ctx.Provider value={val}>
                    <Consumer1 />
                    <Consumer2 />
                </Ctx.Provider>
            )
        }

        myra.mount(<Provider />, document.body)
        await tick()

        renderCountC1 = 0
        renderCountC2 = 0

        setVal(42)
        await tick()
        await tick() // context notifications fire in a layout effect, need an extra tick

        expect(document.getElementById('c1')!.textContent).to.eq('42')
        expect(document.getElementById('c2')!.textContent).to.eq('42')
        // Each consumer renders exactly twice: once via synchronous tree-walk
        // when the Provider re-renders, and once via the subscription callback.
        // The batching ensures all subscription-triggered renders share one
        // setTimeout flush rather than N separate flushes.
        expect(renderCountC1).to.eq(2)
        expect(renderCountC2).to.eq(2)
    })

    it('defers cascading setState into the next batch', async () => {
        let renderCount = 0
        let triggerCascade: myra.Evolve<number> = () => 0

        const Cascading = () => {
            const [a, setA] = myra.useState(0)
            const [b, setB] = myra.useState(0)
            triggerCascade = setA
            renderCount++
            if (a > 0 && b === 0) {
                setB(a * 2)
            }
            return <span id="cas">{a},{b}</span>
        }

        myra.mount(<Cascading />, document.body)
        await tick()

        renderCount = 0
        triggerCascade(5)

        // First tick: renders with a=5, b=0 — setB enqueued for next batch
        await tick()
        expect(renderCount).to.eq(1)

        // Second tick: renders with a=5, b=10
        await tick()
        expect(renderCount).to.eq(2)
        expect(document.getElementById('cas')!.textContent).to.eq('5,10')
    })
})

