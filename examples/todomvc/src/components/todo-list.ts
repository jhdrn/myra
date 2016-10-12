import { defineComponent, evolve, View, Update, Task } from 'myra/core'
import { text, nothing } from 'myra/html'
import { section, footer, div, ul, li, input, label, span, strong, a, button } from 'myra/html/elements'
import { replaceLocation, LocationContext } from 'myra/location'
import { TodosFilter, saveFilter, loadFilter } from '../models/filter'
import * as todos from '../models/todos'
import { todoItemComponent } from './todo-item'

type Todo = todos.Todo


/**
 * Model
 */
type Model = {
    todos: Todo[]
    itemsLeft: number
    filter: TodosFilter
    location: LocationContext
}


/**
 * Updates
 */
const applySavedFilter = (m: Model, filter: TodosFilter): Model | [Model, Task] => 
    [m, replaceLocation(`#/${filter === 'all' ? '' : filter || ''}`)]
 
const applyFilterFromLocation = (m: Model, location: LocationContext): Model | [Model, Task] => {

    if (location.match('#/active')) {
        return [evolve(m, x => {
             x.filter = 'active'
             x.location = location
        }), saveFilter('active')]
    }
    else if (location.match('#/completed')) {
        return [evolve(m, x => { 
            x.filter = 'completed'
            x.location = location
        }), saveFilter('completed')]
    }
    else if (location.match('#/') || location.match('')) {
        return [evolve(m, x => {
            x.filter = 'all'
            x.location = location
        }), saveFilter('all')]
    }
    return evolve(m, x => x.location = location)
}

const todosLoaded = (m: Model, todos: Todo[]) => 
    evolve(m, x => {
        x.todos = todos 
        x.itemsLeft = todos.filter(t => !t.completed).length
    })

// Mount function: load all todos
const mount: Update<Model, any> = (m: Model) => [m, todos.getAll(todosLoaded)]


/**
 * Subscriptions
 */
const subscriptions = {
    'todosChanged': todosLoaded,
    '__locationChanged': applyFilterFromLocation
}

/**
 * Init model
 */
const init: [Model, Task] = [{
    todos: [],
    itemsLeft: 0,
    filter: 'all',
    location: {} as LocationContext
}, loadFilter(applySavedFilter)]

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

const filterLink = (href: string, txt: string, location: LocationContext) => {
    const attributes: any = { 
        href: href
    }
    if (location.match(href)) {
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
                    todoItemComponent(todo)
                )
            )
        ),
        footer({ 'class': 'footer' },
            //<!-- This should be `0 items left` by default -->
            span(
                { 'class': 'todo-count' }, 
                strong(text(model.itemsLeft)), 
                text(model.itemsLeft === 1 ? ' item left' : ' items left')
            ),
            ul({ 'class': 'filters' },
                li(
                    filterLink('#/', 'All', model.location)
                ),
                li(
                    filterLink('#/active', 'Active', model.location)
                ),
                li(
                    filterLink('#/completed', 'Completed', model.location)
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