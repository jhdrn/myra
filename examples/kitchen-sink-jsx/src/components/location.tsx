import { defineComponent, Task } from 'myra/core'
import { updateLocation, matchLocation, trackLocationChanges, goBack, goForward, LocationData } from 'myra/location'
import * as jsxFactory from 'myra/html/jsxFactory'

type Model = undefined
const init = [undefined, trackLocationChanges()] as [Model, Task]

const subscriptions = {
    '__locationChanged': (m: Model, _locationData: LocationData) => m
}

/**
 * View
 */
const view = (_: Model) => 
    <section>
        <h2>Location example</h2>
        { matchLocation('test1') ? 
            <p>Location '/test1' matched.</p> : <nothing /> }
        { matchLocation('test1/:param') ? 
            <p>Location '/test2/:param' matched.</p> : <nothing /> }
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
 * component
 */
export const locationComponent = defineComponent({
    // The name of the component. Used for debugging purposes.
    name: 'LocationComponent',

    // Init takes either an initial model or a tuple of an initial model 
    // and one or more tasks to execute when the component is initialized.
    init: init,

    subscriptions: subscriptions,

    // The view function is called after update. 
    view: view
})