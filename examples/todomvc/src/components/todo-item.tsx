import * as myra from 'myra'
import * as todos from '../models/todos'

type Todo = todos.Todo

type Props = {
    onchange: () => void
    todo: Todo
}

/**
 * State
 */
type State = {
    editing: boolean
    todo: Todo
}
const init: State = {
    editing: false,
    todo: {
        id: 0,
        completed: false,
        title: ''
    }
}


/**
 * Updates
 */
const mount = (_state: State, props: Props) =>
    ({ todo: props.todo })

const saveTodo = (state: State, value: string) => {
    const todo = value.trim()
    if (todo) {
        const updatedTodo = { ...state.todo, title: todo }
        return [{
            editing: false,
            todo: updatedTodo
        }, todos.save(updatedTodo)]
    }
    else {
        return [state, todos.remove(state.todo.id)]
    }
}


const toggleTodoCompleted = (m: State) => {
    const updatedTodo = { ...m.todo, completed: !m.todo.completed }
    return [{ todo: updatedTodo }, todos.save(updatedTodo)]
}


/**
 * View
 */
const todoClass = (m: State) => {
    if (m.todo.completed) {
        return 'completed'
    }
    else if (m.editing) {
        return 'editing'
    }
    return undefined
}


/**
 * Component
 */
export default myra.define<State, Props>(init).updates({
    editTodo: () => ({ editing: true }),
    undoEditTodo: () => ({ editing: false })
}).effects({
    _didMount: mount
}).view(({ state, props, updates, effects }) =>
    <li class={todoClass(state)}>
        <div class="view">
            <input class="toggle"
                type="checkbox"
                checked={state.todo.completed}
                onclick={() => apply(toggleTodoCompleted) > props.onchange()} />

            <label ondblclick={state.todo.completed ? undefined : () => apply(editTodo)}>
                {state.todo.title}
            </label>
            <button class="destroy" onclick={() => invoke(todos.remove(state.todo.id)) > props.onchange()}></button>
        </div>
        {
            state.editing ?
                <input class="edit"
                    focus
                    value={state.todo.title}
                    onblur={(_, el) => apply(saveTodo, el.value)}
                    onkeyup={(ev, el) => {
                        if (ev.keyCode === 13) {
                            apply(saveTodo, el.value)
                        }
                        else if (ev.keyCode === 27) {
                            apply(undoEditTodo)
                        }
                    }} />
                : <nothing />
        }
    </li>
})