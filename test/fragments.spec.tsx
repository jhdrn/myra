import * as myra from '../src/myra'

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

            expect(node).not.toBeNull()

            done()
        })
    })

    it('renders nested fragment content', done => {

        const Component = () => <div><><div id="fragment-node2" /></></div>

        myra.mount(<Component />, document.body)

        requestAnimationFrame(() => {
            const node = q('body > div > #fragment-node2')

            expect(node).not.toBeNull()

            done()
        })
    })


    it('renders multiple fragment child nodes', done => {

        const Component = () => <><div id="fragment-node3" /><div id="fragment-node4" /></>

        myra.mount(<Component />, document.body)

        requestAnimationFrame(() => {
            const node1 = q('body > #fragment-node3')
            const node2 = q('body > #fragment-node4')

            expect(node1).not.toBeNull()
            expect(node2).not.toBeNull()

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

            expect(node1).not.toBeNull()
            expect((node1 as HTMLElement).id).toBe('fragment-node5')
            expect(node2).not.toBeNull()
            expect((node2 as HTMLElement).id).toBe('fragment-node6')

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
            expect(nothingNode).not.toBeNull()
            expect(nothingNode?.nodeType).toBe(Node.COMMENT_NODE)
            expect(childNode).not.toBeNull()

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

        requestAnimationFrame(() => {
            setDidRenderOuter(true)
            requestAnimationFrame(() => {
                const childNode = fragmentContainer.firstElementChild
                expect(childNode).toBeNull()
                done()
            })
        })
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

        requestAnimationFrame(() => {
            setDidRenderOuter(true)
            requestAnimationFrame(() => {
                const childNode = fragmentContainer.firstElementChild
                expect(childNode).toBeNull()
                done()
            })
        })
    })


    it('removes component fragment child nodes', done => {

        let setDidRenderOuter: myra.Evolve<boolean> = function () { return true }

        const ChildComponent = (_props: { foo: 'bar' }) => <><div id="fragment-child4"></div></>
        const Component = () => {
            const [didRender, setDidRender] = myra.useState(false)
            setDidRenderOuter = setDidRender
            return (
                <>
                    {!didRender &&
                        <ChildComponent foo="bar" />
                    }
                </>
            )
        }

        const fragmentContainer = document.createElement('div')
        fragmentContainer.className = 'fragment-container'
        document.body.appendChild(fragmentContainer)

        myra.mount(<Component />, fragmentContainer)

        requestAnimationFrame(() => {
            setDidRenderOuter(true)
            requestAnimationFrame(() => {
                const nothingNode = fragmentContainer.firstChild
                expect(nothingNode).not.toBeNull()
                expect(nothingNode?.nodeType).toBe(Node.COMMENT_NODE)
                done()
            })
        })
    })

    it('removes and "unmounts" component child nodes', done => {
        const mock = {
            unmount: () => { }
        }

        spyOn(mock, 'unmount').and.callThrough()

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

        requestAnimationFrame(() => {
            setDidRenderOuter(true)
            requestAnimationFrame(() => {
                const childNode = fragmentContainer.firstElementChild
                expect(childNode).toBeNull()

                expect(mock.unmount).toHaveBeenCalledTimes(1)
                done()
            })
        })
    })
})
