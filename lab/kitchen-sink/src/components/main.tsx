import * as myra from '../../../../src/myra'

import CounterComponent from './counter'
import { Effects } from './effects'
import { ErrorComponent } from './error'
import HttpComponent from './http'
import { Props } from './props'
import TimeComponent from './time'

const el = <div id="element">Element</div>

type P = {
    foo: number
}

const MemoComponent = myra.memo<P>(p => {
    const [s, update] = myra.useState(0)
    console.log('render')
    return (
        <div onclick={() => update(x => x + 1)}>Memo example {s} {p.foo}</div>
    )
}, (newProps, oldProps) => {
    return newProps.foo < oldProps.foo
})

/**
 * View
 */
export const MainComponent = () => {
    const [state, evolve] = myra.useState(0)
    const [unmount, setUnmount] = myra.useState(false)
    return (
        <div class="container">
            <h1>Kitchen sink demo</h1>
            <button onclick={() => evolve(s => s + 1)}>Rerender component tree</button>
            <button onclick={() => setUnmount(true)}>Unmount tasks</button>
            <hr />
            {el}
            <hr />
            <CounterComponent forceUpdate={state} />
            <hr />
            <MemoComponent foo={state % 3} />
            <hr />
            <HttpComponent forceUpdate={state} />
            <hr />
            <ErrorComponent forceUpdate={state} />
            <hr />
            <TimeComponent forceUpdate={state} />
            <hr />
            {!unmount &&
                <Effects forceUpdate={state} />
            }
            <hr />
            <Props forceUpdate={state} propA={123} propB="ABC">
                Some <strong>child</strong> nodes
            </Props>
        </div>
    )
}
