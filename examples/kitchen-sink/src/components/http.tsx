import * as myra from 'myra'
import { request, HttpResponse } from 'myra-http'


/**
 * State
 */
type ResponseStatus = 'init' | 'success' | 'failure'
type State = {
    responseStatus: ResponseStatus
    response?: HttpResponse<any>
}
const init = {
    responseStatus: 'init'
} as State


/**
 * Effects
 */
const httpRequestEffect =
    request({
        method: 'GET',
        url: 'https://api.github.com/repos/jhdrn/myra',
        responseType: 'text',
        onSuccess: (_state: State, response: HttpResponse<any>) =>
            ({
                responseStatus: 'success',
                response: response
            }),
        onFailure: (_state: State, response: HttpResponse<any>) =>
            ({
                responseStatus: 'failure',
                response: response
            })
    })

/**
 * Component
 */
export default myra.define('HttpComponent', init, ({ state, invoke }) =>
    <section>
        <h2>HTTP example</h2>
        <button type="button"
            class="btn btn-sm btn-default"
            onclick={() => invoke(httpRequestEffect)}>
            Make HTTP request
            </button>

        <p>Response status:{state.responseStatus}</p>
        {state.response ?
            <div>
                {state.response.status}
                {state.response.statusText}
                {state.responseStatus === 'success' ?
                    <p><strong>Response text:</strong>{state.response.data}</p>
                    : <nothing />
                }
            </div>
            : <nothing />
        }

    </section>
)