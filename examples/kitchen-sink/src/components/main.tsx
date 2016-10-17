import { defineComponent } from 'myra/core'
import * as jsxFactory from 'myra/html/jsxFactory'
import { CounterComponent } from './counter'
import { FormComponent } from './form'
import { HttpComponent } from './http'
import { TimeComponent } from './time'
import { LocationComponent } from './location'


/**
 * View
 */
const view = () =>
    <div class="container">
        <h1>Kitchen sink demo</h1>
        <hr />
        <CounterComponent />
        <hr />
        <FormComponent />
        <hr />
        <HttpComponent />
        <hr />
        <TimeComponent />
        <hr />
        <LocationComponent />
    </div>


/**
 * Component
 */
export const mainComponent = defineComponent({
    // The name of the component. Used for debugging purposes.
    name: 'KitchenSinkApp',

    // Init takes either an initial model or a tuple of an initial model 
    // and one or more tasks to execute when the component is initialized.
    init: { state: undefined },

    // The view function is called after update. 
    view: view
})