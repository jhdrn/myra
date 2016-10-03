import { defineComponent, NodeDescriptor } from 'myra/core'
import * as jsxFactory from 'myra/html/jsxFactory'


/**
 * Model
 */
type Model = {
    label: string,
    type: 'text' | 'number' | 'email'
    id: string
    name: string
}
const init: Model = {
    label: '',
    type: 'text',
    id: '',
    name: ''
}


/**
 * Updates
 */
const mount = (_model: Model, args: Model) => args


/**
 * View
 */
const view = (model: Model, children?: NodeDescriptor[]) => 
    <div class="form-group">
        <label for={model.id}>{model.label}</label>
        <input {...model}
               class="form-control" />
        { children ? children : <nothing /> }
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

    mount: mount,

    // The view function is called after update. 
    view: view
})