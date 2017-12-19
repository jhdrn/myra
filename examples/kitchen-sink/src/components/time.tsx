import * as myra from 'myra'

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

export default myra.define(init, c => {

    const setTimeoutHandle = (handle: number) =>
        c.evolve({ timeoutHandle: handle })
    const clearTimeoutHandle = () =>
        c.evolve({ timeoutHandle: undefined })
    const setIntervalHandle = (handle: number) =>
        c.evolve({ intervalHandle: handle })
    const intervalTick = () => c.evolve(state =>
        ({ intervalTickValue: state.intervalTickValue + 100 }))

    const startTimeout = () => {
        const handle = window.setTimeout(clearTimeoutHandle, 5000)
        setTimeoutHandle(handle)
    }
    const cancelTimeout = () => c.evolve(state => {
        clearTimeout(state.timeoutHandle!)
        return { timeoutHandle: undefined }
    })

    const startInterval = () => {
        const handle = window.setInterval(intervalTick, 100)
        setIntervalHandle(handle)
    }
    const cancelInterval = () => c.evolve(state => {
        clearInterval(state.intervalHandle!)
        return {
            intervalHandle: undefined,
            intervalTickValue: 0
        }
    })

    return state =>
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
})
