import { defineComponent, Update, View, Task } from 'myra/core'
import * as jsxFactory from 'myra/html/jsxFactory'
import { trackLocationChanges } from 'myra/location'
import { TodoListComponent } from './todo-list'
import * as todos from '../models/todos'

type Todo = todos.Todo

/**
 * Model
 */
type Model = undefined

// Initial model state
const init: [Model, Task] = [undefined, trackLocationChanges()]


/**
 * Updates
 */

// Adds a new todo with a title of the value of the "new todo" input field
const addNewTodo: Update<Model, any> = (m: Model, value: string) => {
    const newTodo = value.trim()
    if (newTodo) {
        
        const todo: Todo = {
            id: 0,
            completed: false,
            title: newTodo
        }

        return [m, todos.add(todo)] 
    }
    return m
}


/**
 * View
 */
const view: View<Model> = (_) =>
    <div>
        <section class="todoapp">
            <header class="header">
                <h1>todos</h1>
                <input class="new-todo"
                       placeholder="What needs to be done?"
                       autofocus={true}
                       value=""
                       onkeyup_enter={ addNewTodo } />
            </header>
            <TodoListComponent />
        </section>
        <footer class="info">
            <p>Double-click to edit a todo</p>
            <p>Created by <a href="https://github.com/jonathanhedren">Jonathan Hedrén</a></p>
            <p>Part of <a href="http://todomvc.com">TodoMVC</a></p>
        </footer>
    </div>


/**
 * Component
 */
export const mainComponent = defineComponent<Model, undefined>({
    name: 'MainComponent',
    init: init,
    view: view
})