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

export default myra.define(init).updates({
    setTimeoutHandle: (_, handle: number) =>
        ({ timeoutHandle: handle }),
    clearTimeoutHandle: _ =>
        ({ timeoutHandle: undefined }),
    setIntervalHandle: (_, handle: number) =>
        ({ intervalHandle: handle }),
    intervalTick: ({ state }) =>
        ({ intervalTickValue: state.intervalTickValue + 100 }),
    intervalCancelled: _ =>
        ({
            intervalHandle: undefined,
            intervalTickValue: 0
        })
}).effects({
    startTimeout: ctx => {
        const handle = setTimeout(ctx.updates.clearTimeoutHandle, 5000)
        ctx.updates.setTimeoutHandle(ctx, handle)
    },
    cancelTimeout: ctx => {
        clearTimeout(ctx.state.timeoutHandle!)
        ctx.updates.clearTimeoutHandle(ctx)
    },
    startInterval: ctx => {
        const handle = setInterval(ctx.updates.intervalTick, 100)
        ctx.updates.setIntervalHandle(ctx, handle)
    },
    cancelInterval: ctx => {
        clearInterval(ctx.state.intervalHandle!)
        ctx.updates.intervalCancelled(ctx)
    }
}).view(({ state, effects }) =>
    <section>
        <h2>Time examples</h2>
        <p>
            {state.timeoutHandle ?
                <button type="button"
                    class="btn btn-sm btn-default"
                    onclick={effects.cancelTimeout}>
                    Cancel timeout
                    </button>
                : <button type="button"
                    class="btn btn-sm btn-default"
                    onclick={effects.startTimeout}>
                    Set a timeout of 5 seconds
                      </button>
            }
        </p>
        <p>
            {state.intervalHandle ?
                <button type="button"
                    class="btn btn-sm btn-default"
                    onclick={effects.cancelInterval}>
                    Cancel interval
                    </button>
                : <button type="button"
                    class="btn btn-sm btn-default"
                    onclick={effects.startInterval}>
                    Start interval
                      </button>
            }
        </p>
        <p>Milliseconds since interval started: {state.intervalTickValue}</p>
    </section>
    )
