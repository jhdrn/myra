import { defineComponent, evolve, View, Update } from 'myra/core'
import { text } from 'myra/html'
import { section, div, h2, dl, dt, dd, img, button } from 'myra/html/elements'
import { Book, findBook } from '../models/books'
import { addFavourite, removeFavourite } from '../models/favourites'

/**
 * Model
 */
type Model = {
    isLoading: boolean
    bookDetails?: Book
}
const init: Model = { 
    isLoading: false
}

/**
 * Updates
 */
const bookFound = (model: Model, bookDetails: Book) => 
    evolve(model, x => { 
        x.isLoading = false 
        x.bookDetails = bookDetails
    })
const mount: Update<Model, string> = (model, id) => 
    [evolve(model, x => { x.isLoading = true }), findBook(id!, bookFound)]

/**
 * View
 */
const view: View<Model> = (model: Model) => 
    section({ 'class': 'book-details mdl-card mdl-shadow--2dp' },
        ...model.isLoading || !model.bookDetails ? [div({ 'class': 'mdl-card__supporting-text'}, text('Loading book details...'))] :
            [
                div({ 'class': 'mdl-card__title' },
                    img({ src: model.bookDetails!.imageLinks.thumbnail, alt: 'Book image' }),
                    h2({ 'class': 'mdl-card__title-text'}, 
                        text(model.bookDetails!.title)
                    )
                ),
                div({ 'class': 'mdl-card__supporting-text'}, 
                    dl(
                        dt(text('Description')),
                        dd(text(model.bookDetails!.description)),
                        dt(text('Author(s)')),
                        dd(text(model.bookDetails!.authors.join(', '))),
                        dt(text('Published')),
                        dd(text(model.bookDetails!.publishedDate)),
                        dt(text('Publisher')),
                        dd(text(model.bookDetails!.publisher))
                    )
                ),
                div({ 'class': 'mdl-card__actions mdl-card--border'}, 
                    button(
                        { 
                            'class': 'mdl-button mdl-button--colored',
                            onclick: addFavourite(model.bookDetails) 
                        },
                        text('Add to favourites')
                    ),
                    button(
                        { 
                            'class': 'mdl-button mdl-button--colored',
                            onclick: removeFavourite(model.bookDetails.id)
                        },
                        text('Remove from favourites')
                    )
                )
            ]
    )

export const bookDetailsComponent = defineComponent<Model, string>({
    name: 'BookDetailsComponent',
    init: init,
    mount: mount,
    view: view
});