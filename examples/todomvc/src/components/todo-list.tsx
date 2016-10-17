import { defineComponent, evolve } from 'myra/core'
import * as jsxFactory from 'myra/html/jsxFactory'
import { replaceLocation, LocationContext } from 'myra/location'
import { TodosFilter, saveFilter, loadFilter } from '../models/filter'
import * as todos from '../models/todos'
import { TodoItemComponent } from './todo-item'

type Todo = todos.Todo


/**
 * State
 */
type State = {
    todos: Todo[]
    itemsLeft: number
    filter: TodosFilter
    location: LocationContext
}


/**
 * Updates
 */
const applySavedFilter = (state: State, filter: TodosFilter) =>
    evolve(state).and(replaceLocation(`#/${filter === 'all' ? '' : filter || ''}`))

const applyFilterFromLocation = (state: State, location: LocationContext) => {

    if (location.match('#/active')) {
        return evolve(state, x => {
            x.filter = 'active'
            x.location = location
        }).and(saveFilter('active'))
    }
    else if (location.match('#/completed')) {
        return evolve(state, x => {
            x.filter = 'completed'
            x.location = location
        }).and(saveFilter('completed'))
    }
    else if (location.match('#/') || location.match('')) {
        return evolve(state, x => {
            x.filter = 'all'
            x.location = location
        }).and(saveFilter('all'))
    }
    return evolve(state, x => x.location = location)
}

const todosLoaded = (state: State, todos: Todo[]) =>
    evolve(state, x => {
        x.todos = todos
        x.itemsLeft = todos.filter(t => !t.completed).length
    })

// Mount function: load all todos
const mount = (m: State) => evolve(m).and(todos.getAll(todosLoaded))


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
const init = {
    state: {
        todos: [],
        itemsLeft: 0,
        filter: 'all',
        location: {} as LocationContext
    } as State,
    tasks: [loadFilter(applySavedFilter)]
}

/**
 * View
 */
const filterTodos = (state: State) => (todo: Todo) => {
    switch (state.filter) {
        case 'active':
            return !todo.completed
        case 'completed':
            return todo.completed
    }
    return true
}

const filterLink = (href: string, txt: string, location: LocationContext) =>
    location.match(href) ? <a href={href} class="selected">{txt}</a>
        : <a href={href}>{txt}</a>

const view = (state: State) =>
    state.todos.length ?
        <div>
            <section class="main">
                <input class="toggle-all"
                    type="checkbox"
                    checked={state.todos.every(t => t.completed)}
                    onclick={todos.toggleAll(!state.todos.every(t => t.completed))} />

                <label for="toggle-all">Mark all as complete</label>
                <ul class="todo-list">
                    {
                        state.todos.filter(filterTodos(state)).map(todo =>
                            <TodoItemComponent { ...todo } />
                        )
                    }
                </ul>
            </section>
            <footer class="footer">
                <span class="todo-count">
                    <strong>{state.itemsLeft}</strong>
                    {state.itemsLeft === 1 ? ' item left' : ' items left'}
                </span>
                <ul class="filters">
                    <li>
                        {filterLink('#/', 'All', state.location)}
                    </li>
                    <li>
                        {filterLink('#/active', 'Active', state.location)}
                    </li>
                    <li>
                        {filterLink('#/completed', 'Completed', state.location)}
                    </li>
                </ul>
                {
                    state.todos.filter(t => t.completed).length ?
                        <button class="clear-completed"
                            onclick={todos.removeCompleted}>
                            Clear completed
                        </button> : <nothing />
                }
            </footer>
        </div>
        : <nothing />



/**
 * Component
 */
export const TodoListComponent = defineComponent({
    name: 'TodoListComponent',
    init: init,
    onMount: mount,
    subscriptions: subscriptions,
    view: view
})