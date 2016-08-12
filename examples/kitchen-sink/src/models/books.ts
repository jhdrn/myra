import { Update } from 'myra/core'
import { httpGet, HttpResponse } from 'myra/http'

export type Book = {
    id: string
    title: string
    subtitle: string
    authors: string[]
    publisher: string
    publishedDate: string
    description: string
    pageCount: number
    averageRating: number
    imageLinks: { 
        smallThumbnail: string
        thumbnail: string
    }
    previewLink: string
}

const toBook = (i: any): Book => ({
    id: i.id,
    title: i.volumeInfo.title,
    subtitle: i.volumeInfo.subtitle,
    authors: i.volumeInfo.authors,
    publisher: i.volumeInfo.publisher,
    publishedDate: i.volumeInfo.publishedDate,
    description: i.volumeInfo.description,
    pageCount: i.volumeInfo.pageCount,
    averageRating: i.volumeInfo.averageRating,
    imageLinks: i.volumeInfo.imageLinks,
    previewLink: i.volumeInfo.previewLink
})

export const findBook = <M>(id: string, bookFound: Update<M, Book>) => {
    const url = `https://www.googleapis.com/books/v1/volumes?q=id:${id}`
    return httpGet((model: M, response: HttpResponse) => {
        if (response.status === 200 && response.data.items.length) {
            return bookFound(model, response.data.items.map(toBook)[0])
        }
        else {
            // TODO: send failure message
        }
        return model
    }, (m) => m, url, undefined, 'json')
}

export const findBooks = <M>(query: string, booksFound: Update<M, Book[]>) => {
    const url = `https://www.googleapis.com/books/v1/volumes?q=${query}&maxResults=20`
    return httpGet((model: M, response: HttpResponse) => {
        if (response.status === 200) {
            return booksFound(model, response.data.items.map(toBook))
        }
        else {
            // TODO: send failure message
        }
        return model
    }, (m: M) => m, url, undefined, 'json')
}