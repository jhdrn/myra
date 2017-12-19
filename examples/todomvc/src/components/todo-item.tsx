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
 * View helper function
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
export default myra.define<State, Props>(init, c => {

    c.didMount = (props) => c.evolve({ todo: props.todo })
    c.willUpdate = (props) => c.evolve({ todo: props.todo })

    const editTodo = () => c.evolve({ editing: true })

    const undoEditTodo = () => c.evolve({ editing: false })

    const saveTodo = (value: string) => {
        const todo = value.trim()
        if (todo) {
            const updatedTodo = { ...c.state.todo, title: todo }
            c.evolve({
                editing: false,
                todo: updatedTodo
            })
            todos.save(updatedTodo)
        }
        else {
            todos.remove(c.state.todo.id)
        }
    }

    const toggleTodoCompleted = () => {
        const updatedTodo = { ...c.state.todo, completed: !c.state.todo.completed }
        c.evolve({ todo: updatedTodo })
        todos.save(updatedTodo)
    }

    const onToggleCompletedClick = () => {
        toggleTodoCompleted()
        c.props.onchange()
    }

    const onDestroyClick = () => {
        todos.remove(c.state.todo.id)
        c.props.onchange()
    }

    const onEditBlur = (ev: Event) => {
        saveTodo((ev.target as HTMLInputElement).value)
    }

    const onEditKeyUp = (ev: KeyboardEvent) => {
        if (ev.keyCode === 13) {
            saveTodo((ev.target as HTMLInputElement).value)
        }
        else if (ev.keyCode === 27) {
            undoEditTodo()
        }
    }

    return state =>
        <li class={todoClass(state)}>
            <div class="view">
                <input class="toggle"
                    type="checkbox"
                    checked={state.todo.completed}
                    onclick={onToggleCompletedClick} />

                <label ondblclick={state.todo.completed ? undefined : editTodo}>
                    {state.todo.title}
                </label>
                <button class="destroy" onclick={onDestroyClick}></button>
            </div>
            {
                state.editing ?
                    <input class="edit"
                        focus
                        value={state.todo.title}
                        onblur={onEditBlur}
                        onkeyup={onEditKeyUp} />
                    : <nothing />
            }
        </li>
})