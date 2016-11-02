import { defineComponent, evolve } from 'myra/core'
import { bind } from 'myra/forms'
import * as jsxFactory from 'myra/core/jsxFactory'
import { trackLocationChanges } from 'myra/location'
import { TodoListComponent } from './todo-list'
import * as todos from '../models/todos'

type Todo = todos.Todo

/**
 * State
 */
type State = undefined

// Initial state
const init = evolve(undefined).and(trackLocationChanges())


/**
 * Updates
 */

// Adds a new todo with a title of the value of the "new todo" input field
const addNewTodo = (m: State, value: string) => {
    const newTodo = value.trim()
    if (newTodo) {

        const todo: Todo = {
            id: 0,
            completed: false,
            title: newTodo
        }

        return evolve(m).and(todos.add(todo))
    }
    return evolve(m)
}


/**
 * View
 */
const view = (_: State) =>
    <div>
        <section class="todoapp">
            <header class="header">
                <h1>todos</h1>
                <input class="new-todo"
                    placeholder="What needs to be done?"
                    autofocus={true}
                    value=""
                    onkeydown_enter={bind(addNewTodo)} />
            </header>
            <TodoListComponent />
        </section>
        <footer class="info">
            <p>Double-click to edit a todo</p>
            <p>Created by <a href="https://github.com/jhdrn/myra">Jonathan Hedrén</a></p>
            <p>Part of <a href="http://todomvc.com">TodoMVC</a></p>
        </footer>
    </div>


/**
 * Component
 */
export const mainComponent = defineComponent<State, undefined>({
    name: 'MainComponent',
    init: init,
    view: view
})