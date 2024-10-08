export type Type = 'array' | 'object' | 'string' | 'date' | 'regexp' | 'function' | 'boolean' | 'number' | 'null' | 'undefined'

/**
 * Better "typeof" which identifies arrays.
 */
export function typeOf(obj: unknown): Type {
    const objType = typeof obj
    if (objType === 'string' || objType === 'number' || objType === 'boolean' || objType === 'function') {
        return objType
    }
    if (obj === undefined) {
        return 'undefined'
    }
    if (obj === null) {
        return 'null'
    }
    return ({}).toString.call(obj).slice(8, -1).toLowerCase() as Type
}

const basicEqualityTypes = ['string', 'number', 'boolean', 'undefined', 'null', 'function']

/**
 * Does a deep equality check.
 */
export function equal<T>(a: T, b: T): boolean {
    const typeOfA = typeOf(a)
    const typeOfB = typeOf(b)
    if (basicEqualityTypes.indexOf(typeOfA) >= 0) {
        return a === b
    }
    else if (typeOfA === 'object' && typeOfB === 'object') {
        if (a === b) {
            return true
        }
        if (Object.keys(a as object).length !== Object.keys(b as object).length) {
            return false
        }
        for (const k in a) {
            if ((a as Object).hasOwnProperty(k)) {
                if (!equal((a as any)[k], (b as any)[k])) {
                    return false
                }
            }
        }
        return true
    }
    else if (typeOfA === 'array' && typeOfB === 'array') {
        if (a === b) {
            return true
        }
        if ((a as unknown as Array<unknown>).length !== (b as unknown as Array<unknown>).length) {
            return false
        }
        for (const i in a) {
            if (!equal((a as unknown as Array<unknown>)[i as any], (b as unknown as Array<unknown>)[i as any])) {
                return false
            }
        }
        return true
    }
    else if (typeOfA === 'date' && typeOfB === 'date') {
        return (a as unknown as Date).getTime() === (b as unknown as Date).getTime()
    }
    else if (typeOfA === 'regexp' && typeOfB === 'regexp') {
        return (a as unknown as RegExp).toString() === (b as unknown as RegExp).toString()
    }
    else if (typeOfA === typeOfB) {
        return a === b
    }
    return false
}
