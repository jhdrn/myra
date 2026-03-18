import * as myra from 'myra'
import { useState, ComponentProps } from 'myra'

type Item = { id: number; color: string }

const COLORS = ['Tomato', 'Blueberry', 'Avocado', 'Mango', 'Grape', 'Lemon']

function makeItems(): Item[] {
    return COLORS.map((color, i) => ({ id: i + 1, color }))
}

function shuffle<T>(arr: T[]): T[] {
    const a = [...arr]
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]]
    }
    return a
}

export function KeyedListDemo(_props: ComponentProps): myra.VNode {
    const [items, setItems] = useState(makeItems)
    const [useKeys, setUseKeys] = useState(true)

    return (
        <div class="demo-grid">
            <div class="demo-card" style="grid-column: 1 / -1">
                <h3>Keyed vs unkeyed list reconciliation</h3>
                <p>
                    Each row has a text input. Type something into a few inputs, then
                    hit <strong>Shuffle</strong>. With keys, the DOM nodes follow their
                    data — inputs keep their values. Without keys, Myra reuses DOM nodes
                    by position, so inputs appear to stay still while the labels move.
                </p>

                <div class="toggle-row" style="margin-bottom:.75rem">
                    <label class="toggle">
                        <input
                            type="checkbox"
                            checked={useKeys}
                            onchange={() => setUseKeys(v => !v)}
                        />
                        Use <code>key</code> prop
                    </label>
                    <span class="badge" style={useKeys ? '' : 'background:var(--danger)'}>
                        {useKeys ? 'keys ON' : 'keys OFF'}
                    </span>
                </div>

                <div class="btn-row" style="margin-bottom:.75rem">
                    <button onclick={() => setItems(shuffle)}>Shuffle</button>
                    <button class="secondary" onclick={() => setItems(makeItems)}>Reset order</button>
                    <button
                        class="secondary"
                        onclick={() => setItems(prev => [
                            ...prev,
                            { id: Date.now(), color: `Color #${prev.length + 1}` },
                        ])}
                    >
                        Add item
                    </button>
                    <button
                        class="secondary"
                        onclick={() => setItems(prev => prev.slice(0, -1))}
                        disabled={items.length === 0}
                    >
                        Remove last
                    </button>
                </div>

                <div>
                    {items.map(item => (
                        <div
                            key={useKeys ? item.id : undefined}
                            class="list-item-row"
                        >
                            <span style="min-width:100px;font-weight:500">{item.color}</span>
                            <input
                                type="text"
                                placeholder="Type here…"
                                style="flex:1"
                            />
                            <button
                                class="secondary"
                                style="padding:.2rem .6rem"
                                onclick={() => setItems(prev => prev.filter(i => i.id !== item.id))}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>

                <p class="dom-note" style="margin-top:.75rem">
                    {useKeys
                        ? 'Keys are ON — DOM nodes track their data. Shuffle preserves input values.'
                        : 'Keys are OFF — DOM nodes are reused by position. Shuffle scrambles the labels but leaves inputs in place.'
                    }
                </p>
            </div>
        </div>
    )
}
