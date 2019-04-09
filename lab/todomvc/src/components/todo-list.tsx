import * as myra from '../../../../src/myra'
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
const init: State = {
    todos: [],
    itemsLeft: 0,
    filter: 'all',
    location: {} as router.RouteContext
}

/**
 * View helper functions
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
export default myra.useContext((_props, ctx) => {
    const [state, evolve] = ctx.useState(init)

    const todosLoaded = (todos: Todo[]) =>
        evolve({
            todos: todos,
            itemsLeft: todos.filter(t => !t.completed).length
        })

    const applyFilterFromLocation = (routeCtx: router.RouteContext) => {

        if (routeCtx.match('#/active').isMatch) {
            evolve({
                filter: 'active',
                location: routeCtx
            })
            saveFilter('active')
        }
        else if (routeCtx.match('#/completed').isMatch) {
            evolve({
                filter: 'completed',
                location: routeCtx
            })
            saveFilter('completed')
        }
        else if (routeCtx.match('#/').isMatch || routeCtx.match('').isMatch) {
            evolve({
                filter: 'all',
                location: routeCtx
            })
            saveFilter('all')
        }
        evolve({ location: routeCtx })
    }

    const loadTodos = () =>
        todosLoaded(todos.getAll())

    const clearCompleted = () => {
        todos.removeCompleted()
        loadTodos()
    }
    const toggleAllTodos = () => {
        todos.toggleAll(!state.todos.every(t => t.completed))
        loadTodos()
    }

    ctx.useLifecycle(ev => {
        if (ev === 'didMount') {
            evolve({ filter: loadFilter() })
            router.addListener(applyFilterFromLocation)
            loadTodos()
        }
        else if (ev === 'willRender') {
            loadTodos()
        }
    })

    return (
        state.todos.length ?
            <div>
                <section class="main">
                    <input class="toggle-all"
                        type="checkbox"
                        checked={state.todos.every(t => t.completed)}
                        onclick={toggleAllTodos} />

                    <label for="toggle-all">Mark all as complete</label>
                    <ul class="todo-list">
                        {state.todos.filter(filterTodos(state)).map(todo =>
                            <TodoItemComponent onchange={loadTodos} todo={todo} key={todo.id.toString()} />
                        )}
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
                                onclick={clearCompleted}>
                                Clear completed
                            </button> : <nothing />
                    }
                </footer>
            </div>
            : <nothing />
    )
})