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
        for (const k of Object.keys(a as object)) {
            // Use Object.prototype.hasOwnProperty.call for safety
            if (Object.prototype.hasOwnProperty.call(a, k)) {
                if (!equal((a as Record<string, unknown>)[k], (b as Record<string, unknown>)[k])) {
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
        for (let i = 0; i < (a as unknown[]).length; i++) {
            if (!equal((a as unknown[])[i], (b as unknown[])[i])) {
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

// Helper for safe dynamic property access
export function getPropValue<T extends object>(obj: T, key: string): unknown {
    if (key in obj) {
        return obj[key as keyof T]
    } else {
        return (obj as unknown as Record<string, unknown>)[key]
    }
}

export function createDocumentFragmentNode(): DocumentFragment {
    return document.createDocumentFragment()
}

export function appendElementChild(parentElement: Element, newNode: Node) {
    parentElement.appendChild(newNode)
}

export function elementContainsNode(parentElement: Element, node: Node) {
    return parentElement.contains(node)
}

export function insertElementChildBefore(parentElement: Element, newNode: Node, beforeChild: Node | null) {
    parentElement.insertBefore(newNode, beforeChild)
}

export function replaceElementChild(parentElement: Element, newChild: Node, oldChild: Node) {
    parentElement.replaceChild(newChild, oldChild)
}

export function removeElementChild(parentElement: Element, oldDOMNode: Node) {
    parentElement.removeChild(oldDOMNode)
}

/** 
 * Removes an attribute or event listener from an HTMLElement. 
 */
export function removeElementAttribute(a: string, el: Element) {
    if (a.indexOf('on') === 0) {
        (el as unknown as Record<string, unknown>)[a] = null
    }
    else if (el.hasAttribute(a)) {
        el.removeAttribute(a)
    }
}

/** 
 * Sets an attribute or event listener on an Element. 
 */
export function setElementAttribute(el: Element, attributeName: string, attributeValue: string) {
    // The the "value" attribute shoud be set explicitly (and only if it has 
    // changed) to prevent jumping cursors in some browsers (Safari)
    if (attributeName === 'value' && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT')) {
        if ((el as HTMLInputElement).value !== attributeValue) {
            (el as HTMLInputElement).value = attributeValue
        }
    }
    else if (attributeName in el) {
        try {
            (el as unknown as Record<string, unknown>)[attributeName] = attributeValue
            return
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        catch (_) {
            /** Ignore and use setAttribute instead  */
        }
    }

    const attrValueType = typeof attributeValue
    if (attrValueType !== 'function' && attrValueType !== 'object') {
        el.setAttribute(attributeName, attributeValue)
    }
}
