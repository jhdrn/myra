import { defineComponent, evolve, View } from 'myra/core'
import { main, footer, div, text, component, nothing } from 'myra/html'
import { trackLocationChanges, matchLocation } from 'myra/location'
import { headerComponent } from './header'
import { bookSearchComponent } from './book-search'
import { bookDetailsComponent } from './book-details'
import { favouritesListComponent } from './favourites-list'

/**
 * Model
 */
type Model = { 
    selectedBookId?: string
}
const init = [{}, trackLocationChanges()]


/**
 * Subscriptions
 */
const subscriptions = {
    'bookSelected@BookSearchComponent': (m: Model, bookId: string) => 
        evolve(m, x => x.selectedBookId = bookId),
    '__locationChanged': (m: Model) => 
        m
}


/**
 * View
 */
const view: View<Model> = (model: Model) => 
    div({ 'class': 'mdl-layout__container has-scrolling-header' },
        div({ 'class': 'mdl-layout mdl-layout--fixed-header' },
            component(headerComponent),
            main({ 'class': 'mdl-layout__content' },
                matchLocation('books') ?
                    div({ 'class': 'books mdl-grid'},
                        div({ 'class': 'mdl-cell mdl-cell--4-col'},
                            component(bookSearchComponent),
                        ),
                        div({ 'class': 'mdl-cell mdl-cell--8-col' },
                            // If there is a selectedBookId, mount the bookDetailsComponent
                            // passing the selectedBookId as argument
                            model.selectedBookId ? 
                                component(bookDetailsComponent, model.selectedBookId) : nothing()
                        )
                    ) : nothing(),
                matchLocation('favourites') ? 
                    div({ 'class': 'favourites mdl-grid' },
                        component(favouritesListComponent, undefined, true)
                    ) : nothing()
            ),
            footer(text('Footer'))
        )
    )


/**
 * component
 */
export const mainComponent = defineComponent({
    // The name of the component. Used for debugging purposes.
    name: 'KitchenSinkApp',

    // Init takes either an initial model or a tuple of an initial model 
    // and one or more tasks to execute when the component is initialized.
    init: init,

    subscriptions: subscriptions,

    // The view function is called after update. 
    view: view
})