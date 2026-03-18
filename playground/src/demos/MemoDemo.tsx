import * as myra from 'myra'
import { useState, useMemo, useCallback, useRef, memo, ComponentProps } from 'myra'

// ---- Child components ----

type ChildProps = ComponentProps & {
    label: string
    onIncrement: () => void
}

function PlainChild(props: ChildProps): myra.VNode {
    const renderCount = useRef(0)
    renderCount.current++
    return (
        <div style="display:flex;align-items:center;gap:.75rem;padding:.5rem 0">
            <span>{props.label}</span>
            <span class="badge red">renders: {renderCount.current}</span>
            <button onclick={props.onIncrement}>Increment parent</button>
        </div>
    )
}

const MemoChild = memo(function MemoChild(props: ChildProps): myra.VNode {
    const renderCount = useRef(0)
    renderCount.current++
    return (
        <div style="display:flex;align-items:center;gap:.75rem;padding:.5rem 0">
            <span>{props.label}</span>
            <span class="badge green">renders: {renderCount.current}</span>
            <button onclick={props.onIncrement}>Increment parent</button>
        </div>
    )
})

// ---- Main demo ----

export function MemoDemo(_props: ComponentProps): myra.VNode {
    const [count, setCount] = useState(0)
    const [input, setInput] = useState('')

    // Without useCallback: new function reference every render → memo child re-renders
    const unstableIncrement = () => setCount(c => c + 1)

    // With useCallback: stable reference → memo child skips re-render
    const stableIncrement = useCallback(() => setCount(c => c + 1), [])

    // useMemo: only re-sorts when input changes
    const sortedChars = useMemo(() => {
        if (!input) return []
        return input.split('').sort()
    }, [input])

    return (
        <div class="demo-grid">
            <div class="demo-card">
                <h3>
                    <code>memo</code> — skipping re-renders
                </h3>
                <p>
                    Parent counter: <span class="value" style="font-size:1.1rem">{count}</span>
                </p>
                <p>
                    Increment the parent and watch the render badges. The plain child
                    re-renders every time. The memoized child only re-renders when its
                    props change.
                </p>
                <PlainChild label="Plain (no memo)" onIncrement={unstableIncrement} />
                <MemoChild label="Memoized (memo + useCallback)" onIncrement={stableIncrement} />
                <p class="dom-note">
                    The memoized child receives a stable <code>onIncrement</code>{' '}
                    via <code>useCallback</code>. Without <code>useCallback</code>,
                    a new function is created each render, defeating <code>memo</code>.
                </p>
            </div>

            <div class="demo-card">
                <h3>
                    <code>useMemo</code> — memoizing a computation
                </h3>
                <p>
                    The sorted character array is only recomputed when the input
                    string changes. Incrementing the counter above does not trigger
                    the sort.
                </p>
                <input
                    type="text"
                    value={input}
                    oninput={e => setInput((e.currentTarget as HTMLInputElement).value)}
                    placeholder="Type something to sort..."
                />
                {sortedChars.length > 0
                    ? (
                        <p style="margin-top:.5rem">
                            Sorted: <code>{sortedChars.join(' ')}</code>
                        </p>
                    )
                    : <nothing />
                }
            </div>
        </div>
    )
}
