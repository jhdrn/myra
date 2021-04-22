import * as myra from '../../../../src/myra'

interface Props {
    forceUpdate: number
}

/**
 * Component
 */
export default (_: Props) => {

    const [value, setValue] = myra.useState(0)

    const increase = () => setValue(value + 1)
    const decrease = () => setValue(value - 1)

    return (
        <section>
            <h2>Counter example</h2>
            <button type="button"
                class="btn btn-sm btn-default"
                onclick={increase}>+</button>

            <span> {value} </span>

            <button type="button"
                class="btn btn-sm btn-default"
                onclick={decrease}>-</button>
        </section>
    )
}
