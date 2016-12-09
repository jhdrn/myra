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
        onSuccess: (state: State, response: HttpResponse<any>) =>
            myra.evolve(state, m => {
                m.responseStatus = 'success'
                m.response = response
            }),
        onFailure: (state: State, response: HttpResponse<any>) =>
            myra.evolve(state, m => {
                m.responseStatus = 'failure'
                m.response = response
            })
    })

/**
 * Component
 */
export default myra.defineComponent({
    // The name of the component. Used for debugging purposes.
    name: 'HttpComponent',

    // Init takes either an initial model or a tuple of an initial model 
    // and one or more tasks to execute when the component is initialized.
    init: { state: init },

    // The view function is called after update. 
    view: ctx =>
        <section>
            <h2>HTTP example</h2>
            <button type="button"
                class="btn btn-sm btn-default"
                onclick={() => ctx.invoke(httpRequestEffect)}>
                Make HTTP request
            </button>

            <p>Response status:{ctx.state.responseStatus}</p>
            {ctx.state.response ?
                <div>
                    {ctx.state.response.status}
                    {ctx.state.response.statusText}
                    {ctx.state.responseStatus === 'success' ?
                        <p><strong>Response text:</strong>{ctx.state.response.data}</p>
                        : <nothing />
                    }
                </div>
                : <nothing />
            }

        </section>
})