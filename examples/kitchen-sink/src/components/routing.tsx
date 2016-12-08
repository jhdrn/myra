import * as myra from 'myra'
import * as router from 'myra-router'
import RouteComponent from './route-component'


/**
 * State
 */
type State = {
    routerCtx: router.RouteContext
}
const init = {} as State


/**
 * Updates
 */
const onLocationUpdate = (state: State, ctx: router.RouteContext) =>
    myra.evolve(state, x => x.routerCtx = ctx)

/**
 * Component
 */
export default myra.defineComponent({
    // The name of the component. Used for debugging purposes.
    name: 'LocationComponent',

    // Init takes either an initial model or a tuple of an initial model 
    // and one or more tasks to execute when the component is initialized.
    init: {
        state: init,
        effects: [router.addListener(onLocationUpdate)]
    },

    // The view function is called after update. 
    view: ctx =>
        <section>
            <h2>Router examples</h2>

            {ctx.state.routerCtx.matchAny({
                'test1': <p>Route to '/test1'.</p>,
                'test1/:param': (params: any) => <RouteComponent {...params} />
            }, <nothing />)}

            {ctx.state.routerCtx.match('test1/:param') ?
                <p>Location '/test2/:param' matched.</p> : <nothing />}

            <ul class="list-group">
                <li class="list-group-item">
                    <a href="" onclick={(ev: Event) => { ev.preventDefault(), ctx.invoke(router.routeTo('/test1')) } }>
                        Update location to '/test1'
                </a>
                </li>
                <li class="list-group-item">
                    <a href="" onclick={(ev: Event) => { ev.preventDefault(), ctx.invoke(router.routeTo('/test1/test2')) } }>
                        Update location to '/test1/test2'
                </a>
                </li>
                <li class="list-group-item">
                    <a href="" onclick={(ev: Event) => { ev.preventDefault(), ctx.invoke(router.goBack()) } }>
                        Go back
                </a>
                </li>
                <li class="list-group-item">
                    <a href="" onclick={(ev: Event) => { ev.preventDefault(), ctx.invoke(router.goForward()) } }>
                        Go forward
                </a>
                </li>
            </ul>
        </section>
})