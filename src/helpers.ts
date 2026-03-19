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

/**
 * Does a deep equality check.
 */
export function equal<T>(a: T, b: T): boolean {
    if (a === b) {
        return true
    }
    const ta = typeOf(a)
    if (ta !== typeOf(b)) {
        return false
    }
    if (ta === 'array') {
        const aa = a as unknown as unknown[]
        const ba = b as unknown as unknown[]
        return aa.length === ba.length && aa.every((v, i) => equal(v, ba[i]))
    }
    if (ta === 'object') {
        const ka = Object.keys(a as object)
        return ka.length === Object.keys(b as object).length &&
            ka.every(k => equal((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k]))
    }
    if (ta === 'date') {
        return (a as unknown as Date).getTime() === (b as unknown as Date).getTime()
    }
    if (ta === 'regexp') {
        return (a as unknown as RegExp).toString() === (b as unknown as RegExp).toString()
    }
    return false
}
