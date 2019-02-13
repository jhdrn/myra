import * as myra from '../../../../src/myra'

/**
 * State
 */
type State = {
    timeoutHandle?: number
    intervalHandle?: number
    intervalTickValue: number
}
const init = {
    intervalTickValue: 0
} as State

export default myra.withContext((_p, ctx) => {

    const [state, evolve] = ctx.useState(init)

    const setTimeoutHandle = (handle: number) =>
        evolve({ timeoutHandle: handle })
    const clearTimeoutHandle = () =>
        evolve({ timeoutHandle: undefined })
    const setIntervalHandle = (handle: number) =>
        evolve({ intervalHandle: handle })
    const intervalTick = () => evolve(state =>
        ({ intervalTickValue: state.intervalTickValue + 100 }))

    const startTimeout = () => {
        const handle = window.setTimeout(clearTimeoutHandle, 5000)
        setTimeoutHandle(handle)
    }
    const cancelTimeout = () => evolve(state => {
        clearTimeout(state.timeoutHandle!)
        return { timeoutHandle: undefined }
    })

    const startInterval = () => {
        const handle = window.setInterval(intervalTick, 100)
        setIntervalHandle(handle)
    }
    const cancelInterval = () => evolve(state => {
        clearInterval(state.intervalHandle!)
        return {
            intervalHandle: undefined,
            intervalTickValue: 0
        }
    })

    return (
        <section>
            <h2>Time examples</h2>
            <p>
                {state.timeoutHandle ?
                    <button type="button"
                        class="btn btn-sm btn-default"
                        onclick={cancelTimeout}>
                        Cancel timeout
                    </button>
                    : <button type="button"
                        class="btn btn-sm btn-default"
                        onclick={startTimeout}>
                        Set a timeout of 5 seconds
                      </button>
                }
            </p>
            <p>
                {state.intervalHandle ?
                    <button type="button"
                        class="btn btn-sm btn-default"
                        onclick={cancelInterval}>
                        Cancel interval
                    </button>
                    : <button type="button"
                        class="btn btn-sm btn-default"
                        onclick={startInterval}>
                        Start interval
                      </button>
                }
            </p>
            <p>Milliseconds since interval started: {state.intervalTickValue}</p>
        </section>
    )
})
