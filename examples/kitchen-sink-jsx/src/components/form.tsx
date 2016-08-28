import { defineComponent, evolve } from 'myra/core'
import * as jsxFactory from 'myra/html/jsxFactory'


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
    <div>
        <h3>Form data:</h3>
        <dl>
            { 
                Object.keys(formData).map(name => 
                    [
                        <dt>{ name }</dt>, 
                        <dd>{ (formData as any)[name] }</dd>
                    ]
                ) 
            }
        </dl>
    </div>

const view = (model: Model) =>
    <section>
        <h2>Form example</h2>
        { renderFormData(model.formData) }
        <form onsubmit={{ listener: onFormSubmitUpdate, preventDefault: true }}>
            <div class="form-group">
                <label for="formField">Just a form field</label>
                <input type="text"
                       id="formField"
                       name="formField"
                       class="form-control" />
            </div>
            <div class="form-group">
                <label for="oninputDemo">Oninput demo</label>
                <input type="text"
                       id="oninputDemo"
                       name="oninputDemo"
                       class="form-control"
                       oninput={ oninputUpdate } />
                <p class="help-text">The value of this field is: { model.formData.oninputDemo }</p>
            </div>
            <div class="form-group">
                <label for="onchangeDemo">Onchange demo</label>
                <select name="onchangeDemo"
                        id="onchangeDemo"
                        class="form-control"
                        onchange={ onchangeUpdate }>
                    { 
                        ['Choice A', 'Choice B', 'Choice C'].map(choice =>
                            <option>{ choice }</option>
                        ) 
                    }
                </select>
            </div>
            <div>
                <button type="submit"
                        class="btn btn-primary">
                    Submit
                </button>
            </div>
        </form>
    </section>


/**
 * Component
 */
export const formComponent = defineComponent({
    name: 'FormComponent',
    init: init,
    view: view
})