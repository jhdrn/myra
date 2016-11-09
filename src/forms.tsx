import { defineComponent, evolve } from './core'
import { Dispatch, Update, Map, ElementDescriptor, NodeDescriptor, InputAttributes } from './core/contract'
import * as jsxFactory from './core/jsxFactory'

export type FieldValidationResult = {
    readonly valid: boolean
    readonly errors: string[]
}
export type FormValidationResult = {
    readonly valid: boolean
    readonly errors: string[]
    readonly fields: { [name: string]: FieldValidationResult }
}
export type FieldValidator = (value: string) => FieldValidationResult
export type FormValidator = (value: Map<string>) => FormValidationResult

export interface ValidatableInputAttributes extends InputAttributes {
    validators?: FieldValidator[]
}

export function bind<S>(dispatch: Dispatch, update: Update<S, string>) {
    return (ev: Event, _descriptor: ElementDescriptor<any>) => {
        dispatch(update, (ev.target as HTMLInputElement).value)
    }
}

function validateFieldInternal(value: string, validators: FieldValidator[]) {
    return validators.reduce((acc, validator) => {
        const result = validator(value)
        if (!result.valid) {
            return {
                valid: false,
                errors: acc.errors.concat(result.errors)
            }
        }
        return acc
    }, { valid: true, errors: [] } as FieldValidationResult)
}

function validateFormInternal(formData: Map<string>, formValidators: FormValidator[], fieldValidators: Map<FieldValidator[]>): FormValidationResult {
    const formFields: Map<FieldValidationResult> = {}
    Object.keys(formData).forEach(k =>
        formFields[k] = fieldValidators[k] ? validateFieldInternal(formData[k], fieldValidators[k]) : {
            valid: true,
            errors: []
        }
    )

    return formValidators.reduce((acc, validator) => {
        const result = validator(formData)
        if (!result.valid) {
            return {
                valid: false,
                errors: acc.errors.concat(result.errors),
                fields: result.fields
            }
        }
        return acc
    }, {
        valid: Object.keys(formFields).map(k => formFields[k].valid).every(x => x),
        errors: [],
        fields: formFields
    } as FormValidationResult)
}


export function validateField(event: Event, nodeDescriptor: ElementDescriptor<any>) {
    const validators = (nodeDescriptor.attributes as ValidatableInputAttributes).validators
    let validationResult = validators ? validateFieldInternal((event.target as HTMLInputElement).value, Array.isArray(validators) ? validators : [validators]) : undefined
    return (event.target as HTMLInputElement).value, validationResult
}

function findFieldValidatorsRec(nodeDescriptors: NodeDescriptor[], fields: { [name: string]: FieldValidator[] }) {
    return nodeDescriptors.reduce((acc, descriptor) => {
        if (descriptor.__type === 'element') {
            const fieldName = (descriptor.attributes as InputAttributes).name
            const validators = (descriptor.attributes as ValidatableInputAttributes).validators
            if (fieldName && validators) {
                acc[fieldName] = Array.isArray(validators) ? validators : [validators]
            }
            findFieldValidatorsRec(descriptor.children, acc)
        }
        else if (descriptor.__type === 'component' && descriptor.rendition) {
            findFieldValidatorsRec([descriptor.rendition], acc)
        }
        return acc
    }, fields)
}

export function validateForm(event: Event, nodeDescriptor: ElementDescriptor<HTMLFormElement>) {
    return (formValidators: FormValidator[]) => {
        const namedElements = (event.target as HTMLFormElement).querySelectorAll('[name]')
        const formData: { [name: string]: string } = {}
        for (let i = 0; i < namedElements.length; i++) {
            const el = namedElements[i] as HTMLInputElement
            formData[el.name] = el.value
        }

        const fieldValidators = findFieldValidatorsRec(nodeDescriptor.children, {})
        const validationResult = validateFormInternal(formData, Array.isArray(formValidators) ? formValidators : [formValidators], fieldValidators)
        return { formData, validationResult }
    }
}

export type FormSubmissionResult = {
    formData: { [key: string]: string }
    validationResult: FormValidationResult
}

export type FormState = {
    onsubmit: Update<any, FormSubmissionResult>
    validators?: FormValidator[]
}

function handleOnSubmit(dispatch: Dispatch, state: FormState) {
    return (ev: Event, descriptor: ElementDescriptor<HTMLFormElement>) => {
        ev.preventDefault()
        const result = validateForm(ev, descriptor)(state.validators || [])
        dispatch((s: any, _: any) => {
            state.onsubmit(s, result)
            return evolve(state)
        })
    }
}

export const Form = defineComponent<FormState, FormState>({
    name: '__Form',
    init: {
        state: {} as any
    },
    onMount: (_s: FormState, args: FormState) => evolve(args),
    view: (ctx) =>
        <form onsubmit={handleOnSubmit(ctx.dispatch, ctx.state)}>
            {ctx.children}
        </form>
})