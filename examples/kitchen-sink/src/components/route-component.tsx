import * as myra from 'myra'


/**
 * State
 */
type State = { param: string | undefined }


/**
 * Updates
 */
const mount = (_: State, paramsFromRoute: { param: string }) =>
    ({ param: paramsFromRoute.param })


/**
 * Component
 */
export default myra.define({
    // The name of the component. Used for debugging purposes.
    name: 'RouteComponent',

    // Init takes either an initial model or a tuple of an initial model 
    // and an effect to execute when the component is initialized.
    init: {},

    // The mount update function is called when the component is mounted.
    // It will not be called again unless it's arguments has changed or 
    // the "forceMount" parameter was set to true when mounting the component.
    onMount: mount,

    // The render function is called after an update. 
    render: ({ state }) =>
        <p>Hello route, with param: {state.param}</p>
})