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
export default myra.define({
    responseStatus: 'init'
} as State, evolve => {

    const onHttpRequest = (responseText: string) =>
        evolve({ responseStatus: 'success', response: responseText })

    const makeHttpRequest = () => fetch('https://api.github.com/repos/jhdrn/myra')
        .then(r => r.text())
        .then(onHttpRequest)

    return state =>
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
                    {state.response}
                    {state.responseStatus === 'success' ?
                        <p><strong>Response text:</strong>{state.response}</p>
                        : <nothing />
                    }
                </div>
                : <nothing />
            }

        </section>
})