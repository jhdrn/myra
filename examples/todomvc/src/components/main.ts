import { defineComponent, Update, View, Task } from 'myra/core'
import { text, component } from 'myra/html'
import { section, header, footer, div, h1, input, p, a } from 'myra/html/elements'
import { trackLocationChanges } from 'myra/location'
import { todoListComponent } from './todo-list'
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
    div(
        section({ 'class': 'todoapp' },
            header({ 'class': 'header' },
                h1(text('todos')),
                input({ 
                    'class': 'new-todo', 
                    placeholder: 'What needs to be done?', 
                    autofocus: true,
                    value: '',
                    onkeyup_enter: addNewTodo
                })
            ),
            component(todoListComponent)
        ),
        footer({ 'class': 'info' },
            p(text('Double-click to edit a todo')),
            // <!-- Remove the below line ↓ -->
            // <p>Template by <a href="http://sindresorhus.com">Sindre Sorhus</a></p>
            // <!-- Change this out with your name and url ↓ -->
            p(text('Created by'), a({ href: 'https://github.com/jonathanhedren' }, text('Jonathan Hedrén'))),
            p(text('Part of'), a({ href: 'http://todomvc.com' }, text('TodoMVC')))
        )
    )



/**
 * Component
 */
export const mainComponent = defineComponent<Model, undefined>({
    name: 'MainComponent',
    init: init,
    view: view
})