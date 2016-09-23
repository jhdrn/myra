import { defineComponent, evolve, FormValidationResult } from 'myra/core'
import * as jsxFactory from 'myra/html/jsxFactory'


/**
 * Model
 */
type FormData = {
    formField?: string
    oninputDemo?: string
    onchangeDemo?: string
}
type Model = {
    formData: FormData
    formValidationResult?: FormValidationResult
}
const init: Model = {
    formData: {}
}


/**
 * Updates
 */
const onFormSubmitUpdate = (model: Model, formData: FormData, validationResult: FormValidationResult) => 
    evolve(model, m => {
        m.formData = formData
        m.formValidationResult = validationResult
    })

const oninputUpdate = (model: Model, value: string) => 
    evolve(model, m => m.formData = evolve(m.formData, x => x.oninputDemo = value))

const onchangeUpdate = (model: Model, value: string) => 
    evolve(model, m => m.formData = evolve(m.formData, x => x.onchangeDemo = value))


/**
 * Validation
 */
const required = (label: string) => (value: string) => ({ 
    valid: !!value,
    errors: [`'${label}' is required`]
})


/**
 * View
 */
const view = (m: Model) =>
    <section>
        <h2>Form example</h2>
        <div>
            <h3>Form data:</h3>
            <dl>
                { 
                    Object.keys(m.formData).map(name => 
                        [
                            <dt>{ name }</dt>, 
                            <dd>{ (m.formData as any)[name] }</dd>
                        ]
                    ) 
                }
            </dl>
        </div>
        {
            m.formValidationResult ?
                <p>The form is{(m.formValidationResult.valid ? 'valid' : 'invalid')}</p>
                : <nothing />
        }
        <form onsubmit={{ listener: onFormSubmitUpdate, preventDefault: true }}>
            <div class={!m.formValidationResult || m.formValidationResult.fields['formField'].valid ? 'form-group' : 'form-group has-error'}>
                <label for="formField">Just a form field</label>
                <input type="text"
                       id="formField"
                       name="formField"
                       validate={[required('Just a form field')]}
                       class="form-control" />
                {m.formValidationResult ? 
                    <p class="help-text"> {(m.formValidationResult!.fields as any)['formField'].errors}</p>
                    : <nothing />}
            </div>
            <div class="form-group">
                <label for="oninputDemo">Oninput demo (optional)</label>
                <textarea id="oninputDemo"
                          name="oninputDemo"
                          class="form-control"
                          oninput={ oninputUpdate } />
                <p class="help-text">The value of this field is: { m.formData.oninputDemo }</p>
            </div>
            <div class="form-group">
                <label for="onchangeDemo">Onchange demo (optional)</label>
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
export const FormComponent = defineComponent({
    name: 'FormComponent',
    init: init,
    view: view
})