import { defineComponent } from 'myra/core'
import { div, h1, hr } from 'myra/html/elements'
import { counterComponent } from './counter'
import { formComponent } from './form'
import { httpComponent } from './http'
import { timeComponent } from './time'
import { locationComponent } from './location'


/**
 * View
 */
const view = () => 
    div({ 'class': 'container' },
        h1('Kitchen sink demo'),
        hr(),
        counterComponent(),
        hr(),
        formComponent(),
        hr(),
        httpComponent(),
        hr(),
        timeComponent(),
        hr(),
        locationComponent()
    )


/**
 * Component
 */
export const mainComponent = defineComponent({
    // The name of the component. Used for debugging purposes.
    name: 'KitchenSinkApp',

    // Init takes either an initial model or a tuple of an initial model 
    // and one or more tasks to execute when the component is initialized.
    init: undefined,

    // The view function is called after update. 
    view: view
})