import * as myra from 'myra'

/**
 * Define a component with it's initial state { hello: 'Hello world' }
 */
const AppComponent = myra.define({ hello: 'Hello world' }, ctx => {

    function onClick() {
        ctx.evolve(state => ({ hello: `${state.hello} again` }))
    }

    return state => <div onclick={onClick}>{state.hello}</div>
})

myra.mount(<AppComponent />, document.body)
