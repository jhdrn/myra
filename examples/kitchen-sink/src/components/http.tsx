import * as myra from 'myra'


/**
 * State
 */
type ResponseStatus = 'init' | 'success' | 'failure'
type State = {
    responseStatus: ResponseStatus
    response?: Response
}
const init = {
    responseStatus: 'init'
} as State


/**
 * Effects
 */
const httpRequestEffect = () =>
    fetch('https://api.github.com/repos/jhdrn/myra')
        .then(
        r => ({ responseStatus: 'success', response: r }),
        r => ({ responseStatus: 'failure', response: r })
        )

/**
 * Component
 */
export default myra.define('HttpComponent', init, ({ state }) =>
    <section>
        <h2>HTTP example</h2>
        <button type="button"
            class="btn btn-sm btn-default"
            onclick={() => httpRequestEffect}>
            Make HTTP request
            </button>

        <p>Response status:{state.responseStatus}</p>
        {state.response ?
            <div>
                {state.response.status}
                {state.response.statusText}
                {state.responseStatus === 'success' ?
                    <p><strong>Response text:</strong>{state.response}</p>
                    : <nothing />
                }
            </div>
            : <nothing />
        }

    </section>
)