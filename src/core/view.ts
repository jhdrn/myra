import { initComponent, updateComponent } from './component'
import { max } from './helpers'
import { Dispatch, Task, UpdateAny, EventListener, NodeDescriptor, ElementDescriptor, ComponentDescriptor } from './contract'

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

function nodesEqual(a: Node | undefined, b: Node) {
    return typeof a !== 'undefined' && (a === b || a.nodeType === Node.COMMENT_NODE && b.nodeType === Node.COMMENT_NODE && a.nodeValue === b.nodeValue)
}

/** Sets an attribute or event listener on an HTMLElement. */
function setAttr(element: HTMLElement, attributeName: string, attributeValue: any) {
    if (attributeName.indexOf('on') === 0) {
        const eventName = attributeName.split('_')[0]
        if ((element as any)[eventName]) {
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
    else if (attributeName !== 'validate') {
        element.setAttribute(attributeName, attributeValue)
    }
}

/** Removes an attribute or event listener from an HTMLElement. */
function removeAttr(a: string, node: Element) {
    const [eventName,] = a.substr(2).toLowerCase().split('_')
    if (a.indexOf('on') === 0) {
        (node as any)['on' + eventName.toLowerCase()] = null
    }
    else if (node.hasAttribute(a)) {
        node.removeAttribute(a)
    }
}

/** Creates an event listener */
function tryCreateEventListener(attributeName: string, eventListener: EventListener<any, any>, nodeDescriptor: ElementDescriptor<any>, dispatch: Dispatch) {
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

        const result = eventListener(ev, nodeDescriptor)

        if ((result as Task).execute) {
            (result as Task).execute((eventListener as any).__dispatch || (result as any).__dispatch || dispatch)
            return
        }

        if ((eventListener as any).__dispatch) {
            (eventListener as any).__dispatch(result as UpdateAny)
        }
        else if ((result as any).__dispatch) {
            (result as any).__dispatch(result)
        }
        else {
            dispatch(result as UpdateAny)
        }
    }
}


/** Creates a Node from a NodeDescriptor. */
function createNode(descriptor: NodeDescriptor, parentNode: Element, dispatch: Dispatch): Node {
    switch (descriptor.__type) {
        case 'element':
            return document.createElement(descriptor.tagName)
        case 'text':
            return document.createTextNode(descriptor.value)
        case 'component':
            initComponent(descriptor, parentNode, dispatch)
            return descriptor.node!
        case 'nothing':
            return document.createComment('Nothing')
    }
}

/** Returns true if the node should be replaced, given the new and old descriptors. */
function shouldReplaceNode(newDescriptor: NodeDescriptor, oldDescriptor: NodeDescriptor | undefined): boolean {
    if (!oldDescriptor) {
        return false
    }
    if (newDescriptor.__type !== oldDescriptor.__type) {
        return true
    }
    if (newDescriptor.__type === 'element' && oldDescriptor.__type === 'element') {
        const sameTagName = newDescriptor.tagName === oldDescriptor.tagName

        if (!sameTagName) {
            return true
        }
    }
    return false
}

function getAttributesToRemove(newDescriptor: ElementDescriptor<any>, oldDescriptor: NodeDescriptor, existingNode: Node) {
    const oldAttributeKeys = Object.keys((oldDescriptor as ElementDescriptor<any>).attributes)

    if (existingNode !== oldDescriptor.node) {
        return oldAttributeKeys
    }

    const newAttributeKeys = Object.keys(newDescriptor.attributes)
    return newAttributeKeys.filter(x => oldAttributeKeys.indexOf(x) === -1)
        .concat(oldAttributeKeys.filter(x => newAttributeKeys.indexOf(x) === -1 || x.indexOf('on') === 0))
}


/** Renders the view by walking the node descriptor tree recursively */
export function render(parentNode: Element, newDescriptor: NodeDescriptor, oldDescriptor: NodeDescriptor, existingNode: Node | undefined, dispatch: Dispatch): void {
    const replaceNode = shouldReplaceNode(newDescriptor, oldDescriptor)
    if (!existingNode || !oldDescriptor || replaceNode) {
        // if no existing node, create one
        const newNode = createNode(newDescriptor, parentNode, dispatch)

        newDescriptor.node = newNode

        if (replaceNode) {
            if (oldDescriptor.__type === 'element') {
                // Remove old event listeners before replacing the node. 
                Object.keys(oldDescriptor.attributes).filter(a => a.indexOf('on') === 0).forEach(a =>
                    removeAttr(a, existingNode as Element)
                )
            }

            parentNode.replaceChild(newNode, existingNode!)
        }
        else {
            parentNode.appendChild(newNode)
        }

        if (newDescriptor.__type === 'element') {

            for (const name in newDescriptor.attributes) {
                if (newDescriptor.attributes.hasOwnProperty(name)) {
                    const attributeValue = newDescriptor.attributes[name]
                    if (typeof attributeValue !== 'undefined') {
                        const eventListener = tryCreateEventListener(name, attributeValue, newDescriptor, dispatch)
                        setAttr(newNode as HTMLElement, name, eventListener || attributeValue)
                    }
                }
            }

            newDescriptor.children
                .filter(c => typeof c !== 'undefined')
                .forEach(c => render(newNode as Element, c, c, undefined, dispatch))
        }
    }
    else { // reuse the old node

        if (!nodesEqual(oldDescriptor.node, existingNode)) {
            // TODO: "debug mode" with logging
            // console.error('The view is not matching the DOM. Are outside forces tampering with it?')
            // console.error('Expected node:')
            // console.error(oldDescriptor.node)
            // console.error('Actual node:')
            // console.error(existingNode)
        }

        // update existing node
        switch (newDescriptor.__type) {
            case 'element':

                // remove any attributes that was added with the old node descriptor but does not exist in the new descriptor.
                getAttributesToRemove(newDescriptor, oldDescriptor, existingNode).forEach(a => {
                    removeAttr(a, existingNode as Element)
                })

                // update any attribute where the attribute value has changed
                for (const name in newDescriptor.attributes) {
                    if (newDescriptor.attributes.hasOwnProperty(name)) {
                        const attributeValue = newDescriptor.attributes[name]
                        const oldAttributeValue = (oldDescriptor as ElementDescriptor<any>).attributes[name]
                        if ((name.indexOf('on') === 0 || !(existingNode as Element).hasAttribute(name) ||
                            attributeValue !== oldAttributeValue) && typeof attributeValue !== 'undefined'
                        ) {
                            const eventListener = tryCreateEventListener(name, attributeValue, newDescriptor, dispatch)
                            setAttr(existingNode as HTMLElement, name, eventListener || attributeValue)
                        }
                        else if (typeof attributeValue === 'undefined' && (existingNode as Element).hasAttribute(name)) {
                            existingNode.attributes.removeNamedItem(name)
                        }
                    }
                }

                // Iterate over children and add/update/remove nodes
                const newDescriptorChildLengh = newDescriptor.children.length
                const oldDescriptorChildrenLength = oldDescriptor.__type === 'element' ? oldDescriptor.children.length : 0
                const maxIterations = max(newDescriptorChildLengh, oldDescriptorChildrenLength)

                let childDescriptorIndex = 0
                for (let i = 0; i < maxIterations; i++) {

                    const childNode = existingNode!.childNodes.item(childDescriptorIndex)

                    if (i < newDescriptorChildLengh) {
                        const childDescriptor = newDescriptor.children[i]

                        render(existingNode as Element, childDescriptor, oldDescriptor.__type === 'element' ? oldDescriptor!.children[i] : childDescriptor, childNode, dispatch)

                        childDescriptorIndex++
                    }
                    else if (childNode) {
                        existingNode.removeChild(childNode)
                    }
                }
                break
            case 'text':
                existingNode.textContent = newDescriptor.value
                break
            case 'component':
                updateComponent(newDescriptor, oldDescriptor as ComponentDescriptor<any>, dispatch)
                break
        }

        // add a reference to the node
        newDescriptor.node = existingNode

        if (newDescriptor !== oldDescriptor) {
            // clean up
            oldDescriptor.node = undefined
        }
    }
}