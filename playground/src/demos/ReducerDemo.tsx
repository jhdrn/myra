import * as myra from 'myra'
import { useState, useReducer, useCallback, useRef, ComponentProps } from 'myra'

type TodoItem = { id: number; text: string; done: boolean }

type Action =
    | { type: 'ADD'; text: string }
    | { type: 'TOGGLE'; id: number }
    | { type: 'REMOVE'; id: number }
    | { type: 'CLEAR' }

let nextId = 1

function reducer(state: TodoItem[], action: Action): TodoItem[] {
    switch (action.type) {
        case 'ADD':
            return [...state, { id: nextId++, text: action.text, done: false }]
        case 'TOGGLE':
            return state.map(t => t.id === action.id ? { ...t, done: !t.done } : t)
        case 'REMOVE':
            return state.filter(t => t.id !== action.id)
        case 'CLEAR':
            return []
    }
}

export function ReducerDemo(_props: ComponentProps): myra.VNode {
    const [todos, dispatch] = useReducer(reducer, [
        { id: nextId++, text: 'Read the Myra source code', done: false },
        { id: nextId++, text: 'Build something cool', done: false },
    ])
    const [inputValue, setInputValue] = useState('')

    // dispatch is stable across renders — safe to pass deep into the tree
    const dispatchRef = useRef(dispatch)
    dispatchRef.current = dispatch
    const stableDispatch = useCallback((a: Action) => dispatchRef.current(a), [])

    const addTodo = () => {
        const text = inputValue.trim()
        if (text) {
            stableDispatch({ type: 'ADD', text })
            setInputValue('')
        }
    }

    const done = todos.filter(t => t.done).length

    return (
        <div class="demo-grid">
            <div class="demo-card" style="grid-column: 1 / -1; max-width: 480px">
                <h3>Todo list — <code>useReducer</code></h3>
                <p>
                    All state transitions go through a single <code>reducer</code>{' '}
                    function. <code>dispatch</code> is stable across renders (Myra
                    implements it via <code>useCallback([], [])</code>).
                </p>

                <div style="display:flex;gap:.5rem;margin-top:.25rem">
                    <input
                        type="text"
                        value={inputValue}
                        oninput={e => setInputValue((e.currentTarget as HTMLInputElement).value)}
                        onkeydown={e => { if (e.key === 'Enter') addTodo() }}
                        placeholder="New todo..."
                        style="flex:1"
                    />
                    <button onclick={addTodo}>Add</button>
                </div>

                <div style="margin-top:.75rem">
                    {todos.length === 0
                        ? <p class="dom-note">No todos. Add one above.</p>
                        : todos.map(todo => (
                            <div key={todo.id} class="list-item-row">
                                <input
                                    type="checkbox"
                                    checked={todo.done}
                                    onchange={() => stableDispatch({ type: 'TOGGLE', id: todo.id })}
                                    style="cursor:pointer"
                                />
                                <span style={todo.done ? 'flex:1;text-decoration:line-through;color:var(--text-muted)' : 'flex:1'}>
                                    {todo.text}
                                </span>
                                <button
                                    class="secondary"
                                    onclick={() => stableDispatch({ type: 'REMOVE', id: todo.id })}
                                    style="padding:.2rem .6rem"
                                >
                                    ✕
                                </button>
                            </div>
                        ))
                    }
                </div>

                {todos.length > 0
                    ? (
                        <div class="btn-row" style="margin-top:.5rem">
                            <span class="dom-note">{done}/{todos.length} done</span>
                            <button class="danger" onclick={() => stableDispatch({ type: 'CLEAR' })}>
                                Clear all
                            </button>
                        </div>
                    )
                    : <nothing />
                }
            </div>
        </div>
    )
}
