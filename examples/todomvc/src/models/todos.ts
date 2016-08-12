import { task, broadcast, Update, Dispatch } from 'myra/core'

export type Todo = {
    id: number
    completed: boolean
    title: string
}

const LOCAL_STORAGE_KEY = 'todos-xxx'
const get = () => (JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY)) || []) as Todo[]
const set = (todos: Todo[], dispatch: Dispatch) => {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos))
    broadcast('todosChanged', todos).execute(dispatch)
} 

export const getAll = <M>(todosLoaded: Update<M, Todo[]> ) => task((dispatch: Dispatch) => {
    dispatch(todosLoaded, get())
})

export const add = (todo: Todo) => task((dispatch) => {
    const todos = get()
    const maxId = todos.map(t => t.id).sort().pop() || 0
    todo.id = maxId + 1
    todos.push(todo)
    set(todos, dispatch)
})

export const save = (todo: Todo) => task(dispatch => {
    const todos = get()
    const existing = todos.filter(f => f.id === todo.id)[0]
    todos.splice(todos.indexOf(existing), 1, todo)
    set(todos, dispatch)
})

export const remove = (todoId: number) => task(dispatch => {
    const todos = get()
    const existing = todos.filter(f => f.id === todoId)[0]
    todos.splice(todos.indexOf(existing), 1)
    set(todos, dispatch)
})

export const removeCompleted = task(dispatch => {
    set(get().filter(t => !t.completed), dispatch)
})

export const toggleAll = (completed: boolean) => task(dispatch => {
    set(get().map(t => { 
        t.completed = completed
        return t
    }), dispatch)
})