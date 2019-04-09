import * as myra from '../../../../src/myra'


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
export default myra.useContext((_p, ctx) => {

    const [state, evolve] = ctx.useState<State>({
        responseStatus: 'init'
    })

    const onHttpRequest = (responseText: string) =>
        evolve({ responseStatus: 'success', response: responseText })

    const makeHttpRequest = () => fetch('https://api.github.com/repos/jhdrn/myra')
        .then(r => r.text())
        .then(onHttpRequest)

    return (
        <section>
            <h2>HTTP example</h2>
            <button type="button"
                class="btn btn-sm btn-default"
                onclick={makeHttpRequest}>
                Make HTTP request
                </button>

            <p>Response status:{state.responseStatus}</p>
            {state.response ?
                <div>
                    {state.responseStatus === 'success' ?
                        <p><strong>Response text:</strong>{state.response}</p>
                        : <nothing />
                    }
                </div>
                : <nothing />
            }

        </section>
    )
})