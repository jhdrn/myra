import * as myra from '../../../src/myra'
// const sleep = (milliseconds) => {
//     return new Promise(resolve => setTimeout(resolve, milliseconds))
// }

const SubComponent = myra.useContext<{ foo: string }>(function subComponent(_props, ctx) {
    const [state, evolve] = myra.useState({ name: 'SubComponent' })
    const [noOfRenders, setNoOfRenders] = myra.useState(0)
    const [refState,] = myra.useState({ foo: 'bar' })

    myra.useLifecycle(ev => {
        switch (ev.phase) {
            case myra.LifecyclePhase.BeforeMount:
                break
            case myra.LifecyclePhase.BeforeRender:
                refState.foo += noOfRenders
                break
            case myra.LifecyclePhase.AfterRender:
                console.log(refState.foo)
                break
            case myra.LifecyclePhase.AfterMount:
                break
            case myra.LifecyclePhase.BeforeUnmount:
                break
        }

        if (noOfRenders > 2 && ev.phase === myra.LifecyclePhase.BeforeRender) {

            ev.preventRender()
        }
    })

    setNoOfRenders(noOfRenders + 1)

    evolve({ name: state.name + ' ' + _props.foo })
    return <div>{state.name}</div>
})

/**
 * Define a component with it's initial state { hello: 'Hello world' }
 */
const AppComponent = myra.define(_ => {

    const [time, _evolveTime] = myra.useState({ start: 0, end: 0 })
    const [state, evolve] = myra.useState({ hello: 'Hello world' })
    const [state2, _evolve2] = myra.useState({ hello: 'Hello world 2' })

    // myra.useRenderDecision(() => false)

    // myra.useLifecycle(ev => {
    //     if (ev.phase === 'postRender') {
    //         evolve2({ hello: state.hello })
    //     }
    // })

    async function onClick() {
        // await sleep(4000)
        evolve(state => ({ hello: `${state.hello} again` }))
        // evolve2({ hello: `${state.hello} 2 again` })
    }

    return <div onclick={onClick}>{state.hello} - {state2.hello} Time: {Date.now() - time.start} <SubComponent foo={state.hello} /></div>
})

myra.mount(<AppComponent />, document.body)
