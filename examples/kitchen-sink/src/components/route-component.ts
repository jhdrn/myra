import { defineComponent, evolve } from 'myra/core'
import { p } from 'myra/html/elements'


/**
 * Model
 */
type Model = string | undefined


/**
 * Updates
 */
const mount = (_: Model, paramsFromRoute: { param: string }) =>
    evolve(paramsFromRoute.param)


/**
 * View
 */
const view = (m: Model) => p(`Hello route, with param: ${m}`)


/**
 * Component
 */
export const routeComponent = defineComponent({
    // The name of the component. Used for debugging purposes.
    name: 'RouteComponent',

    // Init takes either an initial model or a tuple of an initial model 
    // and one or more tasks to execute when the component is initialized.
    init: evolve(undefined),

    // The mount update function is called when the component is mounted.
    // It will not be called again unless it's arguments has changed or 
    // the "forceMount" parameter was set to true when mounting the component.
    onMount: mount,

    // The view function is called after update. 
    view: view
})