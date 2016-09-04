import { defineComponent, evolve } from 'myra/core'
import { startTimeout, cancelTimeout, startInterval, cancelInterval } from 'myra/time'
import * as jsxFactory from 'myra/html/jsxFactory'


/**
 * Model
 */
type Model = {
    timeoutHandle?: number
    intervalHandle?: number
    intervalTickValue: number
}
const init: Model = {
    intervalTickValue: 0
}


/**
 * Updates
 */
const timeoutStarted = (model: Model, handle: number) =>
    evolve(model, m => m.timeoutHandle = handle)
const timeoutEnded = (model: Model) =>
    evolve(model, m => m.timeoutHandle = undefined)
const timeoutCancelled = (model: Model) =>
    evolve(model, m => m.timeoutHandle = undefined)

const intervalStarted = (model: Model, handle: number) =>
    evolve(model, m => m.intervalHandle = handle)
const intervalTick = (model: Model) =>
    evolve(model, m => m.intervalTickValue += 100)
const intervalCancelled = (model: Model) =>
    evolve(model, m => {
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
 * View
 */
const view = (model: Model) => 
    <section>
        <h2>Time examples</h2>
        <p>
        { model.timeoutHandle ? 
            <button type="button"
                    class="btn btn-sm btn-default"
                    onclick={cancelTimeoutTask(model.timeoutHandle)}>
                    Cancel timeout
            </button>
            : <button type="button"
                    class="btn btn-sm btn-default"
                    onclick={startTimeoutTask}>
                    Set a timeout of 5 seconds
            </button>
        }
        </p>
        <p>
            { model.intervalHandle ? 
                <button type="button"
                        class="btn btn-sm btn-default"
                        onclick={cancelIntervalTask(model.intervalHandle)}>
                        Cancel interval
                </button>
                : <button type="button"
                        class="btn btn-sm btn-default"
                        onclick={startIntervalTask}>
                        Start interval
                </button>
            }
        </p>
        <p>Milliseconds since interval started: {model.intervalTickValue}</p>
    </section>


/**
 * Component
 */
export const TimeComponent = defineComponent({
    // The name of the component. Used for debugging purposes.
    name: 'TimeComponent',

    // Init takes either an initial model or a tuple of an initial model 
    // and one or more tasks to execute when the component is initialized.
    init: init,

    // The view function is called after update. 
    view: view
})