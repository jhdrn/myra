import { defineComponent, evolve, Task } from 'myra/core'
import { updateLocation, trackLocationChanges, goBack, goForward, LocationContext } from 'myra/location'
import * as jsxFactory from 'myra/html/jsxFactory'
import { RouteComponent } from './route-component'


/**
 * State
 */
type State = {
    location: LocationContext
}
const init = evolve({}).and(trackLocationChanges())


/**
 * Subscriptions
 */
const subscriptions = {
    '__locationChanged': (state: State, location: LocationContext) =>
        evolve(state, x => x.location = location)
}

/**
 * Returns a function that receives the event, calls preventDefault() and 
 * passes the update argument trough.
 */
const preventDefaultAnd = (task: Task) => (ev: Event) => {
    ev.preventDefault()
    return task;
}

/**
 * View
 */
const view = (state: State) =>
    <section>
        <h2>Location examples</h2>

        {state.location.matchAny({
            'test1': <p>Route to '/test1'.</p>,
            'test1/:param': (params: any) => <RouteComponent {...params} />
        }, <nothing />)}

        {state.location.match('test1/:param') ?
            <p>Location '/test2/:param' matched.</p> : <nothing />}

        <ul class="list-group">
            <li class="list-group-item">
                <a href="" onclick={preventDefaultAnd(updateLocation('/test1'))}>
                    Update location to '/test1'
                </a>
            </li>
            <li class="list-group-item">
                <a href="" onclick={preventDefaultAnd(updateLocation('/test1/test2'))}>
                    Update location to '/test1/test2'
                </a>
            </li>
            <li class="list-group-item">
                <a href="" onclick={preventDefaultAnd(goBack())}>
                    Go back
                </a>
            </li>
            <li class="list-group-item">
                <a href="" onclick={preventDefaultAnd(goForward())}>
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