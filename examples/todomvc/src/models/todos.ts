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

export const getAll = () => get()

export const add = (todo: Todo) => new Promise((resolve) => {
    const todos = get()
    const maxId = todos.length > 0 ? Math.max(...todos.map(t => t.id)) : 0
    todo.id = maxId + 1
    todos.push(todo)
    set(todos)
    resolve()
})

export const save = (todo: Todo) => {
    const todos = get()
    const existing = todos.filter(f => f.id === todo.id)[0]
    todos.splice(todos.indexOf(existing), 1, todo)
    set(todos)
}

export const remove = (todoId: number) => {
    const todos = get()
    const existing = todos.filter(f => f.id === todoId)[0]
    todos.splice(todos.indexOf(existing), 1)
    set(todos)
}

export const removeCompleted = () =>
    set(get().filter(t => !t.completed))

export const toggleAll = (completed: boolean) =>
    set(get().map(t => {
        t.completed = completed
        return t
    }))
