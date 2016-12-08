import * as myra from 'myra'
import * as router from 'myra-router'
import { TodosFilter, saveFilter, loadFilter } from '../models/filter'
import * as todos from '../models/todos'
import TodoItemComponent from './todo-item'

type Todo = todos.Todo


/**
 * State
 */
type State = {
    todos: Todo[]
    itemsLeft: number
    filter: TodosFilter
    location: router.RouteContext
}


/**
 * Updates
 */
const applySavedFilter = (state: State, filter: TodosFilter) =>
    myra.evolve(state).and(router.routeTo(`#/${filter === 'all' ? '' : filter || ''}`, undefined, true))

const applyFilterFromLocation = (state: State, routeCtx: router.RouteContext) => {

    if (routeCtx.match('#/active')) {
        return myra.evolve(state, x => {
            x.filter = 'active'
            x.location = routeCtx
        }).and(saveFilter('active'))
    }
    else if (routeCtx.match('#/completed')) {
        return myra.evolve(state, x => {
            x.filter = 'completed'
            x.location = routeCtx
        }).and(saveFilter('completed'))
    }
    else if (routeCtx.match('#/') || routeCtx.match('')) {
        return myra.evolve(state, x => {
            x.filter = 'all'
            x.location = routeCtx
        }).and(saveFilter('all'))
    }
    return myra.evolve(state, x => x.location = routeCtx)
}

const todosLoaded = (state: State, todos: Todo[]) =>
    myra.evolve(state, x => {
        x.todos = todos
        x.itemsLeft = todos.filter(t => !t.completed).length
    })

// Mount function: load all todos
const mount = (m: State) =>
    myra.evolve(m).and(todos.getAll(todosLoaded))


/**
 * Subscriptions
 */
const subscriptions = {
    'todosChanged': todosLoaded
}

/**
 * Init model
 */
const init = {
    state: {
        todos: [],
        itemsLeft: 0,
        filter: 'all',
        location: {} as router.RouteContext
    } as State,
    effects: [
        loadFilter(applySavedFilter),
        router.addListener(applyFilterFromLocation)
    ]
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

const filterLink = (href: string, txt: string, routeCtx: router.RouteContext) =>
    routeCtx.match(href) ? <a href={href} class="selected">{txt}</a>
        : <a href={href}>{txt}</a>


/**
 * Component
 */
export default myra.defineComponent<State, any>({
    name: 'TodoListComponent',
    init: init,
    onMount: mount,
    subscriptions: subscriptions,
    view: ctx =>
        ctx.state.todos.length ?
            <div>
                <section class="main">
                    <input class="toggle-all"
                        type="checkbox"
                        checked={ctx.state.todos.every(t => t.completed)}
                        onclick={() => ctx.invoke(todos.toggleAll(!ctx.state.todos.every(t => t.completed)))} />

                    <label for="toggle-all">Mark all as complete</label>
                    <ul class="todo-list">
                        {
                            ctx.state.todos.filter(filterTodos(ctx.state)).map(todo =>
                                <TodoItemComponent { ...todo } />
                            )
                        }
                    </ul>
                </section>
                <footer class="footer">
                    <span class="todo-count">
                        <strong>{ctx.state.itemsLeft}</strong>
                        {ctx.state.itemsLeft === 1 ? ' item left' : ' items left'}
                    </span>
                    <ul class="filters">
                        <li>
                            {filterLink('#/', 'All', ctx.state.location)}
                        </li>
                        <li>
                            {filterLink('#/active', 'Active', ctx.state.location)}
                        </li>
                        <li>
                            {filterLink('#/completed', 'Completed', ctx.state.location)}
                        </li>
                    </ul>
                    {
                        ctx.state.todos.filter(t => t.completed).length ?
                            <button class="clear-completed"
                                onclick={() => ctx.invoke(todos.removeCompleted)}>
                                Clear completed
                            </button> : <nothing />
                    }
                </footer>
            </div>
            : <nothing />
})