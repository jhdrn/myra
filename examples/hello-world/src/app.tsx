import * as myra from 'myra'

const AppComponent = myra.define({ hello: 'Hello world' }, evolve => {

    const onClick = () => evolve(state => ({ hello: `${state.hello} again` }))

    return state => <div onclick={onClick}>{state.hello}</div>
})

myra.mount(AppComponent, document.body)
