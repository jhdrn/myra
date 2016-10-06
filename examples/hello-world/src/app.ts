import { Update, View, defineComponent, mountComponent } from 'myra/core'
import { p } from 'myra/html/elements'


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
const view: View<Model> = (model) => p(model)


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
mountComponent(appComponent, document.body)