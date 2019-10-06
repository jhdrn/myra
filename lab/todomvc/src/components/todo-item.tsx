import * as myra from '../../../../src/myra'
import * as todos from '../models/todos'

type Todo = todos.Todo

type Props = {
    onchange: () => void
    todo: Todo
    key: string
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
export default myra.define<Props>(props => {

    const [state, evolve] = myra.useState(init)

    myra.useLifecycle(ev => ev.phase === myra.LifecyclePhase.AfterMount && evolve({ todo: props.todo }))

    const editTodo = () => evolve({ editing: true })

    const undoEditTodo = () => evolve({ editing: false })

    const saveTodo = (value: string) => {
        const todo = value.trim()
        if (todo) {
            const updatedTodo = { ...state.todo, title: todo }
            evolve({
                editing: false,
                todo: updatedTodo
            })
            todos.save(updatedTodo)
        }
    }

    const toggleTodoCompleted = () => {
        const updatedTodo = { ...state.todo, completed: !state.todo.completed }
        evolve({ todo: updatedTodo })
        todos.save(updatedTodo)
    }

    const onToggleCompletedClick = () => {
        toggleTodoCompleted()
        props.onchange()
    }

    const onDestroyClick = () => {
        todos.remove(state.todo.id)
        props.onchange()
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

    return (
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
    )
})
