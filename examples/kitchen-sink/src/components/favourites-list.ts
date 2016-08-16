import { defineComponent, evolve, Update } from 'myra/core';
import { text, nothing } from 'myra/html';
import { section, div, h2, ul, li, img, a, span } from 'myra/html/elements'
import { Book } from '../models/books'
import { getFavourites } from '../models/favourites';

type Model = {
    favourites?: Book[]
    isLoading: boolean
}

const favouritesLoaded: Update<Model, any> = (m: Model, favourites: any) => 
    evolve(m, x => {
        x.favourites = favourites
        x.isLoading = false
    })

export const favouritesListComponent = defineComponent<Model, undefined>({
    name: 'FavouritesListComponent',
    init: {
        isLoading: true
    },
    mount: (model: Model) => [model, getFavourites(favouritesLoaded)],
    view: (model) =>
        section({ 'class': 'section--center mdl-grid mdl-grid--no-spacing mdl-shadow--2dp' },
            div({ 'class': 'mdl-card mdl-cell mdl-cell--12-col' },
                div({ 'class': 'mdl-card__title' },
                    h2({ 'class': 'mdl-card__title-text'}, text('Favourites'))
                ),
                div({ 'class': 'mdl-card__supporting-text mdl-grid mdl-grid--no-spacing'}, 
                    !model.favourites ? nothing() : ul({ 'class': 'mdl-list' },
                        ...model.favourites.map(b => 
                            li({ 'class': 'mdl-list__item mdl-list__item--two-line' },
                                a(
                                    { 
                                        'href': '#', 
                                        'class': 'mdl-list__item-primary-content',
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
})