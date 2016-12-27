import { initComponent, updateComponent, findAndUnmountComponentsRec } from './component'
import { max } from './helpers'
import { EventListener, VNode, ElementVNode, ComponentVNode } from './contract'

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

/** Renders the view by walking the virtual node tree recursively */
export function render(
    parentDomNode: Element,
    newVNode: VNode,
    oldVNode: VNode,
    existingDomNode: Node | undefined): void {

    const replaceNode = shouldReplaceNode(newVNode, oldVNode)
    if (replaceNode && oldVNode.__type === 3) {
        findAndUnmountComponentsRec(oldVNode)
    }

    if (typeof existingDomNode === 'undefined' || typeof oldVNode === 'undefined' || replaceNode) {
        renderNewNode(replaceNode, parentDomNode, newVNode, oldVNode, existingDomNode)
    }
    else { // reuse the old node
        reRenderNode(newVNode, oldVNode, existingDomNode)
    }
}

/** 
 * Renders a new virtual node by creating a new DOM node and attaching it to 
 * it's parent.
 */
function renderNewNode(replaceNode: boolean, parentDomNode: Element, newVNode: VNode, oldVNode: VNode, existingDomNode: Node | undefined) {
    // if no existing DOM node, create one
    const newNode = createNode(newVNode, parentDomNode)

    newVNode.domRef = newNode

    if (replaceNode) {
        if (oldVNode.__type === 2) {
            // Remove old event listeners before replacing the node. 
            for (const attr in oldVNode.props) {
                if (attr.indexOf('on') === 0) {
                    removeAttr(attr, existingDomNode as Element)
                }
            }
        }

        parentDomNode.replaceChild(newNode, existingDomNode!)
    }
    else {
        parentDomNode.appendChild(newNode)
    }

    if (newVNode.__type === 2) {

        for (const name in newVNode.props) {
            const attributeValue = (newVNode.props as any)[name]

            if (typeof attributeValue !== 'undefined') {

                const eventListener = tryCreateEventListener(name, attributeValue, newVNode)

                let value
                if (typeof eventListener === 'undefined') {
                    value = attributeValue
                }
                else {
                    value = eventListener
                }

                setAttr(
                    newNode as HTMLElement,
                    name,
                    value
                )
            }
        }

        for (const c of newVNode.children) {
            if (typeof c !== 'undefined') {
                render(newNode as Element, c, c, undefined)
            }
        }
    }
}

/** Re-renders a virtual node by reusing a DOM node. */
function reRenderNode(newVNode: VNode, oldVNode: VNode, existingDomNode: Node) {

    // if (!nodesEqual(oldVNode.node, existingDomNode)) {
    //     // TODO: "debug mode" with logging
    //     // console.error('The view is not matching the DOM. Are outside forces tampering with it?')
    //     // console.error('Expected node:')
    //     // console.error(oldVNode.node)
    //     // console.error('Actual node:')
    //     // console.error(existingDomNode)
    // }

    // update existing node
    switch (newVNode.__type) {
        case 2:
            updateElementAttributes(newVNode, oldVNode, existingDomNode)
            renderChildNodes(newVNode, oldVNode, existingDomNode)
            break
        case 1:
            existingDomNode.textContent = newVNode.value
            break
        case 3:
            updateComponent(newVNode, oldVNode as ComponentVNode<any>)
            break
    }

    if (typeof newVNode.domRef === 'undefined') {
        // add a reference to the node
        newVNode.domRef = existingDomNode
    }

    if (newVNode !== oldVNode) {
        // clean up
        oldVNode.domRef = undefined
    }
}

/** Renders child virtual nodes. Will add/remove DOM nodes if needed. */
function renderChildNodes(newVNode: ElementVNode<any>, oldVNode: VNode, existingDomNode: Node) {

    // Iterate over children and add/update/remove nodes
    const noOfNewVNodeChildren = newVNode.children.length
    const noOfOldVNodeChildren = oldVNode.__type === 2 ? oldVNode.children.length : 0
    const maxIterations = max(noOfNewVNodeChildren, noOfOldVNodeChildren)

    let childVNodeIndex = 0
    let childDomNode: Node | null = existingDomNode.firstChild
    let childVNode: VNode

    for (let i = 0; i < maxIterations; i++) {
        if (i < noOfNewVNodeChildren) {

            childVNode = newVNode.children[i]

            const oldChildVNode = findOldChildVNode(childVNode, oldVNode, i)
            if (typeof oldChildVNode.domRef !== 'undefined' && oldChildVNode.domRef !== childDomNode) {
                existingDomNode.insertBefore(oldChildVNode.domRef, childDomNode)
            }
            else if (childDomNode !== null) {
                childDomNode = childDomNode!.nextSibling
            }

            render(existingDomNode as Element, childVNode, oldChildVNode, oldChildVNode.domRef)

            childVNodeIndex++
        }
        else if (childDomNode !== null) {
            const oldChildVNode = (oldVNode as ElementVNode<any>).children[i]

            // Make sure that any components are unmounted correctly
            findAndUnmountComponentsRec(oldChildVNode)

            // Get a reference to the next sibling before the child node is
            // removed.
            const nextDomSibling = childDomNode.nextSibling

            existingDomNode.removeChild(childDomNode)

            childDomNode = nextDomSibling
        }

    }
}

