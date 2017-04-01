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
    init,
    ({ state, post }) =>
        <section>
            <h2>Counter example</h2>
            <button type="button"
                class="btn btn-sm btn-default"
                onclick={() => post(increase)}>+</button>

            <span> {state.val} </span>

            <button type="button"
                class="btn btn-sm btn-default"
                onclick={() => post(decrease)}>-</button>
        </section >
)