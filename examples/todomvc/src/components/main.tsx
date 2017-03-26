import * as myra from 'myra'
import TodoListComponent from './todo-list'
import * as todos from '../models/todos'

type Todo = todos.Todo

type State = {}

/**
 * Updates
 */

// Adds a new todo with a title of the value of the "new todo" input field
const addNewTodo = (value: string) => {
    const newTodo = value.trim()
    if (newTodo) {

        const todo: Todo = {
            id: 0,
            completed: false,
            title: newTodo
        }

        return todos.add(todo)
    }
    return undefined
}

/**
 * Component
 */
export default myra.define('MainComponent', {}, () =>
    <div>
        <section class="todoapp">
            <header class="header">
                <h1>todos</h1>
                <input class="new-todo"
                    placeholder="What needs to be done?"
                    autofocus
                    value=""
                    onkeydown={(ev, el) =>
                        ev.keyCode === 13 && addNewTodo(el.value)} />
            </header>
            <TodoListComponent forceUpdate />
        </section>
        <footer class="info">
            <p>Double-click to edit a todo</p>
            <p>Created by <a href="https://github.com/jhdrn/myra">Jonathan Hedrén</a></p>
            <p>Part of <a href="http://todomvc.com">TodoMVC</a></p>
        </footer>
    </div>
)