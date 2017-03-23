export const isIE9 = document.all && !window.atob

export type Type = 'array' | 'object' | 'string' | 'date' | 'regexp' | 'function' | 'boolean' | 'number' | 'null' | 'undefined'

/**
 * Better "typeof" which identifies arrays.
 */
export function typeOf(obj: any): Type {
    if (typeof obj === 'string') {
        return 'string'
    }
    if (typeof obj === 'number') {
        return 'number'
    }
    if (typeof obj === 'boolean') {
        return 'boolean'
    }
    if (typeof obj === 'function') {
        return 'function'
    }
    if (typeof obj === 'undefined') {
        return 'undefined'
    }
    if (obj === null) {
        return 'null'
    }
    return ({}).toString.call(obj).slice(8, -1).toLowerCase()
}

/**
 * Returns the maximum value of a and b.
 */
export function max(a: number, b: number): number {
    return a > b ? a : b
}

/**
 * Does a deep equality check.
 */
export function equal<T>(a: T, b: T): boolean {
    const typeOfA = typeOf(a)
    const typeOfB = typeOf(b)
    if (['string', 'number', 'boolean', 'undefined', 'null'].indexOf(typeOfA) >= 0) {
        return a === b
    }
    else if (typeOfA === 'object' && typeOfB === 'object') {
        if (Object.keys(a).length !== Object.keys(b).length) {
            return false
        }
        for (const k in a) {
            if (a.hasOwnProperty(k)) {
                if (!equal((a as any)[k], (b as any)[k])) {
                    return false
                }
            }
        }
        return true
    }
    else if (typeOfA === 'array' && typeOfB === 'array') {
        if ((a as any as Array<any>).length !== (b as any as Array<any>).length) {
            return false
        }
        for (const i in a) {
            if (!equal((a as any as Array<any>)[i as any], (b as any as Array<any>)[i as any])) {
                return false
            }
        }
        return true
    }
    else if (typeOfA === 'date' && typeOfB === 'date') {
        return (a as any as Date).getTime() === (b as any as Date).getTime()
    }
    else if (typeOfA === 'regexp' && typeOfB === 'regexp') {
        return (a as any).toString() === (b as any).toString()
    }
    // Functions?
    return false
}

/**
 * Flattens multidimensional arrays into a one dimensional.
 */
export function flatten<T>(arg: T[]): T[] {
    return arg.reduce((acc, x) => {
        if (Array.isArray(x)) {
            return acc.concat(flatten(x))
        }
        acc.push(x)
        return acc
    }, [] as T[])
}