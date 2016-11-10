import { defineComponent, evolve, Apply } from 'myra/core'
import * as jsxFactory from 'myra/core/jsxFactory'
import { bind } from 'myra/forms'
import * as todos from '../models/todos'

type Todo = todos.Todo


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
const mount = (state: State, todo: Todo) =>
    evolve(state, x => {
        x.todo = todo!
    })

const saveTodo = (state: State, value: string) => {
    const todo = value.trim()
    if (todo) {
        const updatedTodo = evolve(state.todo, t => {
            t.title = todo
        }).state
        return evolve(state, x => {
            x.editing = false
            x.todo = updatedTodo
        }).and(todos.save(updatedTodo))
    }
    else {
        return evolve(state).and(todos.remove(state.todo.id))
    }
}

const editTodo = (m: State) => {
    return evolve(m, x => {
        x.editing = true
    })
}

const undoEditTodo = (m: State) =>
    evolve(m, x => {
        x.editing = false
    })

const toggleTodoCompleted = (m: State) => {
    const updatedTodo = evolve(
        m.todo,
        t => t.completed = !m.todo.completed
    ).state
    return evolve(m, x => x.todo = updatedTodo).and(todos.save(updatedTodo))
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

const editInputOrNothing = (dispatch: Apply, state: State) =>
    state.editing ? <input class="edit"
        focus="true"
        value={state.todo.title}
        onblur={bind(dispatch, saveTodo)}
        onkeyup_enter={bind(dispatch, saveTodo)}
        onkeyup_escape={bind(dispatch, undoEditTodo)} />
        : <nothing />

/**
 * Component
 */
export const TodoItemComponent = defineComponent<State, Todo>({
    name: 'TodoItemComponent',
    init: { state: init },
    onMount: mount,
    view: (ctx) =>
        <li class={todoClass(ctx.state)}>
            <div class="view">
                <input class="toggle"
                    type="checkbox"
                    checked={ctx.state.todo.completed}
                    onclick={() => toggleTodoCompleted} />

                <label ondblclick={ctx.state.todo.completed ? undefined : () => editTodo}>{ctx.state.todo.title}</label>
                <button class="destroy" onclick={() => todos.remove(ctx.state.todo.id)}></button>
            </div>
            {editInputOrNothing(ctx.apply, ctx.state)}
        </li>
})