import { defineComponent, evolve, ViewContext } from 'myra/core'
import * as jsxFactory from 'myra/core/jsxFactory'
import { Form, FormSubmissionResult } from 'myra/forms'

/**
 * State
 */
type FormValidationResult = any
type FormData = {
    formField?: string
    oninputDemo?: string
    onchangeDemo?: string
}
type State = {
    formData: FormData
    formValidationResult?: FormValidationResult
}
const init = evolve({
    formData: {}
})


/**
 * Updates
 */
const onFormSubmitUpdate = (state: State, r: FormSubmissionResult) =>
    evolve(state, m => {
        m.formData = r.formData
        m.formValidationResult = r.validationResult
    })

const oninputUpdate = (state: State, value: string) =>
    evolve(state, x => x.formData.oninputDemo = value)

const onchangeUpdate = (state: State, value: string) =>
    evolve(state, x => x.formData.onchangeDemo = value)


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
const view = (ctx: ViewContext<State>) =>
    <section>
        <h2>Form example</h2>
        <div>
            <h3>Form data:</h3>
            <dl>
                {
                    Object.keys(ctx.state.formData).map(name =>
                        [
                            <dt>{name}</dt>,
                            <dd>{(ctx.state.formData as any)[name]}</dd>
                        ]
                    )
                }
            </dl>
        </div>
        {
            ctx.state.formValidationResult ?
                <p>The form is {(ctx.state.formValidationResult.valid ? 'valid' : 'invalid')}</p>
                : <nothing />
        }
        <Form onsubmit={(result) => ctx.apply(onFormSubmitUpdate, result)}>
            <div class={!ctx.state.formValidationResult || ctx.state.formValidationResult.fields['formField'].valid ? 'form-group' : 'form-group has-error'}>
                <label for="formField">Just a form field</label>
                <input type="text"
                    id="formField"
                    name="formField"
                    validators={[required('Just a form field')]}
                    class="form-control" />
                {ctx.state.formValidationResult ?
                    <p class="help-text"> {(ctx.state.formValidationResult!.fields as any)['formField'].errors}</p>
                    : undefined}
            </div>
            <div class="form-group">
                <label for="oninputDemo">Oninput demo (optional)</label>
                <textarea id="oninputDemo"
                    name="oninputDemo"
                    class="form-control"
                    oninput={ctx.bind(oninputUpdate)} />
                <p class="help-text">The value of this field is: {ctx.state.formData.oninputDemo}</p>
            </div>
            <div class="form-group">
                <label for="onchangeDemo">Onchange demo (optional)</label>
                <select name="onchangeDemo"
                    id="onchangeDemo"
                    class="form-control"
                    onchange={ctx.bind(onchangeUpdate)}>
                    {
                        ['Choice A', 'Choice B', 'Choice C'].map(choice =>
                            <option>{choice}</option>
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
        </Form>
    </section>

/**
 * Component
 */
export const FormComponent = defineComponent({
    name: 'FormComponent',
    init: init,
    view: view
})