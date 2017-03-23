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

const editTodo = () => ({ editing: true })

const undoEditTodo = () => ({ editing: false })

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
export default myra.defineComponent<State, Props>({
    name: 'TodoItemComponent',
    init: init,
    onMount: mount,
    view: ctx =>
        <li class={todoClass(ctx.state)}>
            <div class="view">
                <input class="toggle"
                    type="checkbox"
                    checked={ctx.state.todo.completed}
                    onclick={() => ctx.apply(toggleTodoCompleted) > ctx.props.onchange()} />

                <label ondblclick={ctx.state.todo.completed ? undefined : () => ctx.apply(editTodo)}>
                    {ctx.state.todo.title}
                </label>
                <button class="destroy" onclick={() => ctx.invoke(todos.remove(ctx.state.todo.id)) > ctx.props.onchange()}></button>
            </div>
            {
                ctx.state.editing ?
                    <input class="edit"
                        focus
                        value={ctx.state.todo.title}
                        onblur={(_, el) => ctx.apply(saveTodo, el.value)}
                        onkeyup={(ev, el) => {
                            if (ev.keyCode === 13) {
                                ctx.apply(saveTodo, el.value)
                            }
                            else if (ev.keyCode === 27) {
                                ctx.apply(undoEditTodo)
                            }
                        }} />
                    : <nothing />
            }
        </li>
})