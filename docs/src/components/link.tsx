import * as myra from 'myra'
import * as router from 'myra-router'

type Props = {
    href: string
    title: string
}

type State = {
    routeCtx: router.RouteContext
}
const init = {} as State

const onRoute = (state: State, ctx: router.RouteContext) =>
    myra.evolve(state, x => x.routeCtx = ctx)

export default myra.defineComponent<State, Props>({
    name: 'Link',
    init: {
        state: init,
        effects: [router.addListener(onRoute)]
    },
    view: ctx =>
        <a href={`/myra/${ctx.props.href}`}
            class={ctx.state.routeCtx.match(ctx.props.href).match ? 'active' : ''}
            onclick={(ev) => ev.preventDefault() > ctx.invoke(router.routeTo(ctx.props.href))}>
            {ctx.props.title}
        </a>

})