import * as myra from 'myra'
import { useState, ComponentProps } from 'myra'

export function Counter(_props: ComponentProps): myra.VNode {
    const [count, setCount] = useState(0)
    const [funcCount, setFuncCount] = useState(0)
    // Lazy initializer: the function is only called once on mount
    const [lazy] = useState(() => Math.floor(Math.random() * 10_000))

    return (
        <div class="demo-grid">
            <div class="demo-card">
                <h3>Direct set</h3>
                <p>
                    Passing a value directly. Multiple rapid calls within the same
                    tick will only keep the last value set.
                </p>
                <div class="value">{count}</div>
                <div class="btn-row">
                    <button onclick={() => setCount(count - 1)}>−1</button>
                    <button onclick={() => setCount(count + 1)}>+1</button>
                    <button class="secondary" onclick={() => setCount(0)}>Reset</button>
                </div>
                <p>
                    Clicking the "+3" below three times fast with a direct set only
                    adds 1, because all three calls read the same stale closure value:
                </p>
                <div class="btn-row">
                    <button onclick={() => { setCount(count + 1); setCount(count + 1); setCount(count + 1) }}>
                        +3 (direct — only +1 applied)
                    </button>
                </div>
            </div>

            <div class="demo-card">
                <h3>Functional updater</h3>
                <p>
                    Passing <code>(prev) =&gt; next</code> reads the latest state
                    from the vNode, not the closure. All three updates apply.
                </p>
                <div class="value">{funcCount}</div>
                <div class="btn-row">
                    <button onclick={() => setFuncCount(c => c - 1)}>−1</button>
                    <button onclick={() => setFuncCount(c => c + 1)}>+1</button>
                    <button class="secondary" onclick={() => setFuncCount(0)}>Reset</button>
                </div>
                <div class="btn-row">
                    <button onclick={() => {
                        setFuncCount(c => c + 1)
                        setFuncCount(c => c + 1)
                        setFuncCount(c => c + 1)
                    }}>
                        +3 (functional — all three applied)
                    </button>
                </div>
            </div>

            <div class="demo-card">
                <h3>Lazy initializer</h3>
                <p>
                    <code>useState(() =&gt; compute())</code> — the function is
                    called <em>once</em> on mount, not on every render. Useful for
                    expensive initial values.
                </p>
                <p>
                    This value was computed once when the component mounted:
                </p>
                <div class="value">{lazy}</div>
                <p class="dom-note">
                    Navigate away and back to see a new value on remount.
                </p>
            </div>
        </div>
    )
}
