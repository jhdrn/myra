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
export default myra.defineComponent({
    // The name of the component. Used for debugging purposes.
    name: 'CounterComponent',

    // Init takes either an initial model or a tuple of an initial model 
    // and one or more tasks to execute when the component is initialized.
    init: init,

    // The view function is called after update. 
    view: ctx =>
        <section>
            <h2>Counter example</h2>
            <button type="button"
                class="btn btn-sm btn-default"
                onclick={() => ctx.apply(increase)}>+</button>

            <span> {ctx.state} </span>

            <button type="button"
                class="btn btn-sm btn-default"
                onclick={() => ctx.apply(decrease)}>-</button>
        </section>
})