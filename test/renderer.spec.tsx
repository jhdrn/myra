import { render } from '../src/component'
import { ButtonAttributes, ComponentProps, ElementVNode } from '../src/contract'
import { useState } from '../src/hooks'
import * as myra from '../src/myra'
import { expect } from 'chai'
import * as sinon from 'sinon'

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
        expect(node.nodeType).to.be.eq(Node.COMMENT_NODE)
        expect(node.nodeValue).to.be.eq('Nothing')

        done()
    })

    it('replaces a nothing node with a text node', (done) => {

        const view1 = <div><nothing /></div>
        render(document.body, [view1], [])

        expect(document.body.firstChild?.firstChild?.nodeType).to.be.eq(Node.COMMENT_NODE)
        expect(document.body.firstChild?.firstChild?.nodeValue).to.be.eq('Nothing')

        render(document.body, [<div>text</div>], [view1])
        expect(document.body.firstChild?.childNodes.length).to.be.eq(1)
        expect(document.body.firstChild?.firstChild?.textContent).to.eq('text')

        done()
    })

    it('replaces a nothing node with an element node', (done) => {

        const view1 = <div><nothing /></div>
        render(document.body, [view1], [])

        expect(document.body.firstChild?.firstChild?.nodeType).to.be.eq(Node.COMMENT_NODE)
        expect(document.body.firstChild?.firstChild?.nodeValue).to.be.eq('Nothing')

        render(document.body, [<div><span /></div>], [view1])
        expect(document.body.firstChild?.childNodes.length).to.be.eq(1)
        expect((document.body.firstChild?.firstChild as HTMLSpanElement).tagName).to.eq('SPAN')

        done()
    })

    it('replaces a nothing node with a fragment node', (done) => {

        const view1 = <div><nothing /></div>
        render(document.body, [view1], [])

        expect(document.body.firstChild?.firstChild?.nodeType).to.be.eq(Node.COMMENT_NODE)
        expect(document.body.firstChild?.firstChild?.nodeValue).to.be.eq('Nothing')

        render(document.body, [<div><><span /></></div>], [view1])
        expect(document.body.firstChild?.childNodes.length).to.be.eq(1)
        expect((document.body.firstChild?.firstChild as HTMLSpanElement).tagName).to.eq('SPAN')

        done()
    })

    it('replaces a nothing node with a component node', (done) => {

        const view1 = <nothing />

        const Component = () => {
            return <div id="component-id" />
        }
        render(document.body, [view1], [])

        expect(document.body.firstChild?.textContent).to.eq('Nothing')

        const view2 = <Component />

        render(document.body, [view2], [view1])

        expect(document.body.childNodes.length).to.be.eq(1)
        expect((document.body.firstChild as Element).id).to.eq('component-id')
        done()
    })

    it('renders an element node from a virtual node', (done) => {
        const view = <div></div>

        render(document.body, [view], [])
        const node = view.domRef as HTMLDivElement
        expect(node.nodeType).to.be.eq(Node.ELEMENT_NODE)
        expect(node.tagName).to.be.eq('DIV')

        done()
    })


    it('replaces an element node with a text node', (done) => {

        const view1 = <div><span /></div>
        render(document.body, [view1], [])

        expect((document.body.firstChild?.firstChild as HTMLDivElement).tagName).to.eq('SPAN')

        render(document.body, [<div>text</div>], [view1])
        expect(document.body.firstChild?.childNodes.length).to.be.eq(1)
        expect(document.body.firstChild?.firstChild?.textContent).to.eq('text')

        done()
    })

    it('replaces an element node with a nothing node', (done) => {

        const view1 = <div></div>
        render(document.body, [view1], [])

        expect((document.body.firstChild as HTMLDivElement).tagName).to.eq('DIV')

        render(document.body, [<nothing />], [view1])

        expect(document.body.childNodes.length).to.be.eq(1)
        expect(document.body.firstChild?.nodeType).to.be.eq(Node.COMMENT_NODE)
        expect(document.body.firstChild?.nodeValue).to.be.eq('Nothing')

        done()
    })

    it('replaces an element node with a fragment node', (done) => {

        const view1 = <div></div>
        render(document.body, [view1], [])

        expect((document.body.firstChild as HTMLDivElement).tagName).to.eq('DIV')

        render(document.body, [<><span /></>], [view1])
        expect(document.body.childNodes.length).to.be.eq(1)
        expect((document.body.firstChild as HTMLSpanElement).tagName).to.eq('SPAN')

        done()
    })

    it('replaces an element node with a component node', (done) => {

        const view1 = <div></div>

        const Component = () => {
            return <div id="component-id" />
        }
        render(document.body, [view1], [])

        expect((document.body.firstChild as HTMLDivElement).tagName).to.eq('DIV')

        const view2 = <Component />

        render(document.body, [view2], [view1])
        expect(document.body.childNodes.length).to.be.eq(1)

        expect((document.body.firstChild as Element).id).to.eq('component-id')
        done()
    })

    it('renders a text node from a virtual node', (done) => {
        const view = <div>text</div>

        render(document.body, [view], [])
        const parentNode = view.domRef as HTMLDivElement
        expect(parentNode.childNodes.length).to.be.eq(1)
        expect(parentNode.childNodes[0].nodeType).to.be.eq(Node.TEXT_NODE)
        expect(parentNode.childNodes[0].textContent).to.be.eq('text')

        done()
    })

    it('replaces a text node with a nothing node', (done) => {

        const view1 = <div>text</div>
        render(document.body, [view1], [])

        expect(document.body.firstChild?.firstChild?.textContent).to.eq('text')

        render(document.body, [<div><nothing /></div>], [view1])

        expect(document.body.firstChild?.childNodes.length).to.be.eq(1)
        expect(document.body.firstChild?.firstChild?.nodeType).to.be.eq(Node.COMMENT_NODE)
        expect(document.body.firstChild?.firstChild?.nodeValue).to.be.eq('Nothing')

        done()
    })

    it('replaces a text node with an element node', (done) => {

        const view1 = <div>text</div>
        render(document.body, [view1], [])

        expect(document.body.firstChild?.firstChild?.textContent).to.eq('text')

        render(document.body, [<div><span /></div>], [view1])
        expect(document.body.firstChild?.childNodes.length).to.be.eq(1)
        expect((document.body.firstChild?.firstChild as HTMLSpanElement).tagName).to.eq('SPAN')

        done()
    })

    it('replaces a text node with a fragment node', (done) => {

        const view1 = <div>text</div>
        render(document.body, [view1], [])

        expect(document.body.firstChild?.firstChild?.textContent).to.eq('text')

        render(document.body, [<div><><span /></></div>], [view1])
        expect(document.body.firstChild?.childNodes.length).to.be.eq(1)
        expect((document.body.firstChild?.firstChild as HTMLSpanElement).tagName).to.eq('SPAN')

        done()
    })

    it('replaces a text node with a component node', (done) => {

        const view1 = <div>text</div>

        const Component = () => {
            return <div id="component-id" />
        }
        render(document.body, [view1], [])

        expect(document.body.firstChild?.firstChild?.textContent).to.eq('text')

        const view2 = <div><Component /></div>

        render(document.body, [view2], [view1])
        expect(document.body.childNodes.length).to.be.eq(1)

        expect((document.body.firstChild?.firstChild as Element).id).to.eq('component-id')
        done()
    })

    it('renders a component from a component virtual node', (done) => {
        const TestComponent = () => <div id="testComponent"></div>

        const view = <div><TestComponent /></div>

        render(document.body, [view], [])
        const node = view.domRef as HTMLDivElement
        expect((node.childNodes[0] as HTMLDivElement).id).to.be.eq('testComponent')

        done()
    })

    it('replaces a component node with a nothing node', (done) => {

        const Component = () => {
            return <div id="component-id" />
        }
        const componentInstance = <Component />
        render(document.body, [componentInstance], [])

        expect((document.body.firstChild as Element).id).to.eq('component-id')

        render(document.body, [<nothing />], [componentInstance])
        expect(document.body.childNodes.length).to.be.eq(1)
        expect(document.body.firstChild?.textContent).to.eq('Nothing')

        done()

    })

    it('replaces a component node with a text node', (done) => {

        const Component = () => {
            return <div id="component-id" />
        }
        const view1 = <div><Component /></div>
        render(document.body, [view1], [])

        expect((document.body.firstChild?.firstChild as Element).id).to.eq('component-id')

        render(document.body, [<div>text</div>], [view1])
        expect(document.body.firstChild?.childNodes.length).to.be.eq(1)
        expect(document.body.firstChild?.firstChild?.textContent).to.eq('text')

        done()
    })

    it('replaces a component node with an element node', (done) => {

        const Component = () => {
            return <div id="component-id" />
        }
        const view1 = <div><Component /></div>
        render(document.body, [view1], [])

        expect((document.body.firstChild?.firstChild as Element).id).to.eq('component-id')

        render(document.body, [<div><span /></div>], [view1])
        expect(document.body.firstChild?.childNodes.length).to.be.eq(1)
        expect((document.body.firstChild?.firstChild as HTMLSpanElement).tagName).to.eq('SPAN')

        done()
    })

    it('replaces a component node with a fragment node', (done) => {

        const Component = () => {
            return <div id="component-id" />
        }
        const view1 = <div><Component /></div>
        render(document.body, [view1], [])

        expect((document.body.firstChild?.firstChild as Element).id).to.eq('component-id')

        render(document.body, [<div><><span /></></div>], [view1])
        expect(document.body.firstChild?.childNodes.length).to.be.eq(1)
        expect((document.body.firstChild?.firstChild as HTMLSpanElement).tagName).to.eq('SPAN')

        done()
    })

    it('removes a component when it\'s parent is replaced', (done) => {

        const Component = () => {
            return <div id="component-id" />
        }
        const vNode = <div><Component /></div>
        render(document.body, [vNode], [])

        setTimeout(() => {

            expect(document.getElementById('component-id')).not.to.be.null

            render(document.body, [<nothing />], [vNode])
            setTimeout(() => {
                expect(document.getElementById('component-id')).to.be.null

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

        setShowChildOuter(true)
        setTimeout(() => {
            const child = document.getElementById('child-node')
            expect(child).not.to.be.null
            done()
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

        expect(node.childElementCount).to.be.eq(viewItems1.length)

        render(document.body, [view2], [view1])
        node = view2.domRef as HTMLDivElement

        expect(node.childElementCount).to.be.eq(viewItems2.length)

        done()
    })

    it('removes excessive keyed child nodes', (done) => {
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

        render(document.body, [view1], [])
        let node = view1.domRef as HTMLDivElement

        expect(node.childElementCount).to.be.eq(viewItems1.length)

        render(document.body, [view2], [view1])
        node = view2.domRef as HTMLDivElement

        expect(node.childElementCount).to.be.eq(viewItems2.length)
        expect(node.children[0].textContent).to.be.eq('c')
        expect(node.children[1].textContent).to.be.eq('e')

        done()
    })

    it('removes excessive keyed component child nodes', (done) => {
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

        render(document.body, [view1], [])
        let node = view1.domRef as HTMLDivElement

        expect(node.childElementCount).to.be.eq(viewItems1.length)

        render(document.body, [view2], [view1])
        node = view2.domRef as HTMLDivElement

        expect(node.childElementCount).to.be.eq(viewItems2.length)
        expect(node.children[0].textContent).to.be.eq('c')
        expect(node.children[1].textContent).to.be.eq('e')

        done()
    })

    it('correctly inserts and appends keyed child nodes', (done) => {
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

        render(document.body, [view1], [])
        let node = view1.domRef as HTMLDivElement

        expect(node.childElementCount).to.be.eq(viewItems1.length)

        render(document.body, [view2], [view1])
        node = view2.domRef as HTMLDivElement

        expect(node.childElementCount).to.be.eq(viewItems2.length)
        expect(node.children[0].textContent).to.be.eq('a')
        expect(node.children[1].textContent).to.be.eq('b')
        expect(node.children[2].textContent).to.be.eq('c')
        expect(node.children[3].textContent).to.be.eq('d')
        expect(node.children[4].textContent).to.be.eq('e')
        expect(node.children[5].textContent).to.be.eq('f')
        expect(node.children[6].textContent).to.be.eq('g')

        done()
    })


    it('correctly inserts and appends keyed an non-keyed child nodes', (done) => {

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

        render(document.body, [view1], [])
        let node = view1.domRef as HTMLDivElement

        expect(node.childElementCount).to.be.eq(viewItems1.length)

        render(document.body, [view2], [view1])
        node = view2.domRef as HTMLDivElement

        expect(node.childElementCount).to.be.eq(viewItems2.length)
        expect(node.children[0].textContent).to.be.eq('a')
        expect(node.children[1].textContent).to.be.eq('b')
        expect(node.children[2].textContent).to.be.eq('c')
        expect(node.children[3].textContent).to.be.eq('d')
        expect(node.children[4].textContent).to.be.eq('e')
        expect(node.children[5].textContent).to.be.eq('f')
        expect(node.children[6].textContent).to.be.eq('g')

        done()
    })


    it('correctly updates keyed an non-keyed child nodes', (done) => {

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

        render(document.body, [view1], [])
        let node = view1.domRef as HTMLDivElement

        expect(node.childElementCount).to.be.eq(viewItems1.length)

        render(document.body, [view2], [view1])
        node = view2.domRef as HTMLDivElement

        expect(node.childElementCount).to.be.eq(viewItems2.length)
        expect(node.children[0].textContent).to.be.eq('a')
        expect(node.children[1].textContent).to.be.eq('b')
        expect(node.children[2].textContent).to.be.eq('c')
        expect(node.children[3].textContent).to.be.eq('d')
        expect(node.children[4].textContent).to.be.eq('e')
        expect(node.children[5].textContent).to.be.eq('f')
        expect(node.children[6].textContent).to.be.eq('g')

        done()
    })

    it('correctly inserts and appends keyed fragment child nodes', (done) => {
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

        render(document.body, [view1], [])
        let node = view1.domRef as HTMLDivElement

        expect(node.childNodes.length).to.be.eq(viewItems1.length)

        render(document.body, [view2], [view1])
        node = view2.domRef as HTMLDivElement

        expect(node.childNodes.length).to.be.eq(viewItems2.length)
        expect(node.childNodes[0].textContent).to.be.eq('a')
        expect(node.childNodes[1].textContent).to.be.eq('b')
        expect(node.childNodes[2].textContent).to.be.eq('c')
        expect(node.childNodes[3].textContent).to.be.eq('d')
        expect(node.childNodes[4].textContent).to.be.eq('e')
        expect(node.childNodes[5].textContent).to.be.eq('f')
        expect(node.childNodes[6].textContent).to.be.eq('g')

        done()
    })

    it('correctly inserts and appends keyed component child nodes', (done) => {
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

        render(document.body, [view1], [])
        let node = view1.domRef as HTMLDivElement

        expect(node.childElementCount).to.be.eq(viewItems1.length)

        render(document.body, [view2], [view1])
        node = view2.domRef as HTMLDivElement

        expect(node.childElementCount).to.be.eq(viewItems2.length)
        expect(node.children[0].textContent).to.be.eq('a')
        expect(node.children[1].textContent).to.be.eq('b')
        expect(node.children[2].textContent).to.be.eq('c')
        expect(node.children[3].textContent).to.be.eq('d')
        expect(node.children[4].textContent).to.be.eq('e')
        expect(node.children[5].textContent).to.be.eq('f')
        expect(node.children[6].textContent).to.be.eq('g')

        done()
    })

    it('correctly updates and appends keyed child nodes', (done) => {
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

        render(document.body, [view1], [])
        let node = view1.domRef as HTMLDivElement

        expect(node.childElementCount).to.be.eq(viewItems1.length)

        render(document.body, [view2], [view1])
        node = view2.domRef as HTMLDivElement

        expect(node.childElementCount).to.be.eq(viewItems2.length)
        expect(node.children[0].textContent).to.be.eq('b')
        expect(node.children[1].textContent).to.be.eq('c')
        expect(node.children[2].textContent).to.be.eq('d')

        done()
    })

    it('correctly updates and appends keyed fragment child nodes', (done) => {
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

        render(document.body, [view1], [])
        let node = view1.domRef as HTMLDivElement

        expect(node.childNodes.length).to.be.eq(viewItems1.length)

        render(document.body, [view2], [view1])
        node = view2.domRef as HTMLDivElement

        expect(node.childNodes.length).to.be.eq(viewItems2.length)
        expect(node.childNodes[0].textContent).to.be.eq('b')
        expect(node.childNodes[1].textContent).to.be.eq('c')
        expect(node.childNodes[2].textContent).to.be.eq('d')

        done()
    })

    it('correctly updates and appends keyed component child nodes', (done) => {
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

        render(document.body, [view1], [])
        let node = view1.domRef as HTMLDivElement

        expect(node.childElementCount).to.be.eq(viewItems1.length)

        render(document.body, [view2], [view1])
        node = view2.domRef as HTMLDivElement

        expect(node.childElementCount).to.be.eq(viewItems2.length)
        expect(node.children[0].textContent).to.be.eq('b')
        expect(node.children[1].textContent).to.be.eq('c')
        expect(node.children[2].textContent).to.be.eq('d')

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

        expect(node.childElementCount).to.be.eq(viewItems1.length)

        render(document.body, [view2], [view1])
        node = view2.domRef as HTMLDivElement

        expect(node.childElementCount).to.be.eq(viewItems2.length)

        done()
    })

    it('creates and returns an element node from an element virtual node', (done) => {
        const view = <div />

        render(document.body, [view], [])
        const node = view.domRef as Element

        expect(node.nodeType).to.be.eq(Node.ELEMENT_NODE)
        expect(node.tagName).to.be.eq('DIV')

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

        expect(node.id).to.be.eq('testId')
        expect(node.className).to.be.eq('testClass')
        expect(node.type).to.be.eq('text')
        expect(node.disabled).to.be.eq(true)
        expect(node.checked).to.be.eq(true)
        expect(node.value).to.be.eq('5')

        done()
    })

    it('returns an element with onclick event listener set', (done) => {
        const mocks = sinon.spy({
            onclickUpdate: () => { /* dummy */ }
        })

        const view =
            <button onclick={mocks.onclickUpdate}></button>

        render(document.body, [view], [])

        const node = view.domRef as HTMLButtonElement
        expect(node.onclick).not.to.be.null

        node.click()

        expect(mocks.onclickUpdate.callCount).to.eq(1)

        done()
    })

    it('does not set an event listener that doesn\'t exist on the element', (done) => {
        const mocks = {
            onCustomClick: () => { /* dummy */ }
        } as unknown as ButtonAttributes

        const view =
            <button {...mocks}></button>

        render(document.body, [view], [])

        const node = view.domRef
        expect(node.getAttribute('onCustomClick')).to.be.null

        done()
    })

    it('does not set an object as an element attribute', (done) => {
        const mocks = {
            objAttr: { foo: 'bar' }
        } as unknown as ButtonAttributes

        const view =
            <button {...mocks}></button>

        render(document.body, [view], [])

        const node = view.domRef as HTMLButtonElement
        expect(node.getAttribute('objAttr')).to.be.null

        done()
    })

    it('does not set an array as an element attribute', (done) => {
        const mocks = {
            arrayAttr: ['foo', 'bar']
        } as unknown as ButtonAttributes

        const view =
            <button {...mocks}></button>

        render(document.body, [view], [])

        const node = view.domRef as HTMLButtonElement
        expect(node.getAttribute('arrayAttr')).to.be.null

        done()
    })

    it('replaces the old event listener with a the new one', (done) => {
        const mocks = sinon.spy({
            onclickUpdate1: () => { /* dummy */ },
            onclickUpdate2: () => { /* dummy */ }
        })

        const view1 = <button onclick={mocks.onclickUpdate1}></button>

        const view2 = <button onclick={mocks.onclickUpdate2}></button>

        render(document.body, [view1], [])

        let node = view1.domRef as HTMLButtonElement

        render(document.body, [view2], [view1])

        node = view2.domRef as HTMLButtonElement

        node.click()

        expect(mocks.onclickUpdate1.called).not.to.be.true
        expect(mocks.onclickUpdate2.callCount).to.eq(1)

        done()
    })

    it('updates attributes if they have changed', (done) => {
        const view1 =
            <div class="foo" id="bar"></div>

        const view2 =
            <div class="bar" id="foo"></div>

        render(document.body, [view1], [])

        let node = view1.domRef as HTMLDivElement

        expect(node.className).to.be.eq('foo')
        expect(node.id).to.be.eq('bar')

        render(document.body, [view2], [view1])

        node = view2.domRef as HTMLDivElement

        expect(node.className).to.be.eq('bar')
        expect(node.id).to.be.eq('foo')

        done()
    })

    it('removes attributes from existing element', (done) => {
        const view1 =
            <div class="foo" id="bar"></div>

        const view2 =
            <div class="foo"></div>

        render(document.body, [view1], [])

        let node = view1.domRef as HTMLDivElement

        expect(node.id).to.be.eq('bar')

        render(document.body, [view2], [view1])

        node = view2.domRef as HTMLDivElement

        expect(node.id).to.be.eq('')

        done()
    })

    it('removes attributes from existing element if the attribute is undefined', (done) => {
        const view1 =
            <div class="foo" id="bar"></div>

        const view2 =
            <div class="foo" id={undefined}></div>

        render(document.body, [view1], [])

        let node = view1.domRef as HTMLDivElement

        expect(node.id).to.be.eq('bar')

        render(document.body, [view2], [view1])

        node = view2.domRef as HTMLDivElement

        expect(node.id).to.be.eq('')

        done()
    })

    it('replaces the element if the tagName has changed', (done) => {
        const view1 = <div />

        const view2 = <span />

        render(document.body, [view1], [])

        let node = view1.domRef as HTMLDivElement

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (node as any)._id = 1
        expect(node.tagName).to.be.eq('DIV')

        render(document.body, [view2], [view1])

        node = view2.domRef as HTMLDivElement

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((node as any)._id).not.to.be.ok
        expect(node.tagName).to.be.eq('SPAN')

        done()
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
                    class={state.clicked ? 'clicked' : ''}
                    onclick={setClicked}>
                </button>
            )
        }

        const view1 =
            <div>
                {items.map(x => <div key={x.id.toString()}><ItemComponent forceUpdate item={x} /></div>)}
            </div>

        render(document.body, [view1], [])

        setTimeout(() => {
            let btn = (view1.domRef as HTMLDivElement).querySelector('button')!
            btn.click()

            setTimeout(() => {

                expect(btn.className).to.be.eq('clicked')
                expect(btn.id).to.be.eq('item-1')

                const view2 =
                    <div>
                        {items.reverse().map(x => <div key={x.id.toString()}><ItemComponent forceUpdate item={x} /></div>)}
                    </div>

                render(document.body, [view2], [view1])

                btn = (view2.domRef as HTMLDivElement).querySelector('button')!
                expect(btn.id).to.be.eq('item-5')
                expect(btn.className).to.be.eq('')

                // The last element should've been updated
                btn = ((view2.domRef as HTMLDivElement).lastChild as HTMLDivElement).firstChild as HTMLButtonElement

                expect(btn.id).to.be.eq('item-1')
                expect(btn.className).to.be.eq('clicked')

                done()
            })
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
                    class={state.clicked ? 'clicked' : ''}
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

        setTimeout(() => {
            expect(btn.className).to.be.eq('clicked')
            expect(btn.id).to.be.eq('item-1')

            const view2 =
                <div>
                    {items.reverse().map(x => <div><ItemComponent forceUpdate item={x} /></div>)}
                </div>

            render(document.body, [view2], [view1])

            btn = (view2.domRef as HTMLDivElement).querySelector('button')!
            expect(btn.id).to.be.eq('item-5')
            expect(btn.className).to.be.eq('clicked')

            // The last element should've been updated
            btn = ((view2.domRef as HTMLDivElement).lastChild as HTMLDivElement).firstChild as HTMLButtonElement

            expect(btn.id).to.be.eq('item-1')
            expect(btn.className).to.be.eq('')
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
                    class={state.clicked ? 'clicked' : ''}
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

        setTimeout(() => {
            expect(btn.className).to.be.eq('clicked')
            expect(btn.id).to.be.eq('item-1')

            const view2 =
                <div>
                    {items.reverse().map(x => <ItemComponent key={x.id.toString()} item={x} />)}
                </div>

            render(document.body, [view2], [view1])

            btn = (view2.domRef as HTMLDivElement).querySelector('button')!
            expect(btn.className).to.be.eq('')
            expect(btn.id).to.be.eq('item-5')

            // The last element should've been updated
            btn = (view2.domRef as HTMLDivElement).lastChild as HTMLButtonElement
            expect(btn.className).to.be.eq('clicked')
            expect(btn.id).to.be.eq('item-1')

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
                    class={state.clicked ? 'clicked' : ''}
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

        setTimeout(() => {
            expect(btn.className).to.be.eq('clicked')
            expect(btn.id).to.be.eq('item-1')

            const view2 =
                <div>
                    {items.reverse().map(x => <ItemComponent item={x} />)}
                </div>

            render(document.body, [view2], [view1])

            btn = (view2.domRef as HTMLDivElement).querySelector('button')!
            expect(btn.className).to.be.eq('clicked')
            expect(btn.id).to.be.eq('item-5')

            // The last element should've been updated
            btn = (view2.domRef as HTMLDivElement).lastChild as HTMLButtonElement
            expect(btn.className).to.be.eq('')
            expect(btn.id).to.be.eq('item-1')
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

        render(document.body, [view1], [])

        let btn = view1.domRef!.querySelector('button')!
        btn.click()

        setTimeout(() => {
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

            render(document.body, [view2], [view1])

            btn = view2.domRef!.querySelector('button')!
            expect(btn.className).to.be.eq('')
            expect(btn.id).to.be.eq('item-5')

            // The last element should've been updated with the same values
            btn = view2.domRef!.lastChild as HTMLButtonElement
            expect(btn.className).to.be.eq('clicked')
            expect(btn.id).to.be.eq('item-1')
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

        render(document.body, [view1], [])
        setTimeout(() => {

            let btn = view1.domRef!.querySelector('button')!
            btn.click()
            setTimeout(() => {
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

                render(document.body, [view2], [view1])

                btn = view2.domRef!.querySelector('button')!

                expect(btn.className).to.be.eq('clicked')
                expect(btn.id).to.be.eq('item-5')

                // The last element should've been updated with the same values
                btn = view2.domRef!.lastChild as HTMLButtonElement

                expect(btn.className).to.be.eq('')
                expect(btn.id).to.be.eq('item-1')
                done()
            })
        })
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

    const node = (view1.domRef as HTMLDivElement).firstChild as HTMLInputElement
    node.focus()

    expect(node).to.be.eq(document.activeElement as HTMLInputElement)

    render(document.body, [view2], [view1])

    expect(node).to.be.eq(document.activeElement as HTMLInputElement)

    done()
})

