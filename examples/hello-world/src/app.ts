import { Update, View, defineComponent } from 'myra/core'
import { div } from 'myra/html/elements'


/**
 * Model
 */
type Model = string | undefined
const model: Model = undefined


/**
 * Update 
 */
const mount: Update<Model, any> = (_) => 'Hello world!'


/**
 * View
 */
const view: View<Model> = (model) => div(model)


/**
 * Define a component
 */
const appComponent = defineComponent({
    name: 'HelloWorldApp',
    init: model,
    mount: mount,
    view: view
})


/**
 * Mount the component
 */
appComponent().mount(document.body)