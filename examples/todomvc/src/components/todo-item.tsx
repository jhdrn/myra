import { defineComponent, evolve } from 'myra/core'
import * as jsxFactory from 'myra/core/jsxFactory'
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
                    onclick={() => ctx.apply(toggleTodoCompleted)} />

                <label ondblclick={ctx.state.todo.completed ? undefined : () => ctx.apply(editTodo)}>
                    {ctx.state.todo.title}
                </label>
                <button class="destroy" onclick={() => ctx.invoke(todos.remove(ctx.state.todo.id))}></button>
            </div>
            {
                ctx.state.editing ?
                    <input class="edit"
                        focus="true"
                        value={ctx.state.todo.title}
                        onblur={ctx.bind(saveTodo)}
                        onkeyup_enter={ctx.bind(saveTodo)}
                        onkeyup_escape={ctx.bind(undoEditTodo)} />
                    : <nothing />
            }
        </li>
})