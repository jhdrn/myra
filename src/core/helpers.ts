
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

/**
 * Creates a new object by shallow copying the arguments. The second argument's 
 * properties will have precedence over the first's. 
 * 
 * All non-primitive properties are copied by reference).
 */
export function evolve<T>(original: T, evolve: (obj: T) => void): T {
    const newValues = {} as T
    evolve(newValues)

    let result: any = {};
    for (let prop in original) {
        if (original.hasOwnProperty(prop)) {
            result[prop] = (original as any)[prop];
        }
    }
    for (let prop in newValues) {
        if (newValues.hasOwnProperty(prop)) {
            result[prop] = (newValues as any)[prop];
        }
    }
    return result as T;
}