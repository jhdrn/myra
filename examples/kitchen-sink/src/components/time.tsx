import * as myra from 'myra/core'
import { startTimeout, cancelTimeout, startInterval, cancelInterval } from 'myra/time'


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
const timeoutStarted = (state: State, handle: number) =>
    myra.evolve(state, m => m.timeoutHandle = handle)
const timeoutEnded = (state: State) =>
    myra.evolve(state, m => m.timeoutHandle = undefined)
const timeoutCancelled = (state: State) =>
    myra.evolve(state, m => m.timeoutHandle = undefined)

const intervalStarted = (state: State, handle: number) =>
    myra.evolve(state, m => m.intervalHandle = handle)
const intervalTick = (state: State) =>
    myra.evolve(state, m => m.intervalTickValue += 100)
const intervalCancelled = (state: State) =>
    myra.evolve(state, m => {
        m.intervalHandle = undefined
        m.intervalTickValue = 0
    })


/**
 * Tasks
 */
const startTimeoutTask = startTimeout(5000, timeoutStarted, timeoutEnded)
const cancelTimeoutTask = (handle: number) => cancelTimeout(handle, timeoutCancelled)

const startIntervalTask = startInterval(100, intervalStarted, intervalTick)
const cancelIntervalTask = (handle: number) => cancelInterval(handle, intervalCancelled)


/**
 * Component
 */
export default myra.defineComponent({
    // The name of the component. Used for debugging purposes.
    name: 'TimeComponent',

    // Init takes either an initial model or a tuple of an initial model 
    // and one or more tasks to execute when the component is initialized.
    init: {
        state: init
    },

    // The view function is called after update. 
    view: ctx =>
        <section>
            <h2>Time examples</h2>
            <p>
                {ctx.state.timeoutHandle ?
                    <button type="button"
                        class="btn btn-sm btn-default"
                        onclick={() => ctx.invoke(cancelTimeoutTask(ctx.state.timeoutHandle!))}>
                        Cancel timeout
                    </button>
                    : <button type="button"
                        class="btn btn-sm btn-default"
                        onclick={() => ctx.invoke(startTimeoutTask)}>
                        Set a timeout of 5 seconds
                      </button>
                }
            </p>
            <p>
                {ctx.state.intervalHandle ?
                    <button type="button"
                        class="btn btn-sm btn-default"
                        onclick={() => ctx.invoke(cancelIntervalTask(ctx.state.intervalHandle!))}>
                        Cancel interval
                    </button>
                    : <button type="button"
                        class="btn btn-sm btn-default"
                        onclick={() => ctx.invoke(startIntervalTask)}>
                        Start interval
                      </button>
                }
            </p>
            <p>Milliseconds since interval started: {ctx.state.intervalTickValue}</p>
        </section>
})
