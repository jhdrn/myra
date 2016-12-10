import * as myra from 'myra'
import PropsComponent from './props'
import CounterComponent from './counter'
import HttpComponent from './http'
import TimeComponent from './time'
import RoutingComponent from './routing'


/**
 * View
 */
const view = () =>
    <div class="container">
        <h1>Kitchen sink demo</h1>
        <hr />
        <PropsComponent foo="a string prop" bar={123} />
        <hr />
        <CounterComponent />
        <hr />
        <HttpComponent />
        <hr />
        <TimeComponent />
        <hr />
        <RoutingComponent />
    </div>


/**
 * Component
 */
export default myra.defineComponent({
    // The name of the component. Used for debugging purposes.
    name: 'KitchenSinkApp',

    // Init takes either an initial model or a tuple of an initial model 
    // and one or more tasks to execute when the component is initialized.
    init: { state: undefined },

    // The view function is called after update. 
    view: view
})