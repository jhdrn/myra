
export const isIE9 = document.all && !window.atob

export type Type = 'array' | 'object' | 'string' | 'date' | 'regexp' | 'function' | 'boolean' | 'number' | 'null' | 'undefined'

export function typeOf(obj: any): Type {
    return ({}).toString.call(obj).slice(8, -1).toLowerCase()
} 

export function max(a: number, b: number): number { 
    return a > b ? a : b
} 

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
            return false;
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
    // FIXME: functions?
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

export function deepCopy<T>(value: T): T {
    const type = typeOf(value)
    switch (type) {
        case 'array':
            return (value as any as Array<any>).map(x => deepCopy(x)) as any as T
        case 'object':
            const copy = {}
            for (const key in value) {
                if (value.hasOwnProperty(key)) {
                    (copy as any)[key] = deepCopy((value as any)[key])
                }
            }
            return copy as T
        case 'date':
            return new Date((value as any as Date).valueOf()) as any as T
        case 'function':
            throw 'Copying functions are not allowed'
        default:
            return value
    }
}

/**
 * Creates a new object by deep copying "original". The evolve function is used 
 * to update the copy with new data.
 */
export function evolve<T>(original: T, evolve: (obj: T) => void): T {
    const copy = deepCopy(original)
    evolve(copy)
    return copy
}