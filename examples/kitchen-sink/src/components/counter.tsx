import { defineComponent, evolve } from 'myra/core'
import * as jsxFactory from 'myra/html/jsxFactory'


/**
 * State
 */
type State = number
const init = evolve(0)


/**
 * Updates
 */
const increase = (state: State) => evolve(state + 1)
const decrease = (state: State) => evolve(state - 1)


/**
 * View
 */
const view = (state: State) =>
    <section>
        <h2>Counter example</h2>
        <button type="button"
            class="btn btn-sm btn-default"
            onclick={increase}>+</button>

        <span> {state} </span>

        <button type="button"
            class="btn btn-sm btn-default"
            onclick={decrease}>-</button>
    </section>


/**
 * Component
 */
export const CounterComponent = defineComponent({
    // The name of the component. Used for debugging purposes.
    name: 'CounterComponent',

    // Init takes either an initial model or a tuple of an initial model 
    // and one or more tasks to execute when the component is initialized.
    init: init,

    // The view function is called after update. 
    view: view
})