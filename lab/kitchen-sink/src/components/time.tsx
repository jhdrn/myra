import * as myra from '../../../../src/myra'

interface Props {
    forceUpdate: number
}

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

export default (_: Props) => {

    const [state, updateState] = myra.useState(init)

    const setTimeoutHandle = (handle: number) =>
        updateState({ timeoutHandle: handle })
    const clearTimeoutHandle = () =>
        updateState({ timeoutHandle: undefined })
    const setIntervalHandle = (handle: number) =>
        updateState({ intervalHandle: handle })
    const intervalTick = () => updateState(state =>
        ({ intervalTickValue: state.intervalTickValue + 100 }))

    const startTimeout = () => {
        const handle = window.setTimeout(clearTimeoutHandle, 5000)
        setTimeoutHandle(handle)
    }
    const cancelTimeout = () => updateState(state => {
        clearTimeout(state.timeoutHandle!)
        return { timeoutHandle: undefined }
    })

    const startInterval = () => {
        const handle = window.setInterval(intervalTick, 100)
        setIntervalHandle(handle)
    }
    const cancelInterval = () => updateState(state => {
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
}
