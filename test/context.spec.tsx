import { render } from '../src/component'
import * as myra from '../src/myra'
import { expect } from 'chai'

const tick = (ms = 0) => new Promise<void>(resolve => setTimeout(resolve, ms))

beforeEach(() => {
    document.body.innerHTML = ''
})

describe('createContext / useContext', () => {

    it('returns the default value when there is no Provider', () => {
        const ctx = myra.createContext(42)
        let captured: number | undefined

        const Consumer = () => {
            captured = myra.useContext(ctx)
            return <div />
        }

        render(document.body, [<Consumer />], [])

        expect(captured).to.eq(42)
    })

    it('returns the Provider value when wrapped in a Provider', () => {
        const ctx = myra.createContext(0)
        let captured: number | undefined

        const Consumer = () => {
            captured = myra.useContext(ctx)
            return <div />
        }

        render(document.body, [
            <ctx.Provider value={99}>
                <Consumer />
            </ctx.Provider>
        ], [])

        expect(captured).to.eq(99)
    })

    it('re-renders consumers when the Provider value changes', async () => {
        const ctx = myra.createContext(0)
        let captured: number | undefined
        let renderCount = 0
        let updateValue!: myra.Evolve<number>

        const App = () => {
            const [value, setVal] = myra.useState(1)
            updateValue = setVal
            return (
                <ctx.Provider value={value}>
                    <Consumer />
                </ctx.Provider>
            )
        }

        const Consumer = () => {
            captured = myra.useContext(ctx)
            renderCount++
            return <div />
        }

        myra.mount(<App />, document.body)
        await tick()
        expect(captured).to.eq(1)
        const countAfterMount = renderCount

        updateValue(2)
        await tick()
        await tick()

        expect(captured).to.eq(2)
        expect(renderCount).to.be.greaterThan(countAfterMount)
    })

    it('inner Provider takes precedence over outer Provider', () => {
        const ctx = myra.createContext('default')
        let captured: string | undefined

        const Consumer = () => {
            captured = myra.useContext(ctx)
            return <div />
        }

        render(document.body, [
            <ctx.Provider value="outer">
                <ctx.Provider value="inner">
                    <Consumer />
                </ctx.Provider>
            </ctx.Provider>
        ], [])

        expect(captured).to.eq('inner')
    })

    it('outer Provider is used for consumers outside the inner Provider', () => {
        const ctx = myra.createContext('default')
        const captured: string[] = []

        const OuterConsumer = () => {
            captured.push(myra.useContext(ctx))
            return <span />
        }

        const InnerConsumer = () => {
            captured.push(myra.useContext(ctx))
            return <span />
        }

        render(document.body, [
            <ctx.Provider value="outer">
                <OuterConsumer />
                <ctx.Provider value="inner">
                    <InnerConsumer />
                </ctx.Provider>
            </ctx.Provider>
        ], [])

        expect(captured[0]).to.eq('outer')
        expect(captured[1]).to.eq('inner')
    })

    it('updates all consumers when the Provider value changes', async () => {
        const ctx = myra.createContext(0)
        let capturedA: number | undefined
        let capturedB: number | undefined
        let updateValue!: myra.Evolve<number>

        const App = () => {
            const [value, setVal] = myra.useState(1)
            updateValue = setVal
            return (
                <ctx.Provider value={value}>
                    <ConsumerA />
                    <ConsumerB />
                </ctx.Provider>
            )
        }

        const ConsumerA = () => {
            capturedA = myra.useContext(ctx)
            return <span />
        }

        const ConsumerB = () => {
            capturedB = myra.useContext(ctx)
            return <span />
        }

        myra.mount(<App />, document.body)
        await tick()

        updateValue(5)
        await tick()
        await tick()

        expect(capturedA).to.eq(5)
        expect(capturedB).to.eq(5)
    })

    it('unsubscribes from the Provider when the consumer unmounts', async () => {
        const ctx = myra.createContext(0)
        let renderCount = 0
        let updateValue!: myra.Evolve<number>

        const App = () => {
            const [value, setVal] = myra.useState(1)
            updateValue = setVal
            return (
                <ctx.Provider value={value}>
                    <Consumer />
                </ctx.Provider>
            )
        }

        const Consumer = () => {
            myra.useContext(ctx)
            renderCount++
            return <div />
        }

        const appVNode = <App />
        const oldNodes = render(document.body, [appVNode], [])
        await tick()
        const countAfterMount = renderCount

        render(document.body, [<nothing />], oldNodes)
        await tick()

        updateValue(2)
        await tick()
        await tick()

        expect(renderCount).to.eq(countAfterMount)
    })

    it('memo-wrapped consumer still re-renders when context value changes', async () => {
        const ctx = myra.createContext(0)
        let captured: number | undefined
        let renderCount = 0
        let updateValue!: myra.Evolve<number>

        const App = () => {
            const [value, setVal] = myra.useState(1)
            updateValue = setVal
            return (
                <ctx.Provider value={value}>
                    <Consumer />
                </ctx.Provider>
            )
        }

        const Consumer = myra.memo(() => {
            captured = myra.useContext(ctx)
            renderCount++
            return <div />
        })

        myra.mount(<App />, document.body)
        await tick()
        expect(captured).to.eq(1)
        const countAfterMount = renderCount

        updateValue(7)
        await tick()
        await tick()

        expect(captured).to.eq(7)
        expect(renderCount).to.be.greaterThan(countAfterMount)
    })

    it('uses the default value when a consumer is rendered outside any Provider after unmount', async () => {
        const ctx = myra.createContext('default')
        let captured: string | undefined

        const Consumer = () => {
            captured = myra.useContext(ctx)
            return <div />
        }

        const withProvider = render(document.body, [
            <ctx.Provider value="provided">
                <Consumer />
            </ctx.Provider>
        ], [])
        expect(captured).to.eq('provided')

        render(document.body, [<Consumer />], withProvider)
        expect(captured).to.eq('default')
    })

    it('does not notify unsubscribed consumers', async () => {
        const ctx = myra.createContext(0)
        let unsubscribeCalled = false
        let renderCount = 0
        let updateValue!: myra.Evolve<number>
        let showConsumer!: myra.Evolve<boolean>

        const App = () => {
            const [value, setVal] = myra.useState(1)
            const [show, setShow] = myra.useState(true)
            updateValue = setVal
            showConsumer = setShow
            return (
                <ctx.Provider value={value}>
                    {show ? <Consumer /> : <nothing />}
                </ctx.Provider>
            )
        }

        const Consumer = () => {
            myra.useContext(ctx)
            renderCount++
            return <div />
        }

        myra.mount(<App />, document.body)
        await tick()
        const countAfterMount = renderCount

        // Hide the consumer (unmounts it, triggering cleanup/unsubscribe)
        showConsumer(false)
        await tick()
        await tick()
        unsubscribeCalled = renderCount === countAfterMount

        // Change context value — unmounted consumer should not re-render
        updateValue(99)
        await tick()
        await tick()

        expect(unsubscribeCalled).to.be.true
        expect(renderCount).to.eq(countAfterMount)
    })
})
