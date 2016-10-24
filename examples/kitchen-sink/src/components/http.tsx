import { defineComponent, evolve } from 'myra/core'
import { httpRequest, HttpResponse } from 'myra/http'
import * as jsxFactory from 'myra/core/jsxFactory'


/**
 * State
 */
type ResponseStatus = 'init' | 'success' | 'failure'
type State = {
    responseStatus: ResponseStatus
    response?: HttpResponse
}
const init = evolve({
    responseStatus: 'init'
})


/**
 * Updates
 */
const httpSuccess = (state: State, response: HttpResponse) =>
    evolve(state, m => {
        m.responseStatus = 'success'
        m.response = response
    })

const httpFailure = (state: State, response: HttpResponse) =>
    evolve(state, m => {
        m.responseStatus = 'failure'
        m.response = response
    })

const httpRequestTask =
    httpRequest(httpSuccess, httpFailure, {
        method: 'GET',
        url: 'https://api.github.com/repos/jhdrn/myra'
    })


/**
 * View
 */
const view = (state: State) =>
    <section>
        <h2>HTTP example</h2>
        <button type="button"
            class="btn btn-sm btn-default"
            onclick={() => httpRequestTask}>
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


/**
 * Component
 */
export const HttpComponent = defineComponent({
    // The name of the component. Used for debugging purposes.
    name: 'HttpComponent',

    // Init takes either an initial model or a tuple of an initial model 
    // and one or more tasks to execute when the component is initialized.
    init: init,

    // The view function is called after update. 
    view: view
})