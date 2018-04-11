/** @internal */
import { initComponent, updateComponent, findAndUnmountComponentsRec } from './component'
import { VNode, ElementVNode } from './contract'
import { VNODE_COMPONENT, VNODE_ELEMENT, VNODE_TEXT, VNODE_FUNCTION, VNODE_NONE } from './constants';

const ACTION_APPEND = 1
const ACTION_INSERT = 2
const ACTION_REPLACE = 3
const ACTION_UPDATE = 4

export type RenderingAction = undefined | 1 | 2 | 3 | 4

export function render(
    parentDomNode: Element,
    newVNode: VNode,
    oldVNode: VNode | undefined,
    existingDomNode: Node | undefined,
    isSvg = false,
    action: RenderingAction = undefined
) {

    if (action === undefined) {
        // Decide what action to take
        if (oldVNode === undefined || oldVNode.domRef === undefined) {
            action = ACTION_APPEND
        }
        else if (oldVNode.domRef !== undefined && existingDomNode === undefined) {
            action = ACTION_INSERT
        }
        else if (newVNode._ !== oldVNode._) {
            action = ACTION_REPLACE
        }
        else if (newVNode._ === VNODE_ELEMENT && oldVNode._ === VNODE_ELEMENT &&
            newVNode.tagName !== oldVNode.tagName) {
            action = ACTION_REPLACE
        }
        else if (newVNode._ === VNODE_COMPONENT && oldVNode._ === VNODE_COMPONENT &&
            newVNode.spec !== oldVNode.spec) {
            action = ACTION_REPLACE
        }
        else {
            action = ACTION_UPDATE
        }
    }

    if ((newVNode as ElementVNode<any>).tagName === 'svg') {
        isSvg = true
    }

    switch (action) {
        case ACTION_APPEND:

            let newNode = createNode(newVNode, parentDomNode, isSvg)
            newVNode.domRef = newNode

            parentDomNode.appendChild(newNode)

            tryBuildElement(newVNode, newNode, isSvg, ACTION_APPEND)

            break
        case ACTION_INSERT:
            newNode = createNode(newVNode, parentDomNode, isSvg)
            newVNode.domRef = newNode

            parentDomNode.insertBefore(newNode, oldVNode!.domRef)

            tryBuildElement(newVNode, newNode, isSvg, ACTION_APPEND)
            break
        case ACTION_REPLACE:

            newNode = createNode(newVNode, parentDomNode, isSvg)
            newVNode.domRef = newNode

            // If it's a component node or an element node and it should be 
            // replaced, unmount any components in the tree.
            if (oldVNode!._ === VNODE_COMPONENT || oldVNode!._ === VNODE_ELEMENT) {
                findAndUnmountComponentsRec(oldVNode!)
            }

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

            tryBuildElement(newVNode, newNode, isSvg, undefined)

            break
        case ACTION_UPDATE:
            // if (!nodesEqual(oldVNode.node, existingDomNode)) {
            //     // TODO: "debug mode" with warnings
            //     // console.error('The view is not matching the DOM. Are outside forces tampering with it?')
            // }

            // update existing node
            switch (newVNode._) {
                case VNODE_ELEMENT: // element node

                    updateElementAttributes(newVNode, oldVNode!, existingDomNode!)

                    const newChildVNodes = newVNode.children
                    const oldChildVNodes = (oldVNode as ElementVNode<any>).children
                    let diffNoOfChildNodes = oldChildVNodes.length - newChildVNodes.length
                    let oldChildVNode: VNode
                    let oldChildDomNode: Node | null = null

                    if (newVNode.children.length > 0) {
                        // Set up some variables before running the child re-render algorithm
                        let newChildVNode: VNode
                        let existingChildDomNode: Node | undefined
                        let newChildVNodeKey: string | undefined
                        let oldChildVNodeIndex: number
                        let keyMapEntry: [VNode, number] | undefined
                        let childAction: RenderingAction
                        const unkeyedNodes: Node[] = []

                        // Create a map holding references to all the old child 
                        // VNodes indexed by key    
                        const keyMap: Record<string, [VNode, number] | undefined> = {}

                        // Prepare the map with the keys from the new nodes
                        for (let i = 0; i < newChildVNodes.length; i++) {
                            newChildVNode = newChildVNodes[i] as ElementVNode<any>
                            if (newChildVNode.props !== undefined && newChildVNode.props !== null && newChildVNode.props.key !== undefined) {
                                keyMap[newChildVNode.props.key] = undefined
                            }
                        }

                        // Go through the old child VNodes to see if there are any old ones matching the new VNodes
                        let newIndex = 0
                        for (let i = 0; i < oldChildVNodes.length; i++) {
                            oldChildVNode = oldChildVNodes[i] as ElementVNode<HTMLElement>
                            if (oldChildVNode.props !== undefined && oldChildVNode.props !== null && oldChildVNode.props.key !== undefined) {
                                // If the key has been added (from a new VNode), update it's value
                                if (oldChildVNode.props.key in keyMap) {
                                    keyMap[oldChildVNode.props.key] = [oldChildVNode, newIndex]
                                    newIndex++
                                }
                                // else save the DOM node for reuse or removal
                                else if (existingDomNode!.contains(oldChildVNode.domRef!)) {
                                    unkeyedNodes.push(oldChildVNode.domRef!)
                                }
                            }
                        }

                        // S
                        for (let i = 0; i < newChildVNodes.length; i++) {
                            newChildVNode = newChildVNodes[i]
                            oldChildVNode = oldChildVNodes[i]
                            childAction = undefined

                            if (oldChildVNode !== undefined) {
                                existingChildDomNode = oldChildVNode.domRef
                                oldChildDomNode = oldChildVNode.domRef
                            }

                            if ((newChildVNode as ElementVNode<any>).props !== undefined
                                && oldChildVNodes.length > 0) {

                                newChildVNodeKey = (newChildVNode as ElementVNode<any>).props.key

                                if (newChildVNodeKey !== undefined) {

                                    keyMapEntry = keyMap[newChildVNodeKey]

                                    // If there was no old matching key, reuse an old unkeyed node
                                    if (keyMapEntry === undefined) {
                                        existingChildDomNode = unkeyedNodes.shift()
                                        if (existingChildDomNode !== undefined) {
                                            childAction = ACTION_REPLACE
                                        }
                                    }
                                    // If there was a matching key, use the old vNodes dom ref
                                    else {
                                        [oldChildVNode, oldChildVNodeIndex] = keyMapEntry
                                        existingChildDomNode = oldChildVNode.domRef
                                    }

                                    // Move the existing dom node to it's new position
                                    if (existingChildDomNode !== undefined) {
                                        if (existingChildDomNode !== oldChildDomNode) {
                                            if (oldChildDomNode === null) {
                                                existingDomNode!.appendChild(existingChildDomNode)
                                            }
                                            else if (existingDomNode!.contains(existingChildDomNode)) {
                                                existingDomNode!.replaceChild(existingChildDomNode, oldChildDomNode)
                                            }
                                            else {
                                                existingDomNode!.insertBefore(existingChildDomNode, oldChildDomNode)
                                            }
                                        }
                                    }
                                }
                            }

                            render(existingDomNode as Element, newChildVNode, oldChildVNode, existingChildDomNode, isSvg, childAction)
                        }

                        if (unkeyedNodes.length > 0) {
                            for (let i = 0; i < unkeyedNodes.length; i++) {
                                if (existingDomNode!.contains(unkeyedNodes[i])) {
                                    existingDomNode!.removeChild(unkeyedNodes[i])
                                    diffNoOfChildNodes--
                                }
                            }
                        }
                    }

                    if (diffNoOfChildNodes > 0) {
                        // Remove old unused nodes
                        for (let i = newChildVNodes.length + diffNoOfChildNodes - 1; i > newChildVNodes.length - 1; i--) {
                            oldChildVNode = oldChildVNodes[i]

                            // Make sure any sub-components are "unmounted"
                            findAndUnmountComponentsRec(oldChildVNode)

                            oldChildDomNode = oldChildVNode.domRef!
                            if (oldChildDomNode !== null && existingDomNode!.contains(oldChildDomNode)) {
                                existingDomNode!.removeChild(oldChildDomNode)
                            }
                        }
                    }
                    break
                case VNODE_TEXT: // text node
                    existingDomNode!.textContent = newVNode.value
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
                oldVNode!.domRef = undefined
            }
            break
    }
}

function tryBuildElement(newVNode: VNode, newNode: Node, isSvg: boolean, action: RenderingAction) {
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
                render(newNode as Element, c, c, undefined, isSvg, action)
            }
        }
    }
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
