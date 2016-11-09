import { Update, Dispatch } from 'myra/core'

export type TodosFilter = 'all' | 'active' | 'completed'

const LOCAL_STORAGE_KEY = 'todos-myra-filter'

export const loadFilter = <T>(update: Update<T, string>) => (dispatch: Dispatch) => 
    dispatch(update, window.localStorage.getItem(LOCAL_STORAGE_KEY))

export const saveFilter = (filter: TodosFilter) => (_dispatch: Dispatch) =>
    window.localStorage.setItem(LOCAL_STORAGE_KEY, filter)
