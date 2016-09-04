import { defineComponent, evolve, View, Update, Task } from 'myra/core'
import * as jsxFactory from 'myra/html/jsxFactory'
import { matchLocation, replaceLocation } from 'myra/location'
import { TodosFilter, saveFilter, loadFilter } from '../models/filter'
import * as todos from '../models/todos'
import { TodoItemComponent } from './todo-item'

type Todo = todos.Todo


/**
 * Model
 */
type Model = {
    todos: Todo[]
    itemsLeft: number
    filter: TodosFilter
}


/**
 * Updates
 */
const applySavedFilter = (m: Model, filter: TodosFilter): Model | [Model, Task] => 
    [m, replaceLocation(`#/${filter === 'all' ? '' : filter || ''}`)]
 
const applyFilterFromLocation = (m: Model): Model | [Model, Task] => {

    if (matchLocation('#/active')) {
        return [evolve(m, x => x.filter = 'active'), saveFilter('active')]
    }
    else if (matchLocation('#/completed')) {
        return [evolve(m, x => x.filter = 'completed'), saveFilter('completed')]
    }
    else if (matchLocation('#/', '')) {
        return [evolve(m, x => x.filter = 'all'), saveFilter('all')]
    }
    return m
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
    filter: 'all'
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

const filterLink = (href: string, txt: string) => 
    matchLocation(href) ? <a href={ href } class="selected">{ txt }</a>
                        : <a href={ href }>{ txt }</a>

const view: View<Model> = (model) => 
    model.todos.length ? 
        <div>
            <section class="main">
                <input class="toggle-all"
                       type="checkbox"
                       checked={ model.todos.every(t => t.completed) }
                       onclick={ todos.toggleAll(!model.todos.every(t => t.completed)) } />
                       
                <label for="toggle-all">Mark all as complete</label>
                <ul class="todo-list">
                    { 
                        model.todos.filter(filterTodos(model)).map(todo => 
                            <TodoItemComponent { ...todo } />
                        ) 
                    }
                </ul>
            </section>
            <footer class="footer">
                <span class="todo-count"> 
                    <strong>{ model.itemsLeft }</strong> 
                    { model.itemsLeft === 1 ? 'item left' : 'items left' }
                </span>
                <ul class="filters">
                    <li>
                        { filterLink('#/', 'All') }
                    </li>
                    <li>
                        { filterLink('#/active', 'Active') }
                    </li>
                    <li>
                        { filterLink('#/completed', 'Completed') }
                    </li>
                </ul>
                { 
                    model.todos.filter(t => t.completed).length ? 
                        <button class="clear-completed"
                                onclick={ todos.removeCompleted }>
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
    mount: mount,
    subscriptions: subscriptions,
    view: view
})