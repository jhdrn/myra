import * as myra from 'myra'


/**
 * State
 */
type ResponseStatus = 'init' | 'success' | 'failure'
type State = {
    responseStatus: ResponseStatus
    response?: string
}

/**
 * Component
 */
export default myra
    .define({
        responseStatus: 'init'
    } as State)
    .updates({
        onHttpRequest: (_, responseText: string) =>
            ({ responseStatus: 'success', response: responseText })
    })
    .effects({
        httpRequest: ctx => fetch('https://api.github.com/repos/jhdrn/myra')
            .then(r => r.text())
            .then(t => ctx.updates.onHttpRequest(ctx, t))
    })
    .view(({ state, effects }) =>
        <section>
            <h2>HTTP example</h2>
            <button type="button"
                class="btn btn-sm btn-default"
                onclick={effects.httpRequest}>
                Make HTTP request
                </button>

            <p>Response status:{state.responseStatus}</p>
            {state.response ?
                <div>
                    {state.response}
                    {state.responseStatus === 'success' ?
                        <p><strong>Response text:</strong>{state.response}</p>
                        : <nothing />
                    }
                </div>
                : <nothing />
            }

        </section>
    )