import { initComponent, updateComponent } from './component'
import { max } from './helpers'
import { EventListener, NodeDescriptor, ElementDescriptor, ComponentDescriptor } from './contract'

const INPUT_TAG_NAMES = [
    'INPUT',
    'TEXTAREA',
    'SELECT'
]

const BOOL_ATTRS = [
    'checked',
    'disabled',
    'hidden',
    'autofocus',
    'required',
    'selected',
    'multiple',
    'draggable',
    // TODO: add more
]

const CALLABLE_ATTRS = [
    'blur',
    'click',
    'focus'
]

const KEY_MAP = {
    backspace: 8,
    tab: 9,
    enter: 13,
    escape: 27,
    space: 32
} as { [key: string]: number }

// function nodesEqual(a: Node | undefined, b: Node) {
//     return typeof a !== 'undefined' && (a === b || a.nodeType === Node.COMMENT_NODE && b.nodeType === Node.COMMENT_NODE && a.nodeValue === b.nodeValue)
// }

/** Sets an attribute or event listener on an HTMLElement. */
function setAttr(element: HTMLElement, attributeName: string, attributeValue: any) {
    if (attributeName.indexOf('on') === 0) {
        const eventName = attributeName.split('_')[0]
        if (typeof (element as any)[eventName] === 'function') {
            // If there is a previous event listener, wrap it and the new one in
            // a function calling both.
            const prevListener = (element as any)[eventName]
                ; (element as any)[eventName] = (ev: Event) => {
                    prevListener(ev)
                    attributeValue(ev)
                }
        }
        else {
            ; (element as any)[eventName] = attributeValue
        }
    }
    else if (attributeName === 'value' && INPUT_TAG_NAMES.indexOf(element.tagName) >= 0) {
        (element as HTMLInputElement).value = attributeValue
    }
    else if (BOOL_ATTRS.indexOf(attributeName) >= 0) {
        (element as any)[attributeName] = !!attributeValue
    }
    else if (attributeValue && CALLABLE_ATTRS.indexOf(attributeName) >= 0) {
        (element as any)[attributeName]()
    }
    else if (typeof attributeValue !== 'function' && typeof attributeValue !== 'object') {
        element.setAttribute(attributeName, attributeValue)
    }
}

/** Removes an attribute or event listener from an HTMLElement. */
function removeAttr(a: string, node: Element) {
    if (a.indexOf('on') === 0) {
        (node as any)[a.toLowerCase().split('_')[0]] = null
    }
    else if (node.hasAttribute(a)) {
        node.removeAttribute(a)
    }
}

/** Creates an event listener */
function tryCreateEventListener(attributeName: string, eventListener: EventListener<any, any>, nodeDescriptor: ElementDescriptor<any>) {
    if (attributeName.indexOf('on') !== 0) {
        return undefined
    }

    const [eventName, key] = attributeName.substr(2).toLowerCase().split('_')
    const isKeyboardEvent = ['keyup', 'keypress', 'keydown'].indexOf(eventName) >= 0
    let keyCode: number | undefined = undefined
    if (isKeyboardEvent && typeof key !== 'undefined') {
        keyCode = parseInt(key)
        if (isNaN(keyCode)) {
            keyCode = KEY_MAP[key as string]
        }
        if (typeof keyCode === 'undefined') {
            throw `Unhandled key '${key}'. Use a key code instead, for example keyup_65 for 'a'.`
        }
    }

    return (ev: Event) => {

        if (isKeyboardEvent) {
            const eventKeyCode = (ev as KeyboardEvent).which || (ev as KeyboardEvent).keyCode || 0
            if (typeof key !== 'undefined' && eventKeyCode !== keyCode) {
                return
            }
        }

        eventListener(ev, nodeDescriptor)
    }
}


