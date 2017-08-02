import * as myra from 'myra'
import TodoListComponent from './todo-list'
import * as todos from '../models/todos'

type Todo = todos.Todo

/**
 * Updates
 */



/**
 * Component
 */
export default myra.define({}).updates({}).effects({
    // Adds a new todo with a title of the value of the "new todo" input field
    addNewTodo: (_, ev: KeyboardEvent) => {
        if (ev.keyCode === 13) {

            const newTodo = (ev.target as HTMLInputElement).value.trim()
            if (newTodo) {

                const todo: Todo = {
                    id: 0,
                    completed: false,
                    title: newTodo
                }

                todos.add(todo)
            }
        }
    }
}).view(({ effects }) =>
    <div>
        <section class="todoapp">
            <header class="header">
                <h1>todos</h1>
                <input class="new-todo"
                    placeholder="What needs to be done?"
                    autofocus
                    value=""
                    onkeydown={effects.addNewTodo}
                />
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