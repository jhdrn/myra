import * as myra from '../../../../src/myra'

import StatelessComponent from './stateless-component'
import CounterComponent from './counter'
import HttpComponent from './http'
import TimeComponent from './time'
import { ErrorComponent } from './error'
import { Lifecycle } from './lifecycle'
import { Props } from './props'


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
