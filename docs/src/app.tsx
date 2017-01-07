import * as myra from 'myra'
import * as router from 'myra-router'

import Link from './components/link'
import Navigation from './components/navigation'
import Home from './components/home'
import GettingStarted from './components/getting-started'
import Examples from './components/examples'

type State = {
    routeCtx: router.RouteContext
}
const init = {} as State

router.setBasePath('/myra')

const onRoute = (state: State, ctx: router.RouteContext) =>
    myra.evolve(state, x => x.routeCtx = ctx)

const AppComponent = myra.defineComponent({
    name: 'App',
    init: {
        state: init,
        effects: [router.addListener(onRoute)]
    },
    view: ({ state }) =>
        <div id="app-container">
            {state.routeCtx.matchAny({
                '/': <Home />,
                '*':
                <div>
                    <header id="app-header">
                        <div class="container">
                            <div id="app-title">
                                <Link href="/" title="Myra" />
                            </div>
                            <div id="main-nav">
                                <Navigation />
                            </div>
                        </div>
                    </header>
                    <main class="container">
                        {state.routeCtx.matchAny({
                            'getting-started': <GettingStarted />,
                            'examples': <Examples />
                        }, <nothing />)}
                    </main>
                </div>
            }, <nothing />)}


            <footer id="app-footer">
                <div class="container">
                    <p>Copyright &copy; Jonathan Hedrén 2016-2017</p>
                </div>
            </footer>
        </div>

})


/**
 * Mounts the component to a DOM element.
 */
myra.mountComponent(AppComponent, document.body)
