import { defineComponent, evolve, NodeDescriptor } from 'myra/core'
import { updateLocation, trackLocationChanges, goBack, goForward, LocationContext } from 'myra/location'
import { nothing } from 'myra/html'
import { section, h2, p, ul, li, a } from 'myra/html/elements'
import { routeComponent } from './route-component'


/**
 * Model
 */
type Model = {
    location: LocationContext
}
const init = {}


/**
 * Subscriptions
 */
const subscriptions = {
    '__locationChanged': (m: Model, location: LocationContext) =>
        evolve(m, x => x.location = location)
}


/**
 * View
 */
const view = (m: Model) =>
    section(
        h2('Location examples'),
        m.location.matchAny<NodeDescriptor>({
            'test1': p(`Route to '/test1'.`),
            'test1/:param': (params: any) => routeComponent(params)
        }, nothing()),

        m.location.match('test1/:param') ?
            p(`Location '/test2/:param' matched.`) : nothing(),
        ul({ 'class': 'list-group' },
            li({ class: 'list-group-item' },
                a({ href: '', onclick: { listener: updateLocation('/test1'), preventDefault: true } },
                    `Update location to '/test1'`
                )
            ),
            li({ class: 'list-group-item' },
                a({ href: '', onclick: { listener: updateLocation('/test1/test2'), preventDefault: true } },
                    `Update location to '/test1/test2'`
                )
            ),
            li({ class: 'list-group-item' },
                a({ href: '', onclick: { listener: goBack(), preventDefault: true } },
                    'Go back'
                )
            ),
            li({ class: 'list-group-item' },
                a({ href: '', onclick: { listener: goForward(), preventDefault: true } },
                    'Go forward'
                )
            )
        )
    )


/**
 * Component
 */
export const locationComponent = defineComponent({
    // The name of the component. Used for debugging purposes.
    name: 'LocationComponent',

    // Init takes either an initial model or a tuple of an initial model 
    // and one or more tasks to execute when the component is initialized.
    init: evolve(init, trackLocationChanges()),

    subscriptions: subscriptions,

    // The view function is called after update. 
    view: view
})