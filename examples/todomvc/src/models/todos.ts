import { Update, Apply } from 'myra'

export type Todo = {
    id: number
    completed: boolean
    title: string
}

const LOCAL_STORAGE_KEY = 'todos-myra'
const get = () => (JSON.parse(window.localStorage.getItem(LOCAL_STORAGE_KEY) || '[]') || []) as Todo[]
const set = (todos: Todo[]) => {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(todos))
}

export const getAll = <M>(todosLoaded: Update<M, Todo[]>) => (apply: Apply) => {
    apply(todosLoaded, get())
}

export const add = (todo: Todo) => (_apply: Apply) => {
    const todos = get()
    const maxId = todos.map(t => t.id).sort().pop() || 0
    todo.id = maxId + 1
    todos.push(todo)
    set(todos)
}

export const save = (todo: Todo) => (_apply: Apply) => {
    const todos = get()
    const existing = todos.filter(f => f.id === todo.id)[0]
    todos.splice(todos.indexOf(existing), 1, todo)
    set(todos)
}

export const remove = (todoId: number) => (_apply: Apply) => {
    const todos = get()
    const existing = todos.filter(f => f.id === todoId)[0]
    todos.splice(todos.indexOf(existing), 1)
    set(todos)
}

export const removeCompleted = (_apply: Apply) => {
    set(get().filter(t => !t.completed))
}

export const toggleAll = (completed: boolean) => (_apply: Apply) => {
    set(get().map(t => {
        t.completed = completed
        return t
    }))
}