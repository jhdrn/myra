import * as myra from 'myra'

import PropsComponent from './props'
import StatelessComponent from './stateless-component'
import CounterComponent from './counter'
import HttpComponent from './http'
import TimeComponent from './time'
import RoutingComponent from './routing'


/**
 * View
 */
export default myra.define({}, () =>
    <div class="container">
        <h1>Kitchen sink demo</h1>
        <hr />
        <PropsComponent foo="a string prop" bar={123} />
        <hr />
        <StatelessComponent test="a value" />
        <hr />
        <CounterComponent />
        <hr />
        <HttpComponent />
        <hr />
        <TimeComponent />
        <hr />
        <RoutingComponent />
    </div>)