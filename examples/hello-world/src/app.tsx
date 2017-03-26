import * as myra from 'myra'

/**
 * This is the definition of the component state. For this component, it can be 
 * either a string or undefined. The initial state is undefined, but it will
 * be updated when the component is mounted, see below.
 */
type State = { hello: string | undefined }
const init: State = { hello: undefined }


/**
 * This is a function that will be called when the component is mounted. it
 * takes the initial state as an argument, but as the initial state is
 * undefined, we don't care about it. Instead, we return a new state; a 
 * 'Hello world!' string. 
 * 
 * The evolve function is a helper function that is more useful when the state
 * is more complex. It copies the state and returns a Result<State>.
 */
const mount = (_: State) =>
    ({ hello: 'Hello world!' })


/**
 * This is an example of an Update<State> function. It takes the current state
 * an possibly some arguments. It must also return a Result<State>. 
 * 
 * This function is applied when the <p>-tag in the view is clicked, see below.
 */
const updateHelloWorld = (s: State, arg: string) =>
    ({ hello: `${s.hello} again ${arg}` })


/**
 * This is the actual component definition.
 */
const AppComponent = myra.define({
    // The name is required. It should be unique within your application.
    name: 'HelloWorldApp',
    // The initial state (also required).
    init: init,
    // This callback is optional and is called when the component is mounted or
    // re-mounted (if it's arguments has changed or if it's explicitly forced to 
    // re-mount)
    onMount: mount,
    // The required render function of the component. It is passed a 
    // ViewContext<State> argument which holds the state, any child nodes and 
    // some functions to update the state. 
    render: ({ state }) =>
        <p onclick={() => updateHelloWorld(state, 'with an argument')}>
            {state.hello}
        </p>
})


/**
 * Mounts the component to a DOM element.
 */
myra.mount(AppComponent, document.body)
