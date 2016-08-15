import { task, Update } from 'myra/core'

export type TodosFilter = 'all' | 'active' | 'completed'

const LOCAL_STORAGE_KEY = 'todos-myra-filter'

export const loadFilter = <T>(update: Update<T, string>) => task(dispatch => 
    dispatch(update, window.localStorage.getItem(LOCAL_STORAGE_KEY)))

export const saveFilter = (filter: TodosFilter) => task(_ => 
    window.localStorage.setItem(LOCAL_STORAGE_KEY, filter))
