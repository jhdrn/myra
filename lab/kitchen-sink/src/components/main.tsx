import * as myra from '../../../../src/myra'

import CounterComponent from './counter'
import { ErrorComponent } from './error'
import HttpComponent from './http'
import { Props } from './props'
import { Effects } from './effects'
import TimeComponent from './time'

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
            <hr />
            <CounterComponent forceUpdate={state} />
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
