import { defineComponent, evolve, broadcast, Update, View } from 'myra/core';
import { section, div, h2, ul, li, img, a, span, label, input, text, nothing } from 'myra/html';
import { delay, cancelDelay } from 'myra/time'
import { updateLocation, LocationData } from 'myra/location'
import { Book, findBooks  } from '../models/books';

/**
 * Model
 */
type Model = {
    query?: string
    matches?: Book[]
    isQuerying: boolean
    debounceHandle?: number
}
const init: Model = {
    isQuerying: false
}

/**
 * Updates
 */

// When the user selected a book, notify the parent component of it.
// notifyParent will create a message that is dispatched in the parent component.
const bookSelected = (id: string) => (m: Model) => 
    [m, broadcast('bookSelected@BookSearchComponent', id)]

const delayStarted = (m: Model, handle: number) => 
    evolve(m, x => { x.debounceHandle = handle })

// Update the model when we've got the response message from the "findBooks" task above.
const booksFound: Update<Model, Book[]> = (model: Model, books: Book[]) => [
    evolve(model, x => {
        x.matches = books
        x.isQuerying = false
    }),
    updateLocation('books', { query: model.query })
]

const delayEnded: Update<Model, undefined> = (m: Model) => {

    if (m.query) {
        return [
            evolve(m, x => {
                x.debounceHandle = undefined,
                // Set a flag to indicate that we're querying for books
                x.isQuerying = true
            }), 
            
            // Also return a task that finds books 
            findBooks(m.query!, booksFound)
        ]
    }
    else {
        // If the query is empty, clear matches
        return evolve(m, x => {
            x.debounceHandle = undefined,
            x.matches = []
        })
    }
}

const updateQuery: Update<Model, string> = (m: Model, value: string) => {
     // The 'doQuery' message is sent when the 'oninput' event is triggered by the search field.

    // TODO: explain data.value
    const newModel = evolve(m, x => { x.query = value })
    // If there is a debounceHandle, a delay has already been set
    if (m.debounceHandle) {
        // Restart the delay if the user keeps typing
        return [newModel, [cancelDelay(m.debounceHandle), delay(300, delayStarted, delayEnded)]]
    }
    else if (!m.isQuerying) { 
        return [newModel, delay(300, delayStarted, delayEnded)]
    }
    return m
}

/**
 * Subscriptions
 */
const subscriptions = {
    '__locationChanged': (model: Model, data: LocationData) => 
        evolve(model, x => {
            x.query = data.params['query']
        })
}


/**
 * View
 */
const view: View<Model> = (model) =>
    section({ 'class': 'section--center mdl-grid mdl-grid--no-spacing mdl-shadow--2dp' },
        div({ 'class': 'mdl-card mdl-cell mdl-cell--12-col' },
            div({ 'class': 'mdl-card__title' },
                h2({ 'class': 'mdl-card__title-text'}, text('Search books'))
            ),
            div({ 'class': 'mdl-card__supporting-text mdl-grid mdl-grid--no-spacing'}, 
                div({ 'class': 'mdl-textfield mdl-js-textfield' },
                    label({ 'for': 'query', 'class': 'mdl-textfield__label' }, text('Search for a book')),
                    input({
                        type: 'text',
                        name: 'query',
                        id: 'query',
                        'class': 'mdl-textfield__input',
                        oninput: updateQuery
                    })
                ),
                !model.matches ? nothing() : ul({ 'class': 'mdl-list' },
                    ...model.matches.map(b => 
                        li({ 'class': 'mdl-list__item mdl-list__item--two-line' },
                            a(
                                { 
                                    'href': '#', 
                                    'class': 'mdl-list__item-primary-content',
                                    onclick: { update: bookSelected(b.id), preventDefault: true } 
                                }, 
                                !!b.imageLinks ? img({ 'class': 'mdl-list__item-avatar', src: b.imageLinks.smallThumbnail, alt: 'Book thumbnail' }) : span({ 'class': 'mdl-list__item-avatar' }),
                                span(text(b.title)),
                                span({ 'class': 'mdl-list__item-sub-title'}, text(b.subtitle))
                            )
                        )
                    )
                )
            )
        )
    )


/**
 * Component
 */
export const bookSearchComponent = defineComponent<Model, undefined>({
    name: 'BookSearchComponent',
    init: init,
    subscriptions: subscriptions,
    view: view
})