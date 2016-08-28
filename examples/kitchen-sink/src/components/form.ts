import { defineComponent, evolve } from 'myra/core'
import { section, div, h2, h3, form, p, dl, dt, dd, label, input, select, option, button } from 'myra/html/elements'


/**
 * Model
 */
type FormData = {
    oninputDemo?: string
    onchangeDemo?: string
}
type Model = {
    formData: FormData
}
const init: Model = {
    formData: {}
}


/**
 * Updates
 */
const onFormSubmitUpdate = (model: Model, formData: FormData) => 
    evolve(model, m => m.formData = formData)

const oninputUpdate = (model: Model, value: string) => 
    evolve(model, m => m.formData = evolve(m.formData, x => x.oninputDemo = value))

const onchangeUpdate = (model: Model, value: string) => 
    evolve(model, m => m.formData = evolve(m.formData, x => x.onchangeDemo = value))


/**
 * View
 */
const renderFormData = (formData: FormData) => 
    div(
        h3('Form data:'),
        dl(Object.keys(formData).map(name => 
            [
                dt(name), 
                dd((formData as any)[name])
            ]
        ))
    )

const view = (model: Model) =>
    section(
        h2('Form example'),
        renderFormData(model.formData),
        form({ onsubmit: { listener: onFormSubmitUpdate, preventDefault: true } },
            div({ 'class': 'form-group' },
                label({ for: 'formField' }, 'Just a form field'),
                input({ type: 'text',
                        id: 'formField',
                        name: 'formField',
                        'class': 'form-control' })
            ),
            div({ 'class': 'form-group' },
                label({ for: 'oninputDemo' }, 'Oninput demo'),
                input({ type: 'text',
                        id: 'oninputDemo',
                        name: 'oninputDemo',
                        'class': 'form-control',
                        oninput: oninputUpdate }),
                p({ 'class': 'help-text' }, `The value of this field is: ${model.formData.oninputDemo}`)
            ),
            div({ 'class': 'form-group' },
                label({ for: 'onchangeDemo' }, 'Onchange demo'),
                select({ id: 'onchangeDemo',
                         name: 'onchangeDemo',
                         'class': 'form-control',
                         onchange: onchangeUpdate },
                    ...['Choice A', 'Choice B', 'Choice C'].map(c => option(c)) 
                )
            ),
            div(
                button({ type: 'submit', 'class': 'btn btn-primary' },
                    'Submit'
                )
            )
        )
    )


/**
 * Component
 */
export const formComponent = defineComponent({
    name: 'FormComponent',
    init: init,
    view: view
})