/** 
 * Tries to find an old "keyed" virtual node that matches the new virtual node. 
 */
function findOldChildVNode(newChildVNode: VNode, oldVNode: VNode, childIndex: number) {

    if (oldVNode.__type !== 2 && oldVNode.__type !== 3) {
        return newChildVNode
    }

    const oldChildVNode = oldVNode.children[childIndex]
    if (typeof oldChildVNode === 'undefined') {
        return newChildVNode
    }
    else if (typeof newChildVNode !== 'undefined') {

        const mayBeKeyed = newChildVNode.__type === 2 && oldChildVNode.__type === 2
            || newChildVNode.__type === 3 && oldChildVNode.__type === 3

        if (mayBeKeyed
            && (newChildVNode as ElementVNode<any>).props.key !== (oldChildVNode as ElementVNode<any>).props.key) {

            let child: ElementVNode<any>
            for (let i = 0; i < oldVNode.children.length; i++) {

                child = oldVNode.children[i] as ElementVNode<any>

                if (child.__type === newChildVNode.__type && child.props.key === (newChildVNode as ElementVNode<any>).props.key) {
                    return child
                }
            }
        }
    }

    return oldChildVNode
}

/** 
 * Returns true if the node should be replaced, given the new and old virtual 
 * nodes. 
 */
function shouldReplaceNode(newVNode: VNode, oldVNode: VNode | undefined): boolean {
    if (typeof oldVNode === 'undefined') {
        return false
    }
    else if (newVNode.__type !== oldVNode.__type) {
        return true
    }
    else if (newVNode.__type === 2 && oldVNode.__type === 2 &&
        newVNode.tagName !== oldVNode.tagName) {
        return true
    }
    else if (newVNode.__type === 3 && oldVNode.__type === 3 &&
        newVNode.name !== oldVNode.name) {
        return true
    }
    return false
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
    else if (attributeName === 'value' && (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT')) {
        (element as HTMLInputElement).value = attributeValue
    }
    else if (BOOL_ATTRS.indexOf(attributeName) >= 0) {
        (element as any)[attributeName] = !!attributeValue
    }
    else if (attributeValue && (attributeName === 'blur' || attributeName === 'click' || attributeName === 'focus')) {
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

/** Creates an event listener if the attribute name begins with 'on'. */
function tryCreateEventListener(attributeName: string, eventListener: EventListener<any, any>, vNode: ElementVNode<any>) {
    if (attributeName.indexOf('on') !== 0) {
        return undefined
    }

    return (ev: Event) => {
        eventListener(ev, ev.target, vNode)
    }
}

/** Creates a Node from a VNode. */
function createNode(vNode: VNode, parentNode: Element): Node {
    switch (vNode.__type) {
        case 2:
            return document.createElement(vNode.tagName)
        case 1:
            return document.createTextNode(vNode.value)
        case 3:
            initComponent(vNode, parentNode)
            return vNode.domRef!
        case 0:
            return document.createComment('Nothing')
    }
}

function getAttributesToRemove(newVNode: ElementVNode<any>, oldVNode: VNode) {
    const attributesToRemove = [] as string[]
    for (const attributeName in (oldVNode as ElementVNode<any>).props) {
        if (typeof (newVNode.props as any)[attributeName] === 'undefined' || attributeName.indexOf('on') === 0) {
            attributesToRemove.push(attributeName)
        }
    }
    return attributesToRemove
}

function updateElementAttributes(newVNode: ElementVNode<any>, oldVNode: VNode, existingDomNode: Node) {
    // remove any attributes that was added with the old virtual node but does 
    // not exist in the new virtual node.
    for (const attr of getAttributesToRemove(newVNode, oldVNode)) {
        removeAttr(attr, existingDomNode as Element)
    }

    let attributeValue: any
    let oldAttributeValue: any
    let eventListener: EventListener<any, any> | undefined
    let newValue: any

    // update any attribute where the attribute value has changed
    for (const name in newVNode.props) {

        attributeValue = (newVNode.props as any)[name]
        oldAttributeValue = ((oldVNode as ElementVNode<any>).props as any)[name]

        if ((name.indexOf('on') === 0 || attributeValue !== oldAttributeValue ||
            !(existingDomNode as Element).hasAttribute(name)) && typeof attributeValue !== 'undefined'
        ) {
            eventListener = tryCreateEventListener(name, attributeValue, newVNode)

            if (typeof eventListener === 'undefined') {
                newValue = attributeValue
            }
            else {
                newValue = eventListener
            }

            setAttr(
                existingDomNode as HTMLElement,
                name,
                newValue
            )
        }
        else if (typeof attributeValue === 'undefined' && (existingDomNode as Element).hasAttribute(name)) {
            (existingDomNode as Element).removeAttribute(name)
        }
    }
}
