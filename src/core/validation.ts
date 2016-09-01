import { Map, FormValidator, FieldValidator, FormValidationResult, FieldValidationResult } from './contract'

export function validateField(value: string, validators: FieldValidator[]) {
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

export function validateForm(formData: Map<string>, formValidators: FormValidator[], fieldValidators: Map<FieldValidator[]>): FormValidationResult {
    const formFields: Map<FieldValidationResult> = {}
    Object.keys(formData).forEach(k => 
        formFields[k] = fieldValidators[k] ? validateField(formData[k], fieldValidators[k]) : {
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
    }, { valid: true, errors: [], fields: formFields } as FormValidationResult)
}
