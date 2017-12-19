export type TodosFilter = 'all' | 'active' | 'completed'

const LOCAL_STORAGE_KEY = 'todos-myra-filter'

export const loadFilter = () =>
    (window.localStorage.getItem(LOCAL_STORAGE_KEY) || 'all') as TodosFilter

export const saveFilter = (filter: TodosFilter) =>
    window.localStorage.setItem(LOCAL_STORAGE_KEY, filter)
