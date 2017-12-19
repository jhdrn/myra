import * as myra from 'myra'

/**
 * Component
 */
export default myra.define({ val: 0 }, c => {
    const increase = () => c.evolve(state => ({ val: state.val + 1 }))
    const decrease = () => c.evolve(state => ({ val: state.val - 1 }))

    return state =>
        <section>
            <h2>Counter example</h2>
            <button type="button"
                class="btn btn-sm btn-default"
                onclick={increase}>+</button>

            <span> {state.val} </span>

            <button type="button"
                class="btn btn-sm btn-default"
                onclick={decrease}>-</button>
        </section >
})