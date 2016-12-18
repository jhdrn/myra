import * as myra from 'myra'
import TodoListComponent from './todo-list'
import * as todos from '../models/todos'

type Todo = todos.Todo

/**
 * State
 */
type State = undefined

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

        return myra.evolve(m).and(todos.add(todo))
    }
    return myra.evolve(m)
}

/**
 * Component
 */
export default myra.defineComponent<State, undefined>({
    name: 'MainComponent',
    init: { state: undefined },
    view: ctx =>
        <div>
            <section class="todoapp">
                <header class="header">
                    <h1>todos</h1>
                    <input class="new-todo"
                        placeholder="What needs to be done?"
                        autofocus
                        value=""
                        onkeydown={(ev, el) =>
                            ev.keyCode === 13 && ctx.apply(addNewTodo, el.value)} />
                </header>
                <TodoListComponent />
            </section>
            <footer class="info">
                <p>Double-click to edit a todo</p>
                <p>Created by <a href="https://github.com/jhdrn/myra">Jonathan Hedrén</a></p>
                <p>Part of <a href="http://todomvc.com">TodoMVC</a></p>
            </footer>
        </div>
})