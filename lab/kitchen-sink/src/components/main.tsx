import * as myra from '../../../../src/myra'

import CounterComponent from './counter'
import { ErrorComponent } from './error'
import HttpComponent from './http'
import { Lifecycle } from './lifecycle'
import { Props } from './props'
import StatelessComponent from './stateless-component'
import TimeComponent from './time'


/**
 * View
 */
export const MainComponent = myra.useContext((_, ctx) => {
    const [, evolve] = ctx.useState(0)
    return (
        <div class="container">
            <h1>Kitchen sink demo</h1>
            <button onclick={() => evolve(0)}>Rerender component tree</button>
            <hr />
            <StatelessComponent test="a value" />
            <hr />
            <CounterComponent />
            <hr />
            <HttpComponent />
            <hr />
            <ErrorComponent />
            <hr />
            <TimeComponent />
            <hr />
            <Lifecycle />
            <hr />
            <Props propA={123} propB="ABC">
                Child content
            </Props>
        </div>
    )
})
