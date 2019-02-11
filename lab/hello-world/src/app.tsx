import * as myra from '../../../src/myra'
// const sleep = (milliseconds) => {
//     return new Promise(resolve => setTimeout(resolve, milliseconds))
// }


const SubComponent = myra.withContext<{ foo: string }>(function subComponent(_props, _children, ctx) {
    const [state, evolve] = ctx.useState({ name: 'SubComponent' })
    evolve({ name: state.name + ' ' + _props.foo })
    return <div>{state.name}</div>
})

/**
 * Define a component with it's initial state { hello: 'Hello world' }
 */
const AppComponent = myra.withContext((_props, _children, ctx) => {

    const [time, evolveTime] = ctx.useState({ start: 0, end: 0 })
    const [state, evolve] = ctx.useState({ hello: 'Hello world' })
    const [state2, evolve2] = ctx.useState({ hello: 'Hello world 2' })
    function onClick() {
        evolveTime({ start: Date.now() })
        // await sleep(40)
        evolve(state => ({ hello: `${state.hello} again` }))
        evolve2({ hello: `${state.hello} 2 again` })
    }

    return <div onclick={onClick}>{state.hello} - {state2.hello} Time: {Date.now() - time.start} <SubComponent foo={state.hello} /></div>
})

myra.mount(<AppComponent />, document.body)
