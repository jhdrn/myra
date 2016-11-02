import { defineComponent, mountComponent, evolve } from 'myra/core'
import * as jsxFactory from 'myra/core/jsxFactory'


/**
 * Model
 */
type State = string | undefined
const init: State = undefined


/**
 * Update 
 */
const mount = (_: State) => evolve('Hello world!')


/**
 * View
 */
const view = (state: State) => <p>{state}</p>


/**
 * Define a component
 */
const appComponent = defineComponent({
    name: 'HelloWorldApp',
    init: { state: init },
    onMount: mount,
    view: view
})


/**
 * Mount the component
 */
mountComponent(appComponent, document.body)
