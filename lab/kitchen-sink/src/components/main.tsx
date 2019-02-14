import * as myra from '../../../../src/myra'

import StatelessComponent from './stateless-component'
import CounterComponent from './counter'
import HttpComponent from './http'
import TimeComponent from './time'
import { ErrorComponent } from './error'


/**
 * View
 */
export const MainComponent = () =>
    <div class="container">
        <h1>Kitchen sink demo</h1>
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
    </div>
