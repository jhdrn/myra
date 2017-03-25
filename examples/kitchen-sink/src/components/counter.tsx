import * as myra from 'myra'


/**
 * State
 */
type State = { val: number }
const init = { val: 0 }


/**
 * Updates
 */
const increase = (state: State) => ({ val: state.val + 1 })
const decrease = (state: State) => ({ val: state.val - 1 })


/**
 * Component
 */
export default myra.define(
    // The name of the component. Used for debugging purposes.
    'CounterComponent',

    // Init takes either an initial model or a tuple of an initial model 
    // and an effect to execute when the component is initialized.
    init,

    // The render function is called after an update. 
    ({ state, apply }) =>
        <section>
            <h2>Counter example</h2>
            <button type="button"
                class="btn btn-sm btn-default"
                onclick={() => apply(increase)}>+</button>

            <span> {state.val} </span>

            <button type="button"
                class="btn btn-sm btn-default"
                onclick={() => apply(decrease)}>-</button>
        </section>
)