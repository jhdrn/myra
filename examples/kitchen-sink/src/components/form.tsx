import { defineComponent, evolve } from 'myra/core'
import * as jsxFactory from 'myra/core/jsxFactory'
// import { InputGroupComponent } from './form/inputGroup'
import { bind, Form, FormSubmissionResult } from 'myra/forms'

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
        // m.formValidationResult = validationResult
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
 * Returns a function that receives the event, calls preventDefault() and 
 * passes the update argument trough.
 */
// function preventDefaultAnd<T>(update: T) {
//     return (ev: Event) => {
//         ev.preventDefault()
//         return update;
//     }
// }

/**
 * View
 */
const view = (state: State) =>
    <section>
        <h2>Form example</h2>
        <div>
            <h3>Form data:</h3>
            <dl>
                {
                    Object.keys(state.formData).map(name =>
                        [
                            <dt>{name}</dt>,
                            <dd>{(state.formData as any)[name]}</dd>
                        ]
                    )
                }
            </dl>
        </div>
        {
            state.formValidationResult ?
                <p>The form is{(state.formValidationResult.valid ? 'valid' : 'invalid')}</p>
                : <nothing />
        }
        <Form onsubmit={onFormSubmitUpdate}>
            <div class={!state.formValidationResult || state.formValidationResult.fields['formField'].valid ? 'form-group' : 'form-group has-error'}>
                <label for="formField">Just a form field</label>
                <input type="text"
                    id="formField"
                    name="formField"
                    validators={[required('Just a form field')]}
                    class="form-control" />
                {state.formValidationResult ?
                    <p class="help-text"> {(state.formValidationResult!.fields as any)['formField'].errors}</p>
                    : <nothing />}
            </div>
            {/*
            <InputGroupComponent id="oninputDemo1"
                name="oninputDemo1"
                class={!state.formValidationResult || state.formValidationResult.fields['oninputDemo1'].valid ? 'form-group' : 'form-group has-error'}
                label="Oninput demo 1"
                type="email"
                validate={[required('Oninput demo 1')]}
                oninput={() => oninputUpdate}>
                {state.formValidationResult ?
                    <p class="help-text"> {(state.formValidationResult!.fields as any)['oninputDemo1'].errors}</p>
                    : <nothing />}
            </InputGroupComponent>
        */}
            <div class="form-group">
                <label for="oninputDemo">Oninput demo (optional)</label>
                <textarea id="oninputDemo"
                    name="oninputDemo"
                    class="form-control"
                    oninput={bind(oninputUpdate)} />
                <p class="help-text">The value of this field is: {state.formData.oninputDemo}</p>
            </div>
            <div class="form-group">
                <label for="onchangeDemo">Onchange demo (optional)</label>
                <select name="onchangeDemo"
                    id="onchangeDemo"
                    class="form-control"
                    onchange={bind(onchangeUpdate)}>
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