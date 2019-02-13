import * as myra from '../../../../src/myra'

/**
 * Component
 */
export default myra.withContext((_p, ctx) => {

    const [state, evolve] = ctx.useState({ val: 0 })

    const increase = () => evolve({ val: state.val + 1 })
    const decrease = () => evolve({ val: state.val - 1 })

    return (
        <section>
            <h2>Counter example</h2>
            <button type="button"
                class="btn btn-sm btn-default"
                onclick={increase}>+</button>

            <span> {state.val} </span>

            <button type="button"
                class="btn btn-sm btn-default"
                onclick={decrease}>-</button>
        </section>
    )
})