import * as myra from 'myra'


const Comp = () => {
    const ctx  = myra.context({ hello: 'Hello world '})
}

const SubComponent = myra.define({}, ctx => {
    ctx.stuff = () => {

    }
    return _ => <div></div>
})

SubComponent.someFunc = () => {

}

const x = () => <div>asd</div>

x.defaultProps = {

}

x.didMount = () => {

}

x.state = {
    hello: 'Hello world'
}

/**
 * Define a component with it's initial state { hello: 'Hello world' }
 */
const AppComponent = myra.define({ hello: 'Hello world' }, ctx => {

    function onClick() {
        ctx.evolve(state => ({ hello: `${state.hello} again` }))
    }

    function bind(c: any) {
        SubComponent.bind(c).someFunc()
    }

    return state => <div onclick={onClick}>{state.hello}<SubComponent bind={bind} /></div>
})

myra.mount(<AppComponent />, document.body)
