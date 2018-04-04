/** @internal */
import { initComponent, updateComponent, findAndUnmountComponentsRec } from './component'
import { VNode, ElementVNode } from './contract'
import { VNODE_COMPONENT, VNODE_ELEMENT, VNODE_TEXT, VNODE_FUNCTION, VNODE_NONE } from './constants';

/** 
 * Renders the view by walking the virtual node tree recursively 
 */
export function render(
    parentDomNode: Element,
    newVNode: VNode,
    oldVNode: VNode | undefined,
    existingDomNode: Node | undefined,
    isSvg = false): void {

    const replaceNode = shouldReplaceNode(newVNode, oldVNode)

    // If it's a component node and i should be replaced, unmount any components
    if (replaceNode && oldVNode!._ === VNODE_COMPONENT) {
        findAndUnmountComponentsRec(oldVNode!)
    }

    if ((newVNode as ElementVNode<any>).tagName === 'svg') {
        isSvg = true
    }

    if (existingDomNode === undefined || oldVNode === undefined || replaceNode) {

        // if no existing DOM node, create one
        const newNode = createNode(newVNode, parentDomNode, isSvg)

        newVNode.domRef = newNode

        if (replaceNode) {
            // If it's an element node remove old event listeners before 
            // replacing the node. 
            if (oldVNode!._ === VNODE_ELEMENT) {
                for (const attr in (oldVNode as ElementVNode<any>).props) {
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

        // If it's an element node set attributes and event listeners
        if (newVNode._ === VNODE_ELEMENT) {

            for (const name in newVNode.props) {
                const attributeValue = (newVNode.props as any)[name]

                if (attributeValue !== undefined) {
                    setAttr(
                        newNode as HTMLElement,
                        name,
                        attributeValue
                    )
                }
            }

            for (const c of newVNode.children) {
                if (c !== undefined) {
                    render(newNode as Element, c, c, undefined, isSvg)
                }
            }
        }
    }
    else { // reuse the old node

        // if (!nodesEqual(oldVNode.node, existingDomNode)) {
        //     // TODO: "debug mode" with warnings
        //     // console.error('The view is not matching the DOM. Are outside forces tampering with it?')
        // }

        // update existing node
        switch (newVNode._) {
            case VNODE_ELEMENT: // element node
                updateElementAttributes(newVNode, oldVNode, existingDomNode)
                renderChildNodes(newVNode, oldVNode as ElementVNode<any>, existingDomNode as Element, isSvg)
                break
            case VNODE_TEXT: // text node
                existingDomNode.textContent = newVNode.value
                break
            case VNODE_COMPONENT: // component node
            case VNODE_FUNCTION: // stateless component node
                updateComponent(parentDomNode, newVNode, oldVNode as any, isSvg)
                break
        }

        if (newVNode.domRef === undefined) {
            // add a reference to the node
            newVNode.domRef = existingDomNode
        }

        if (newVNode !== oldVNode) {
            // clean up
            oldVNode.domRef = undefined
        }
    }
}

function renderChildNodes(newParentVNode: ElementVNode<any>, oldParentVNode: ElementVNode<any>, parentDomNode: Element, isSvg: boolean) {

    const noOfNewChildNodes = newParentVNode.children.length
    const noOfOldChildNodes = oldParentVNode.children.length
    const diffNoOfChildNodes = noOfOldChildNodes - noOfNewChildNodes
    let newChildVNode: VNode
    let oldChildVNode: VNode
    let oldChildDomNode: Node | null
    let existingChildDomNode: Node | undefined
    let newChildVNodeKey: string | undefined
    let oldChildVNodeKey: string | undefined
    let oldChildVNodeIndex: number
    let keyMap: Record<string, [VNode, number] | undefined> | undefined
    let keyMapEntry: [VNode, number] | undefined
    const unkeyedNodes: Node[] = []

    for (let i = 0; i < noOfNewChildNodes; i++) {
        newChildVNode = newParentVNode.children[i]
        oldChildVNode = oldParentVNode.children[i]
        existingChildDomNode = undefined

        if ((newChildVNode as ElementVNode<any>).props !== undefined
            && oldParentVNode !== undefined
            && oldParentVNode.children.length > 0) {

            newChildVNodeKey = (newChildVNode as ElementVNode<any>).props.key

            if (newChildVNodeKey !== undefined) {
                if (oldChildVNode !== undefined
                    && (oldChildVNode as ElementVNode<any>).props !== undefined) {

                    oldChildVNodeKey = (oldChildVNode as ElementVNode<any>).props.key
                }
                else {
                    oldChildVNodeKey = undefined
                }

                if (newChildVNodeKey !== oldChildVNodeKey) {

                    if (keyMap === undefined) {
                        // Create a map holding references to all the old child 
                        // VNodes indexed by key    
                        let child: ElementVNode<any>

                        keyMap = {}

                        // Prepare the map with the keys from the new nodes
                        for (let i = 0; i < newParentVNode.children.length; i++) {
                            child = newParentVNode.children[i] as ElementVNode<any>
                            if (child.props !== undefined && child.props !== null && child.props.key !== undefined) {
                                keyMap[child.props.key] = undefined
                            }
                        }

                        let newIndex = 0
                        for (let i = 0; i < oldParentVNode.children.length; i++) {
                            child = oldParentVNode.children[i] as ElementVNode<any>
                            if (child.props !== undefined && child.props !== null && child.props.key !== undefined) {
                                // If the key has been added (from a new node), update it's value
                                if (child.props.key in keyMap) {
                                    keyMap[child.props.key] = [child, newIndex]
                                    newIndex++
                                }
                                // else "store" the node for reuse
                                else if (parentDomNode.contains(child.domRef)) {
                                    unkeyedNodes.push(child.domRef)
                                }
                            }
                        }
                    }

                    keyMapEntry = keyMap[newChildVNodeKey]

                    // If there was no old matching key, reuse an old unkeyed node
                    if (keyMapEntry === undefined) {
                        existingChildDomNode = unkeyedNodes.shift()
                    }
                    // If there was a matching key, use the old vNodes dom ref
                    else {
                        [oldChildVNode, oldChildVNodeIndex] = keyMapEntry
                        if (oldChildVNodeIndex !== i) {
                            existingChildDomNode = oldChildVNode.domRef
                        }
                    }

                    // Move the existing dom node to it's new position
                    if (existingChildDomNode !== undefined) {
                        oldChildDomNode = parentDomNode.childNodes.item(i)
                        if (existingChildDomNode !== oldChildDomNode) {
                            if (parentDomNode.contains(existingChildDomNode)) {
                                parentDomNode.replaceChild(existingChildDomNode, oldChildDomNode)
                            }
                            else {
                                parentDomNode.insertBefore(existingChildDomNode, oldChildDomNode)
                            }
                        }
                    }
                }
            }
        }

        if (oldChildVNode !== undefined && existingChildDomNode === undefined) {
            existingChildDomNode = oldChildVNode.domRef
        }

        render(parentDomNode, newChildVNode, oldChildVNode, existingChildDomNode, isSvg)
    }

    if (unkeyedNodes.length > 0) {
        for (let i = 0; i < unkeyedNodes.length; i++) {
            parentDomNode.removeChild(unkeyedNodes[i])
        }
    }

    if (diffNoOfChildNodes > 0) {
        // Remove old unused nodes
        for (let i = noOfNewChildNodes + diffNoOfChildNodes - 1; i > noOfNewChildNodes - 1; i--) {
            oldChildVNode = oldParentVNode.children[i]

            // Make sure any sub-components are "unmounted"
            findAndUnmountComponentsRec(oldChildVNode)

            oldChildDomNode = parentDomNode.lastChild
            if (oldChildDomNode !== null) {
                parentDomNode.removeChild(oldChildDomNode)
            }
        }
    }
}

/** 
 * Returns true if the node should be replaced, given the new and old virtual 
 * nodes. 
 */
function shouldReplaceNode(newVNode: VNode, oldVNode: VNode | undefined): boolean {
    if (oldVNode === undefined || oldVNode.domRef === undefined) {
        return false
    }
    else if (newVNode._ !== oldVNode._) {
        return true
    }
    else if (newVNode._ === VNODE_ELEMENT && oldVNode._ === VNODE_ELEMENT &&
        newVNode.tagName !== oldVNode.tagName) {
        return true
    }
    else if (newVNode._ === VNODE_COMPONENT && oldVNode._ === VNODE_COMPONENT &&
        newVNode.spec !== oldVNode.spec) {
        return true
    }
    return false
}

/** 
 * Sets an attribute or event listener on an HTMLElement. 
 */
function setAttr(element: HTMLElement, attributeName: string, attributeValue: any) {
    if (attributeValue === true && (attributeName === 'click' || attributeName === 'blur' || attributeName === 'focus')) {
        (element as any)[attributeName]()
        return
    }
    else if (attributeName in element) {
        try {
            (element as any)[attributeName] = attributeValue
            return
        }
        catch (_) {
            /** Ignore and use setAttribute instead  */
        }
    }

    const attrValueType = typeof attributeValue
    if (attrValueType !== 'function' && attrValueType !== 'object') {
        element.setAttribute(attributeName, attributeValue)
    }
}

/** 
 * Removes an attribute or event listener from an HTMLElement. 
 */
function removeAttr(a: string, node: Element) {
    if (a.indexOf('on') === 0) {
        (node as any)[a] = null
    }
    else if (node.hasAttribute(a)) {
        node.removeAttribute(a)
    }
}

/** 
 * Creates a Node from a VNode. 
 */
function createNode(vNode: VNode, parentNode: Element, isSvg: boolean): Node {
    switch (vNode._) {
        case VNODE_ELEMENT:
            if (isSvg) {
                return document.createElementNS('http://www.w3.org/2000/svg', vNode.tagName)
            }
            return document.createElement(vNode.tagName)
        case VNODE_TEXT:
            return document.createTextNode(vNode.value)
        case VNODE_COMPONENT:
        case VNODE_FUNCTION:
            return initComponent(parentNode, vNode, isSvg)
        case VNODE_NONE:
            return document.createComment('Nothing')
    }
}

function getAttributesToRemove(newVNode: ElementVNode<any>, oldVNode: VNode) {
    const attributesToRemove = [] as string[]
    for (const attributeName in (oldVNode as ElementVNode<any>).props) {
        if ((newVNode.props as any)[attributeName] === undefined || attributeName.indexOf('on') === 0) {
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
    let hasAttr: boolean

    // update any attribute where the attribute value has changed
    for (const name in newVNode.props) {

        attributeValue = (newVNode.props as any)[name]
        oldAttributeValue = ((oldVNode as ElementVNode<any>).props as any)[name]
        hasAttr = (existingDomNode as Element).hasAttribute(name)

        if ((name.indexOf('on') === 0 || attributeValue !== oldAttributeValue ||
            !hasAttr) && attributeValue !== undefined
        ) {
            setAttr(
                existingDomNode as HTMLElement,
                name,
                attributeValue
            )
        }
        else if (attributeValue === undefined && hasAttr) {
            (existingDomNode as Element).removeAttribute(name)
        }
    }
}
