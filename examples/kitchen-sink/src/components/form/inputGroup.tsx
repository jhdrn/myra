import { defineComponent, evolve, NodeDescriptor } from 'myra/core'
import * as jsxFactory from 'myra/html/jsxFactory'


/**
 * Model
 */
type Model = {
    label: string
    type: 'text' | 'number' | 'email'
    id: string
    name: string
    'class': string
}
const init = evolve({
    label: '',
    type: 'text',
    id: '',
    name: '',
    'class': ''
})


/**
 * Updates
 */
const mount = (_model: Model, args: Model) => evolve(args)


/**
 * View
 */
const view = (model: Model, children?: NodeDescriptor[]) =>
    <div class={model.class}>
        <label for={model.id}>{model.label}</label>
        <input {...model}
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
    init: init,

    onMount: mount,

    // The view function is called after update. 
    view: view
})