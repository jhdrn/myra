import { defineComponent } from 'myra/core'
import { text } from 'myra/html'
import { header, nav, div, a, span } from 'myra/html/elements'
import { updateLocation } from 'myra/location'

const navLink = (path: string, title: string) => {
    return a({ 
                'class': 'mdl-navigation__link', 
                href: `/${path}`, 
                onclick: { listener: updateLocation(path), preventDefault: true }
            }, 
            text(title)
        )
}

export const headerComponent = defineComponent({
    name: 'HeaderComponent',
    init: undefined,
    view: (_) =>
        header({ 'class': 'mdl-layout__header mdl-layout__header--scroll mdl-color--primary' },
            div({ 'class': 'mdl-layout__header-row'},
                span({ 'class': 'mdl-layout-title' }, text('Kitchen sink demo')),
                div({ 'class': 'mdl-layout-spacer' }),
                nav({ 'class': 'mdl-navigation mdl-layout--large-screen-only' },
                    navLink('books', 'Books'),
                    navLink('favourites', 'Favourites')
                )
            )
        )
})