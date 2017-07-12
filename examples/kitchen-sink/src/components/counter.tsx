import * as myra from 'myra'

/**
 * Component
 */
export default myra
    .define({ val: 0 })
    .updates({
        increase: ctx => ({ val: ctx.state.val + 1 }),
        decrease: ctx => ({ val: ctx.state.val - 1 })
    })
    .view(({ state, updates }) =>
        <section>
            <h2>Counter example</h2>
            <button type="button"
                class="btn btn-sm btn-default"
                onclick={updates.increase}>+</button>

            <span> {state.val} </span>

            <button type="button"
                class="btn btn-sm btn-default"
                onclick={updates.decrease}>-</button>
        </section >
    )