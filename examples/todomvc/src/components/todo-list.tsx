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
const applySavedFilter = (state: State, filter: TodosFilter): myra.Result<State> =>
    [state, router.routeTo(`#/${filter === 'all' ? '' : filter || ''}`, undefined, true)]

const applyFilterFromLocation = (_: State, routeCtx: router.RouteContext): myra.Result<State> => {

    if (routeCtx.match('#/active').isMatch) {
        return [{
            filter: 'active',
            location: routeCtx
        }, saveFilter('active')]
    }
    else if (routeCtx.match('#/completed').isMatch) {
        return [{
            filter: 'completed',
            location: routeCtx
        }, saveFilter('completed')]
    }
    else if (routeCtx.match('#/').isMatch || routeCtx.match('').isMatch) {
        return [{
            filter: 'all',
            location: routeCtx
        }, saveFilter('all')]
    }
    return { location: routeCtx }
}

const todosLoaded = (_: State, todos: Todo[]): myra.Result<State> =>
    ({
        todos: todos,
        itemsLeft: todos.filter(t => !t.completed).length
    })

// Mount function: load all todos
const loadTodos = (state: State): myra.Result<State> =>
    [state, todos.getAll(todosLoaded)]

/**
 * Init model
 */
const init: myra.Result<State> = [
    {
        todos: [],
        itemsLeft: 0,
        filter: 'all',
        location: {} as router.RouteContext
    },
    ((apply: myra.Apply) => {
        loadFilter(applySavedFilter)(apply)
        router.addListener(applyFilterFromLocation)(apply)
    }) as myra.Effect<State>
]

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
export default myra.define<State, { forceUpdate: boolean }>({
    name: 'TodoListComponent',
    init: init,
    onMount: loadTodos,
    render: ({ state }) =>
        state.todos.length ?
            <div>
                <section class="main">
                    <input class="toggle-all"
                        type="checkbox"
                        checked={state.todos.every(t => t.completed)}
                        onclick={() => () => todos.toggleAll(!state.todos.every(t => t.completed).then(loadTodos)} />

                    <label for="toggle-all">Mark all as complete</label>
                    <ul class="todo-list">
                        {
                            state.todos.filter(filterTodos(state)).map(todo =>
                                <TodoItemComponent onchange={() => todos.getAll(todosLoaded)} todo={todo} />
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
                                onclick={() => todos.removeCompleted(loadTodos)}>
                                Clear completed
                            </button> : <nothing />
                    }
                </footer>
            </div>
            : <nothing />
})