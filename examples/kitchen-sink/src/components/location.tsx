import { defineComponent, evolve } from 'myra/core'
import { updateLocation, trackLocationChanges, goBack, goForward, LocationContext } from 'myra/location'
import * as jsxFactory from 'myra/core/jsxFactory'
import { RouteComponent } from './route-component'


/**
 * State
 */
type State = {
    location: LocationContext
}
const init = {} as State


/**
 * Subscriptions
 */
const subscriptions = {
    '__locationChanged': (state: State, location: LocationContext) =>
        evolve(state, x => x.location = location)
}

/**
 * Component
 */
export const LocationComponent = defineComponent({
    // The name of the component. Used for debugging purposes.
    name: 'LocationComponent',

    // Init takes either an initial model or a tuple of an initial model 
    // and one or more tasks to execute when the component is initialized.
    init: {
        state: init,
        effects: [trackLocationChanges()]
    },

    subscriptions: subscriptions,

    // The view function is called after update. 
    view: ctx =>
        <section>
            <h2>Location examples</h2>

            {ctx.state.location.matchAny({
                'test1': <p>Route to '/test1'.</p>,
                'test1/:param': (params: any) => <RouteComponent {...params} />
            }, <nothing />)}

            {ctx.state.location.match('test1/:param') ?
                <p>Location '/test2/:param' matched.</p> : <nothing />}

            <ul class="list-group">
                <li class="list-group-item">
                    <a href="" onclick={() => ctx.invoke(updateLocation('/test1'))}>
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
})