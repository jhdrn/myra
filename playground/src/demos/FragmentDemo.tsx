import * as myra from 'myra'
import { useState, ComponentProps } from 'myra'

// A component that returns a Fragment — no wrapper element in the DOM
function MultiRoot(_props: ComponentProps): myra.VNode {
    return (
        <>
            <li style="color:var(--accent)">First sibling (no wrapper)</li>
            <li style="color:var(--success)">Second sibling</li>
            <li style="color:var(--danger)">Third sibling</li>
        </>
    )
}

export function FragmentDemo(_props: ComponentProps): myra.VNode {
    const [showContent, setShowContent] = useState(true)
    const [showFragment, setShowFragment] = useState(true)

    return (
        <div class="demo-grid">
            <div class="demo-card">
                <h3>Fragment — multiple roots</h3>
                <p>
                    A component can return <code>{'<>...</>'}</code> to render
                    multiple sibling elements without a wrapping DOM node. Inspect the
                    DOM and you'll see these <code>&lt;li&gt;</code> elements are
                    direct children of the <code>&lt;ul&gt;</code>.
                </p>
                <div class="btn-row">
                    <button onclick={() => setShowFragment(v => !v)}>
                        {showFragment ? 'Unmount fragment' : 'Mount fragment'}
                    </button>
                </div>
                <ul style="margin-top:.5rem;padding-left:1.25rem">
                    {showFragment ? <MultiRoot /> : <nothing />}
                    <li style="color:var(--text-muted)">(always-present sibling)</li>
                </ul>
                <p class="dom-note" style="margin-top:.5rem">
                    When unmounted, the fragment is replaced by a{' '}
                    <code>&lt;!-- Nothing --&gt;</code> comment node as a stable
                    placeholder in the DOM.
                </p>
            </div>

            <div class="demo-card">
                <h3>
                    <code>&lt;nothing /&gt;</code> — conditional placeholder
                </h3>
                <p>
                    <code>&lt;nothing /&gt;</code> renders as an HTML comment node
                    (<code>&lt;!-- Nothing --&gt;</code>). It acts as a stable anchor
                    in the vDOM so Myra can efficiently diff conditional content.
                </p>
                <div class="btn-row">
                    <button onclick={() => setShowContent(v => !v)}>
                        Toggle content
                    </button>
                </div>
                <div style="margin-top:.5rem;padding:1rem;background:var(--surface2);border-radius:6px">
                    {showContent
                        ? (
                            <div style="display:flex;flex-direction:column;gap:.5rem">
                                <strong>Content is visible</strong>
                                <p>This block animates in and out.</p>
                            </div>
                        )
                        : <nothing />
                    }
                </div>
                <p class="dom-note" style="margin-top:.5rem">
                    When hidden, open DevTools and look inside the container — you'll
                    see <code>&lt;!-- Nothing --&gt;</code> holding the position.
                </p>
            </div>
        </div>
    )
}
