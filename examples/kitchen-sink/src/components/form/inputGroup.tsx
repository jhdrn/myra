import { defineComponent, evolve, NodeDescriptor } from 'myra/core'
import * as jsxFactory from 'myra/core/jsxFactory'


/**
 * Model
 */
type State = {
    label: string
    type: 'text' | 'number' | 'email'
    id: string
    name: string
    'class': string
}
const init = {
    label: '',
    type: 'text',
    id: '',
    name: '',
    'class': ''
}


/**
 * Updates
 */
const mount = (_model: State, args: State) => evolve(args)


/**
 * View
 */
const view = (state: State, children?: NodeDescriptor[]) =>
    <div class={state.class}>
        <label for={state.id}>{state.label}</label>
        <input {...state}
            class="form-control" />
        {children ? children : <nothing />}
    </div>


/**
 * Component
 */
export const InputGroupComponent = defineComponent({
    // The name of the component. Used for debugging purposes.
    name: 'InputGroup',

    // Init takes either an initial model or a tuple of an initial model 
    // and one or more tasks to execute when the component is initialized.
    init: { state: init },

    onMount: mount,

    // The view function is called after update. 
    view: view
})