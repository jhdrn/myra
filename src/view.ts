import { initComponent, updateComponent, findAndUnmountComponentsRec } from './component'
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

/** Renders the view by walking the node descriptor tree recursively */
export function render(
    parentNode: Element,
    newDescriptor: NodeDescriptor,
    oldDescriptor: NodeDescriptor,
    existingNode: Node | undefined): void {

    const replaceNode = shouldReplaceNode(newDescriptor, oldDescriptor)
    if (replaceNode && oldDescriptor.__type === 3) {
        findAndUnmountComponentsRec(oldDescriptor)
    }

    if (typeof existingNode === 'undefined' || typeof oldDescriptor === 'undefined' || replaceNode) {
        renderNewNode(replaceNode, parentNode, newDescriptor, oldDescriptor, existingNode)
    }
    else { // reuse the old node
        reRenderNode(newDescriptor, oldDescriptor, existingNode)
    }
}

/** Sets an attribute or event listener on an HTMLElement. */
function setAttr(element: HTMLElement, attributeName: string, attributeValue: any) {
    if (attributeName.indexOf('on') === 0) {
        if (typeof (element as any)[attributeName] === 'function') {
            // If there is a previous event listener, wrap it and the new one in
            // a function calling both.
            const prevListener = (element as any)[attributeName]
                ; (element as any)[attributeName] = (ev: Event) => {
                    prevListener(ev)
                    attributeValue(ev)
                }
        }
        else {
            ; (element as any)[attributeName] = attributeValue
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
        (node as any)[a] = null
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

    return (ev: Event) => {
        eventListener(ev, ev.target, nodeDescriptor)
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
        if (typeof (newDescriptor.attributes as any)[attributeName] === 'undefined' || attributeName.indexOf('on') === 0) {
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
                const attributeValue = (newDescriptor.attributes as any)[name]
                if (typeof attributeValue !== 'undefined') {
                    const eventListener = tryCreateEventListener(name, attributeValue, newDescriptor)
                    setAttr(
                        newNode as HTMLElement,
                        name,
                        typeof eventListener === 'undefined' ? attributeValue : eventListener
                    )
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

    let attributeValue: any
    let oldAttributeValue: any
    let eventListener: EventListener<any, any> | undefined

    // update any attribute where the attribute value has changed
    for (const name in newDescriptor.attributes) {
        if (newDescriptor.attributes.hasOwnProperty(name)) {
            attributeValue = (newDescriptor.attributes as any)[name]
            oldAttributeValue = ((oldDescriptor as ElementDescriptor<any>).attributes as any)[name]
            if ((name.indexOf('on') === 0 || attributeValue !== oldAttributeValue ||
                !(existingNode as Element).hasAttribute(name)) && typeof attributeValue !== 'undefined'
            ) {
                eventListener = tryCreateEventListener(name, attributeValue, newDescriptor)
                setAttr(
                    existingNode as HTMLElement,
                    name,
                    typeof eventListener === 'undefined' ? attributeValue : eventListener
                )
            }
            else if (typeof attributeValue === 'undefined' && (existingNode as Element).hasAttribute(name)) {
                (existingNode as Element).removeAttribute(name)
            }
        }
    }
}

function findOldChildDescriptor(childDescriptor: NodeDescriptor, oldDescriptor: NodeDescriptor, childIndex: number) {
    if (oldDescriptor.__type === 2 || oldDescriptor.__type === 3) {
        const oldChildDescriptor = oldDescriptor.children[childIndex]
        if (typeof childDescriptor !== 'undefined' && typeof oldChildDescriptor !== 'undefined') {
            if (childDescriptor.__type === 2 && oldChildDescriptor.__type === 2
                && childDescriptor.attributes.key !== oldChildDescriptor.attributes.key) {
                let child: ElementDescriptor<any>
                for (let i = 0; i < oldDescriptor.children.length; i++) {
                    child = oldDescriptor.children[i] as ElementDescriptor<any>
                    if (child.__type === 2 && child.attributes.key === childDescriptor.attributes.key) {
                        return child
                    }
                }
            }
            else if (childDescriptor.__type === 3 && oldChildDescriptor.__type === 3
                && childDescriptor.props.key !== oldChildDescriptor.props.key) {
                let child: ComponentDescriptor<any>
                for (let i = 0; i < oldDescriptor.children.length; i++) {
                    child = oldDescriptor.children[i] as ComponentDescriptor<any>
                    if (child.__type === 3 && child.props.key === childDescriptor.props.key) {
                        return child
                    }
                }
            }
        }
        else if (typeof oldChildDescriptor === 'undefined') {
            return childDescriptor
        }

        return oldChildDescriptor
    }
    return childDescriptor
}


function renderChildNodes(newDescriptor: ElementDescriptor<any>, oldDescriptor: NodeDescriptor, existingNode: Node) {

    // Iterate over children and add/update/remove nodes
    const newDescriptorChildLengh = newDescriptor.children.length
    const oldDescriptorChildrenLength = oldDescriptor.__type === 2 ? oldDescriptor.children.length : 0
    const maxIterations = max(newDescriptorChildLengh, oldDescriptorChildrenLength)
    let childDescriptorIndex = 0
    let childNode: Node | null = null
    let childDescriptor: NodeDescriptor

    for (let i = 0; i < maxIterations; i++) {

        childNode = i < oldDescriptorChildrenLength ? existingNode!.childNodes[childDescriptorIndex] : null

        if (i < newDescriptorChildLengh) {
            childDescriptor = newDescriptor.children[i]

            const oldChildDescriptor = findOldChildDescriptor(childDescriptor, oldDescriptor, i)
            if (typeof oldChildDescriptor.node !== 'undefined' && oldChildDescriptor.node !== childNode) {
                existingNode.insertBefore(
                    oldChildDescriptor.node,
                    typeof childNode !== 'undefined' ? childNode : null
                )
            }

            render(existingNode as Element, childDescriptor, oldChildDescriptor, oldChildDescriptor.node)
            childDescriptorIndex++
        }
        else if (childNode !== null) {
            const oldChildDescriptor = (oldDescriptor as ElementDescriptor<any>).children[i]
            findAndUnmountComponentsRec(oldChildDescriptor)
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