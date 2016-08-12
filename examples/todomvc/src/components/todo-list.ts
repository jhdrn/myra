import { defineComponent, evolve, View, Update } from 'myra/core'
import { section, footer, div, ul, li, input, component, label, span, strong, a, button, text, nothing } from 'myra/html'
import { matchLocation } from 'myra/location'
import * as todos from '../models/todos'
import { todoItemComponent } from './todo-item'

type Todo = todos.Todo

/**
 * Model
 */
type TodosFilter = 'all' | 'active' | 'completed'
type Model = {
    todos: Todo[]
    itemsLeft: number
    filter: TodosFilter
}
const init: Model = {
    todos: [],
    itemsLeft: 0,
    filter: 'all'
}



/**
 * Updates
 */

const setFilter = (m: Model) => {
    if (matchLocation('#/active')) {
        return evolve(m, x => x.filter = 'active')
    }
    else if (matchLocation('#/completed')) {
        return evolve(m, x => x.filter = 'completed')
    }
    else if (matchLocation('#/', '')) {
        return evolve(m, x => x.filter = 'all')
    }
    return m
}

// Callback 
const todosLoaded = (m: Model, todos: Todo[]) => 
    evolve(m, x => {
        x.todos = todos 
        x.itemsLeft = todos.filter(t => !t.completed).length
    })

// Mount function: load all todos
const mount: Update<Model, any> = (m: Model) => [setFilter(m), todos.getAll(todosLoaded)]


/**
 * Subscriptions
 */
const subscriptions = {
    'todosChanged': todosLoaded,
    '__locationChanged': setFilter
}



/**
 * View
 */
const filterTodos = (model: Model) => (todo: Todo) => {
    switch (model.filter) {
        case 'active':
            return !todo.completed
        case 'completed':
            return todo.completed
    }
    return true
}

const filterLink = (href: string, txt: string) => {
    const attributes: any = { 
        href: href
    }
    if (matchLocation(href)) {
        attributes['class'] = 'selected'
    }
    return a(attributes, text(txt))
}

const view: View<Model> = (model) => 
    model.todos.length ? div(
        section({ 'class': 'main' },
            input({ 
                'class': 'toggle-all', 
                type: 'checkbox',
                checked: model.todos.every(t => t.completed),
                onclick: todos.toggleAll(!model.todos.every(t => t.completed))
            }),
            label({ for: 'toggle-all' }, text('Mark all as complete')),
            ul({ 'class': 'todo-list' },
                ...model.todos.filter(filterTodos(model)).map(todo => 
                    component(todoItemComponent, todo)
                )
            )
        ),
        footer({ 'class': 'footer' },
            //<!-- This should be `0 items left` by default -->
            span(
                { 'class': 'todo-count' }, 
                strong(text(model.itemsLeft)), 
                text(model.itemsLeft === 1 ? 'item left' : 'items left')
            ),
            //<!-- Remove this if you don't implement routing -->
            ul({ 'class': 'filters' },
                li(
                    filterLink('#/', 'All')
                ),
                li(
                    filterLink('#/active', 'Active')
                ),
                li(
                    filterLink('#/completed', 'Completed')
                )
            ),
            //<!-- Hidden if no completed items are left ↓ -->
            model.todos.filter(t => t.completed).length ? 
                button({ 
                    'class': 'clear-completed',
                    onclick: todos.removeCompleted
                }, text('Clear completed')) : nothing()
        )
    ) : nothing()



/**
 * Component
 */
export const todoListComponent = defineComponent({
    name: 'TodoListComponent',
    init: init,
    mount: mount,
    subscriptions: subscriptions,
    view: view
})