import { defineComponent } from 'myra/core'
import { section, h2, button } from 'myra/html/elements'

/**
 * Model
 */
type Model = number
const init: Model = 0


/**
 * Updates
 */
const increase = (model: Model) => model + 1
const decrease = (model: Model) => model - 1


/**
 * View
 */
const view = (model: Model) => 
    section(
        h2('Counter example'),
        button({ type: 'button',
                 'class': 'btn btn-sm btn-default',
                 onclick: increase }, '+'),
                
        model.toString(),
        
        button({ type: 'button',
                 'class': 'btn btn-sm btn-default',
                 onclick: decrease }, '-')
    )


/**
 * Component
 */
export const counterComponent = defineComponent({
    // The name of the component. Used for debugging purposes.
    name: 'CounterComponent',

    // Init takes either an initial model or a tuple of an initial model 
    // and one or more tasks to execute when the component is initialized.
    init: init,

    // The view function is called after update. 
    view: view
})