import { task, Dispatch, Update } from 'myra/core'
import { Book } from './books'

export const getFavourites = <M>(favouritesLoaded: Update<M, Book[]>) => 
    task((dispatch: Dispatch) => {
        dispatch(favouritesLoaded, JSON.parse(window.localStorage.getItem('favourites')) || [])
    })

export const addFavourite = (book: Book) => task((_) => {
    const favourites = (JSON.parse(window.localStorage.getItem('favourites')) || []) as Book[]
    favourites.push(book)
    window.localStorage.setItem('favourites', JSON.stringify(favourites))
})

export const removeFavourite = (bookId: string) => task((_) => {
    const favourites = (JSON.parse(window.localStorage.getItem('favourites')) || []) as Book[]
    const existing = favourites.filter(f => f.id === bookId)[0]
    favourites.splice(favourites.indexOf(existing), 1)
    window.localStorage.setItem('favourites', JSON.stringify(favourites))
})