import { defineComponent, evolve, NodeDescriptor } from 'myra/core'
import { updateLocation, trackLocationChanges, goBack, goForward, LocationContext } from 'myra/location'
import * as jsxFactory from 'myra/html/jsxFactory'
import { RouteComponent } from './route-component'


/**
 * Model
 */
type Model = {
    location: LocationContext
}
const init = evolve({}, trackLocationChanges())


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
    <section>
        <h2>Location examples</h2>

        {m.location.matchAny<NodeDescriptor>({
            'test1': <p>Route to '/test1'.</p>,
            'test1/:param': (params: any) => <RouteComponent {...params} />
        }, <nothing />)}

        {m.location.match('test1/:param') ?
            <p>Location '/test2/:param' matched.</p> : <nothing />}

        <ul class="list-group">
            <li class="list-group-item">
                <a href="" onclick={{ listener: updateLocation('/test1'), preventDefault: true }}>
                    Update location to '/test1'
                </a>
            </li>
            <li class="list-group-item">
                <a href="" onclick={{ listener: updateLocation('/test1/test2'), preventDefault: true }}>
                    Update location to '/test1/test2'
                </a>
            </li>
            <li class="list-group-item">
                <a href="" onclick={{ listener: goBack(), preventDefault: true }}>
                    Go back
                </a>
            </li>
            <li class="list-group-item">
                <a href="" onclick={{ listener: goForward(), preventDefault: true }}>
                    Go forward
                </a>
            </li>
        </ul>
    </section>


/**
 * Component
 */
export const LocationComponent = defineComponent({
    // The name of the component. Used for debugging purposes.
    name: 'LocationComponent',

    // Init takes either an initial model or a tuple of an initial model 
    // and one or more tasks to execute when the component is initialized.
    init: init,

    subscriptions: subscriptions,

    // The view function is called after update. 
    view: view
})