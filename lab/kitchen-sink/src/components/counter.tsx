import * as myra from '../../../../src/myra'

/**
 * Component
 */
export default myra.useContext((_p, ctx) => {
    const ref = ctx.useRef<string>()

    console.log(ref)
    const [state, evolve] = ctx.useState({ val: 0 })

    ref.current = 'bar ' + state.val
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