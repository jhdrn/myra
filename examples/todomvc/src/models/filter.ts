import { Update, Apply } from 'myra/core'

export type TodosFilter = 'all' | 'active' | 'completed'

const LOCAL_STORAGE_KEY = 'todos-myra-filter'

export const loadFilter = <T>(update: Update<T, string>) => (apply: Apply) =>
    apply(update, window.localStorage.getItem(LOCAL_STORAGE_KEY))

export const saveFilter = (filter: TodosFilter) => (_apply: Apply) =>
    window.localStorage.setItem(LOCAL_STORAGE_KEY, filter)