/** Creates a Node from a NodeDescriptor. */
function createNode(descriptor: NodeDescriptor, parentNode: Element): Node {
    switch (descriptor.__type) {
        case 2:
            return document.createElement(descriptor.tagName)
        case 1:
            return document.createTextNode(descriptor.value)
        case 3:
            initComponent(descriptor, parentNode)
            return descriptor.node!
        case 0:
            return document.createComment('Nothing')
    }
}

function getAttributesToRemove(newDescriptor: ElementDescriptor<any>, oldDescriptor: NodeDescriptor) {
    const attributesToRemove = [] as string[]
    for (const attributeName in (oldDescriptor as ElementDescriptor<any>).attributes) {
        if (typeof newDescriptor.attributes[attributeName] === 'undefined' || attributeName.indexOf('on') === 0) {
            attributesToRemove.push(attributeName)
        }
    }
    return attributesToRemove
}

function renderNewNode(replaceNode: boolean, parentNode: Element, newDescriptor: NodeDescriptor, oldDescriptor: NodeDescriptor, existingNode: Node | undefined) {
    // if no existing node, create one
    const newNode = createNode(newDescriptor, parentNode)

    newDescriptor.node = newNode

    if (replaceNode) {
        if (oldDescriptor.__type === 2) {
            // Remove old event listeners before replacing the node. 
            for (const attr in oldDescriptor.attributes) {
                if (attr.indexOf('on') === 0) {
                    removeAttr(attr, existingNode as Element)
                }
            }
        }

        parentNode.replaceChild(newNode, existingNode!)
    }
    else {
        parentNode.appendChild(newNode)
    }

    if (newDescriptor.__type === 2) {

        for (const name in newDescriptor.attributes) {
            if (newDescriptor.attributes.hasOwnProperty(name)) {
                const attributeValue = newDescriptor.attributes[name]
                if (typeof attributeValue !== 'undefined') {
                    const eventListener = tryCreateEventListener(name, attributeValue, newDescriptor)
                    setAttr(newNode as HTMLElement, name, eventListener || attributeValue)
                }
            }
        }
        for (const c of newDescriptor.children) {
            if (typeof c !== 'undefined') {
                render(newNode as Element, c, c, undefined)
            }
        }
    }
}

function updateElementAttributes(newDescriptor: ElementDescriptor<any>, oldDescriptor: NodeDescriptor, existingNode: Node) {
    // remove any attributes that was added with the old node descriptor but does not exist in the new descriptor.
    for (const attr of getAttributesToRemove(newDescriptor, oldDescriptor)) {
        removeAttr(attr, existingNode as Element)
    }

    let attributeValue: any;
    let oldAttributeValue: any;
    let eventListener: EventListener<any, any> | undefined

    // update any attribute where the attribute value has changed
    for (const name in newDescriptor.attributes) {
        if (newDescriptor.attributes.hasOwnProperty(name)) {
            attributeValue = newDescriptor.attributes[name]
            oldAttributeValue = (oldDescriptor as ElementDescriptor<any>).attributes[name]
            if ((name.indexOf('on') === 0 || attributeValue !== oldAttributeValue ||
                !(existingNode as Element).hasAttribute(name)) && typeof attributeValue !== 'undefined'
            ) {
                eventListener = tryCreateEventListener(name, attributeValue, newDescriptor)
                setAttr(existingNode as HTMLElement, name, typeof eventListener === 'undefined' ? attributeValue : eventListener)
            }
            else if (typeof attributeValue === 'undefined' && (existingNode as Element).hasAttribute(name)) {
                (existingNode as Element).removeAttribute(name)
            }
        }
    }
}

