import * as myra from 'myra'
import { useState, useRef, useEffect, ComponentProps } from 'myra'

export function RefDemo(_props: ComponentProps): myra.VNode {
    // --- Focus demo ---
    const inputRef = useRef<HTMLInputElement>()
    const focusInput = () => inputRef.current?.focus()

    // --- Previous value ---
    const [value, setValue] = useState('')
    const prevValueRef = useRef('')
    // Store the previous value in a ref — updating a ref never triggers re-render
    const prevValue = prevValueRef.current
    useEffect(() => {
        prevValueRef.current = value
    })

    // --- Mutable counter (ref as mutable container) ---
    const renderCountRef = useRef(0)
    renderCountRef.current++
    const [, forceRender] = useState(0)

    return (
        <div class="demo-grid">
            <div class="demo-card">
                <h3>DOM ref — programmatic focus</h3>
                <p>
                    <code>useRef()</code> gives a stable <code>{'{ current }'}</code>{' '}
                    object that is populated with the DOM element after render via the
                    <code>ref</code> prop.
                </p>
                <input
                    ref={inputRef}
                    type="text"
                    placeholder="Click the button to focus me"
                />
                <div class="btn-row" style="margin-top:.5rem">
                    <button onclick={focusInput}>Focus input</button>
                </div>
            </div>

            <div class="demo-card">
                <h3>Previous value tracker</h3>
                <p>
                    A ref persists across renders without causing re-renders itself.
                    Storing the previous value in a ref + reading it before the effect
                    updates it gives you the value from the <em>last</em> render.
                </p>
                <input
                    type="text"
                    value={value}
                    oninput={e => setValue((e.currentTarget as HTMLInputElement).value)}
                    placeholder="Type something..."
                />
                <p style="margin-top:.5rem">
                    Current: <strong>{value || '(empty)'}</strong>
                </p>
                <p>
                    Previous: <strong>{prevValue || '(empty)'}</strong>
                </p>
            </div>

            <div class="demo-card">
                <h3>Ref as mutable container</h3>
                <p>
                    Unlike state, mutating a ref does <em>not</em> schedule a
                    re-render. Useful for values that should persist across renders
                    but don't need to drive the UI.
                </p>
                <p>
                    This component has rendered{' '}
                    <span class="badge">{renderCountRef.current}</span> time(s).
                </p>
                <div class="btn-row">
                    <button onclick={() => forceRender(n => n + 1)}>
                        Force re-render
                    </button>
                </div>
                <p class="dom-note">
                    The counter increments on every render — it's tracked via
                    ref, not state.
                </p>
            </div>
        </div>
    )
}
