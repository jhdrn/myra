import * as myra from 'myra'


/**
 * State
 */
type ResponseStatus = 'init' | 'success' | 'failure'
type State = {
    responseStatus: ResponseStatus
    response?: string
}
const init = {
    responseStatus: 'init'
} as State


/**
 * Effects
 */
const httpRequestEffect = (post: myra.Post<State>) =>
    fetch('https://api.github.com/repos/jhdrn/myra')
        .then(r => r.text().then(t => post(_s => ({ responseStatus: 'success', response: t }))))

/**
 * Component
 */
export default myra.define(init, ({ state, post }) =>
    <section>
        <h2>HTTP example</h2>
        <button type="button"
            class="btn btn-sm btn-default"
            onclick={() => httpRequestEffect(post)}>
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