import { defineComponent } from 'myra/core'
import { p } from 'myra/html/elements'


/**
 * View
 */
const view = () => p('Hello route!')

   
/**
 * Component
 */
export const routeComponent = defineComponent({
    // The name of the component. Used for debugging purposes.
    name: 'RouteComponent',

    // Init takes either an initial model or a tuple of an initial model 
    // and one or more tasks to execute when the component is initialized.
    init: undefined,

    // The view function is called after update. 
    view: view
})