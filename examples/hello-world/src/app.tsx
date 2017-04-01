import * as myra from 'myra'

/**
 * This is the definition of the component state.
 */
type State = { hello: string }
const init: State = { hello: 'Hello world!' }

/**
 * This is an example of an Update<State> function. It takes the current state
 * an possibly some arguments. It must also return a Result<State>. 
 */
const updateHelloWorld = (arg: string) => (s: State): Partial<State> =>
    ({ hello: `${s.hello} again ${arg}` })

/**
 * This is the actual component definition.
 */
const AppComponent = myra.define(
    // The initial state (also required).
    init,
    // The required render function of the component. It is passed a 
    // ViewContext<State> argument which holds the state, any child nodes and 
    // some functions to update the state. 
    ({ state, post }) =>
        <p onclick={() => post(updateHelloWorld('with an argument'))}>
            {state.hello}
        </p>
)

/**
 * Mounts the component to a DOM element.
 */
myra.mount(AppComponent, document.body)