function renderChildNodes(newDescriptor: ElementDescriptor<any>, oldDescriptor: NodeDescriptor, existingNode: Node) {

    // Iterate over children and add/update/remove nodes
    const newDescriptorChildLengh = newDescriptor.children.length
    const oldDescriptorChildrenLength = oldDescriptor.__type === 2 ? oldDescriptor.children.length : 0
    const maxIterations = max(newDescriptorChildLengh, oldDescriptorChildrenLength)

    let childDescriptorIndex = 0
    let childNode: Node
    let childDescriptor: NodeDescriptor

    for (let i = 0; i < maxIterations; i++) {

        childNode = existingNode!.childNodes[childDescriptorIndex]

        if (i < newDescriptorChildLengh) {
            childDescriptor = newDescriptor.children[i]

            render(existingNode as Element, childDescriptor, oldDescriptor.__type === 2 ? oldDescriptor!.children[i] : childDescriptor, childNode)

            childDescriptorIndex++
        }
        else if (typeof childNode !== 'undefined') {
            existingNode.removeChild(childNode)
        }
    }
}
/** Returns true if the node should be replaced, given the new and old descriptors. */
function shouldReplaceNode(newDescriptor: NodeDescriptor, oldDescriptor: NodeDescriptor | undefined): boolean {
    if (typeof oldDescriptor === 'undefined') {
        return false
    }
    else if (newDescriptor.__type !== oldDescriptor.__type) {
        return true
    }
    else if (newDescriptor.__type === 2 && oldDescriptor.__type === 2 &&
        newDescriptor.tagName !== oldDescriptor.tagName) {
        return true
    }
    else if (newDescriptor.__type === 3 && oldDescriptor.__type === 3 &&
        newDescriptor.name !== oldDescriptor.name) {
        return true
    }
    return false
}

// function equalDescriptors(a: NodeDescriptor, b: NodeDescriptor) {
//     if (a.__type !== b.__type) {
//         return false
//     }
//     else if (a.__type === 2) {
//         if (a.tagName !== (b as ElementDescriptor<any>).tagName) {
//             return false
//         }
//         else if (a.children.length !== (b as ElementDescriptor<any>).children.length) {
//             return false
//         }
//         else if (!equal(a.attributes, (b as ElementDescriptor<any>).attributes)) {
//             return false
//         }
//         for (let i = 0; i < a.children.length; i++) {
//             if (!equalDescriptors(a.children[i], (b as ElementDescriptor<any>).children[i])) {
//                 return false
//             }
//         }
//     }
//     else if (a.__type === 1) {
//         return a.value === (b as TextDescriptor).value
//     }
//     return true
// }

function reRenderNode(newDescriptor: NodeDescriptor, oldDescriptor: NodeDescriptor, existingNode: Node) {

    // if (!nodesEqual(oldDescriptor.node, existingNode)) {
    //     // TODO: "debug mode" with logging
    //     // console.error('The view is not matching the DOM. Are outside forces tampering with it?')
    //     // console.error('Expected node:')
    //     // console.error(oldDescriptor.node)
    //     // console.error('Actual node:')
    //     // console.error(existingNode)
    // }

    // update existing node
    switch (newDescriptor.__type) {
        case 2:
            updateElementAttributes(newDescriptor, oldDescriptor, existingNode)
            renderChildNodes(newDescriptor, oldDescriptor, existingNode)
            break
        case 1:
            existingNode.textContent = newDescriptor.value
            break
        case 3:
            updateComponent(newDescriptor, oldDescriptor as ComponentDescriptor<any>)
            break
    }

    // add a reference to the node
    newDescriptor.node = existingNode

    if (newDescriptor !== oldDescriptor) {
        // clean up
        oldDescriptor.node = undefined
    }
}

/** Renders the view by walking the node descriptor tree recursively */
export function render(parentNode: Element, newDescriptor: NodeDescriptor, oldDescriptor: NodeDescriptor, existingNode: Node | undefined): void {
    const replaceNode = shouldReplaceNode(newDescriptor, oldDescriptor)
    if (typeof existingNode === 'undefined' || typeof oldDescriptor === 'undefined' || replaceNode) {
        renderNewNode(replaceNode, parentNode, newDescriptor, oldDescriptor, existingNode)
    }
    else { // reuse the old node
        reRenderNode(newDescriptor, oldDescriptor, existingNode)
    }
}