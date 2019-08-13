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
            <StatelessComponent forceUpdate test="a value">
                {['asd', <p>Fpoo</p>, ['bar']]}
            </StatelessComponent>
            <hr />
            <CounterComponent forceUpdate />
            <hr />
            <HttpComponent forceUpdate />
            <hr />
            <ErrorComponent forceUpdate />
            <hr />
            <TimeComponent forceUpdate />
            <hr />
            <Lifecycle forceUpdate />
            <hr />
            <Props forceUpdate propA={123} propB="ABC" />
        </div>
    )
})
