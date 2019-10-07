import { VNODE, VNodeType } from "./contract"

export type Type = 'array' | 'object' | 'string' | 'date' | 'regexp' | 'function' | 'boolean' | 'number' | 'null' | 'undefined'

/**
 * Better "typeof" which identifies arrays.
 */
export function typeOf(obj: any): Type {
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
        if (Object.keys(a).length !== Object.keys(b).length) {
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
    return false
}

export function equalProps(a: Record<string, any>, b: Record<string, any>): boolean {
    if (Object.keys(a).length !== Object.keys(b).length) {
        return false
    }
    for (const k in a) {
        if (a.hasOwnProperty(k)) {
            const aProp = a[k]
            const bProp = b[k]
            if (k === 'children') {
                const children = a[k]
                if (children.length !== b[k].length) {
                    return false
                }

                for (let i = 0; i < children.length; i++) {
                    const aChild = children[i]
                    const bChild = b[k][i]
                    if (aChild.$ === VNODE && bChild.$ === VNODE && aChild._ === bChild._) {
                        if (aChild._ === VNodeType.Component || aChild._ === VNodeType.Element) {
                            return equalProps(aChild.props, bChild.props)
                        }
                        else if (aChild._ === VNodeType.Text) {
                            return aChild.value === bChild.value
                        }
                    }
                    return false
                }
            }
            else if (aProp !== undefined && bProp !== undefined && aProp.$ === VNODE && bProp.$ === VNODE) {
                if (aProp._ === bProp._) {
                    if (aProp._ === VNodeType.Component || aProp._ === VNodeType.Element) {
                        return equalProps(aProp.props, bProp.props)
                    }
                    else if (aProp._ === VNodeType.Text) {
                        return aProp.value === bProp.value
                    }
                }
                return false
            } else if (!equal(aProp, bProp)) {
                return false
            }
        }
    }
    return true
}
