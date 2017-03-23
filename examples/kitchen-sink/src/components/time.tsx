import * as myra from 'myra'
import { startTimeout, cancelTimeout, startInterval, cancelInterval } from 'myra-time'


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


/**
 * Updates
 */
const timeoutStarted = (_state: State, handle: number) =>
    ({ timeoutHandle: handle })
const timeoutEnded = (_state: State) =>
    ({ timeoutHandle: undefined })
const timeoutCancelled = (_state: State) =>
    ({ timeoutHandle: undefined })

const intervalStarted = (_state: State, handle: number) =>
    ({ intervalHandle: handle })
const intervalTick = (state: State) =>
    ({ intervalTickValue: state.intervalTickValue + 100 })
const intervalCancelled = (_state: State) =>
    ({
        intervalHandle: undefined,
        intervalTickValue: 0
    })


/**
 * Effects
 */
const startTimeoutEffect = startTimeout(5000, timeoutStarted, timeoutEnded)
const cancelTimeoutEffect = (handle: number) => cancelTimeout(handle, timeoutCancelled)

const startIntervalEffect = startInterval(100, intervalStarted, intervalTick)
const cancelIntervalEffect = (handle: number) => cancelInterval(handle, intervalCancelled)


/**
 * Component
 */
export default myra.defineComponent({
    // The name of the component. Used for debugging purposes.
    name: 'TimeComponent',

    // Init takes either an initial model or a tuple of an initial model 
    // and an effect to execute when the component is initialized.
    init: init,

    // The view function is called after update. 
    view: ctx =>
        <section>
            <h2>Time examples</h2>
            <p>
                {ctx.state.timeoutHandle ?
                    <button type="button"
                        class="btn btn-sm btn-default"
                        onclick={() => ctx.invoke(cancelTimeoutEffect(ctx.state.timeoutHandle!))}>
                        Cancel timeout
                    </button>
                    : <button type="button"
                        class="btn btn-sm btn-default"
                        onclick={() => ctx.invoke(startTimeoutEffect)}>
                        Set a timeout of 5 seconds
                      </button>
                }
            </p>
            <p>
                {ctx.state.intervalHandle ?
                    <button type="button"
                        class="btn btn-sm btn-default"
                        onclick={() => ctx.invoke(cancelIntervalEffect(ctx.state.intervalHandle!))}>
                        Cancel interval
                    </button>
                    : <button type="button"
                        class="btn btn-sm btn-default"
                        onclick={() => ctx.invoke(startIntervalEffect)}>
                        Start interval
                      </button>
                }
            </p>
            <p>Milliseconds since interval started: {ctx.state.intervalTickValue}</p>
        </section>
})
