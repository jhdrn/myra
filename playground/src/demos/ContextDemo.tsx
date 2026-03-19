import * as myra from 'myra'
import { createContext, useContext, useState, ComponentProps } from 'myra'

// --- Theme context -----------------------------------------------------------

type Theme = 'light' | 'dark'

const ThemeContext = createContext<Theme>('light')

function ThemedBox(_props: ComponentProps): myra.VNode {
    const theme = useContext(ThemeContext)
    return (
        <div class={'demo-themed-box ' + theme}>
            Theme from context: <strong>{theme}</strong>
        </div>
    )
}

function ThemeDemo(_props: ComponentProps): myra.VNode {
    const [theme, setTheme] = useState<Theme>('light')
    return (
        <div class="demo-card">
            <h3>Theme context</h3>
            <p>
                A <code>ThemeContext.Provider</code> wraps <code>ThemedBox</code>.
                Toggling the theme re-renders only the consumer.
            </p>
            <ThemeContext.Provider value={theme}>
                <ThemedBox />
            </ThemeContext.Provider>
            <div class="btn-row">
                <button onclick={() => setTheme('light')}>Light</button>
                <button onclick={() => setTheme('dark')}>Dark</button>
            </div>
        </div>
    )
}

// --- Counter context (deep tree) ---------------------------------------------

type CounterCtx = { count: number; increment: () => void; decrement: () => void }
const CounterContext = createContext<CounterCtx>({ count: 0, increment: () => { }, decrement: () => { } })

function DeepConsumer(_props: ComponentProps): myra.VNode {
    const { count } = useContext(CounterContext)
    return <div class="demo-deep-consumer">Deep consumer sees count: <strong>{count}</strong></div>
}

function MiddleLayer(_props: ComponentProps): myra.VNode {
    // Intentionally does NOT read the context — just passes children through
    return (
        <div class="demo-middle">
            <p class="dom-note">Middle layer (does not consume context)</p>
            <DeepConsumer />
        </div>
    )
}

function CounterButtons(_props: ComponentProps): myra.VNode {
    const { increment, decrement } = useContext(CounterContext)
    return (
        <div class="btn-row">
            <button onclick={decrement}>−1</button>
            <button onclick={increment}>+1</button>
        </div>
    )
}

function DeepTreeDemo(_props: ComponentProps): myra.VNode {
    const [count, setCount] = useState(0)
    const ctx: CounterCtx = {
        count,
        increment: () => setCount(c => c + 1),
        decrement: () => setCount(c => c - 1),
    }
    return (
        <div class="demo-card">
            <h3>Deep tree</h3>
            <p>
                The counter value lives at the top. <code>MiddleLayer</code> is
                unaware of it. Both <code>DeepConsumer</code> and{' '}
                <code>CounterButtons</code> read from context.
            </p>
            <CounterContext.Provider value={ctx}>
                <MiddleLayer />
                <CounterButtons />
            </CounterContext.Provider>
        </div>
    )
}

// --- Default value (no provider) ---------------------------------------------

function DefaultValueDemo(_props: ComponentProps): myra.VNode {
    const theme = useContext(ThemeContext)
    return (
        <div class="demo-card">
            <h3>Default value (no Provider)</h3>
            <p>
                <code>useContext</code> falls back to the value passed to{' '}
                <code>createContext()</code> when there is no matching Provider
                above in the tree.
            </p>
            <div class="demo-themed-box light">
                ThemeContext default: <strong>{theme}</strong>
            </div>
        </div>
    )
}

// --- Root export -------------------------------------------------------------

export function ContextDemo(_props: ComponentProps): myra.VNode {
    return (
        <div class="demo-grid">
            <ThemeDemo />
            <DeepTreeDemo />
            <DefaultValueDemo />
        </div>
    )
}
