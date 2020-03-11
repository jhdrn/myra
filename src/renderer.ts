/** @internal */
import { initComponent, updateComponent, findAndUnmountComponentsRec } from './component'
import { VNode, ElementVNode } from './contract'
import { VNODE_COMPONENT, VNODE_ELEMENT, VNODE_TEXT, VNODE_FUNCTION, VNODE_NOTHING } from './constants';

const ACTION_APPEND = 1
const ACTION_INSERT = 2
const ACTION_REPLACE = 3
const ACTION_UPDATE = 4

export type RenderingAction = undefined | 1 | 2 | 3 | 4

/** 
 * Renders the view by traversing the virtual node tree recursively 
 */
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
        case ACTION_INSERT:
        case ACTION_REPLACE:

            let newNode = createNode(newVNode, parentDomNode, isSvg)
            newVNode.domRef = newNode

            if (action === ACTION_APPEND) {
                parentDomNode.appendChild(newNode)
            }
            else if (action === ACTION_INSERT) {
                parentDomNode.insertBefore(newNode, oldVNode!.domRef)
            }
            else { // action === ACTION_REPLACE

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
            }

            tryBuildElement(newVNode, newNode, isSvg, ACTION_APPEND)

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

                    if (newVNode.children.length > 0) {
                        // Create a map holding references to all the old child 
                        // VNodes indexed by key    
                        const keyMap: Record<string, [VNode, Node] | undefined> = {}

                        // 
                        const unkeyedNodes: Node[] = []

                        // Prepare the map with the keys from the new nodes
                        for (let i = 0; i < newChildVNodes.length; i++) {
                            const newChildVNode = newChildVNodes[i] as ElementVNode<any>
                            if (newChildVNode.props !== undefined && newChildVNode.props !== null && newChildVNode.props.key !== undefined) {
                                keyMap[newChildVNode.props.key] = undefined
                            }
                        }

                        // Go through the old child VNodes to see if there are any old ones matching the new VNodes
                        let matchingKeyedNodes = false
                        for (let i = 0; i < oldChildVNodes.length; i++) {
                            const oldChildVNode = oldChildVNodes[i] as ElementVNode<HTMLElement>
                            if (oldChildVNode.props !== undefined && oldChildVNode.props !== null && oldChildVNode.props.key !== undefined) {
                                // If the key has been added (from a new VNode), update it's value
                                if (oldChildVNode.props.key in keyMap) {
                                    keyMap[oldChildVNode.props.key] = [oldChildVNode, oldChildVNode.domRef!]
                                    matchingKeyedNodes = true
                                }
                                // else save the DOM node for reuse or removal
                                else if (existingDomNode!.contains(oldChildVNode.domRef!)) {
                                    unkeyedNodes.push(oldChildVNode.domRef!)
                                }
                            }
                        }

                        // If there was no matching keyed nodes, remove all old 
                        // DOM nodes
                        if (!matchingKeyedNodes && Object.keys(keyMap).length > 0) {
                            (existingDomNode as HTMLElement).innerHTML = ''
                            unkeyedNodes.length = 0

                            for (let i = newChildVNodes.length + diffNoOfChildNodes - 1; i > -1; i--) {
                                const oldChildVNode = oldChildVNodes[i]
                                oldChildVNode.domRef = undefined

                                // Make sure any sub-components are "unmounted"
                                findAndUnmountComponentsRec(oldChildVNode)
                            }
                        }

                        let domNodeAtIndex: Node | null = existingDomNode!.firstChild
                        let nextDomNode: Node | null = null

                        // Start iterating over the new nodes and render them
                        for (let i = 0; i < newChildVNodes.length; i++) {
                            const newChildVNode = newChildVNodes[i]
                            let oldChildVNode = oldChildVNodes[i]
                            let matchingChildDomNode: Node | undefined
                            let childAction: RenderingAction

                            if (domNodeAtIndex !== null) {
                                nextDomNode = domNodeAtIndex.nextSibling
                            }

                            // If there is an old VNode, it's DOM ref should be
                            // treated as the current/matching DOM node
                            if (oldChildVNode !== undefined) {
                                matchingChildDomNode = oldChildVNode.domRef
                            }

                            // Check if the new VNode is "keyed"
                            if ((newChildVNode as ElementVNode<any>).props !== undefined
                                && oldChildVNodes.length > 0) {

                                const newChildVNodeKey: string | undefined = (newChildVNode as ElementVNode<any>).props.key

                                if (newChildVNodeKey !== undefined) {

                                    // Fetch the old keyed item from the key map
                                    const keyMapEntry = keyMap[newChildVNodeKey]

                                    // If there was no old matching key, reuse an old unkeyed node
                                    if (keyMapEntry === undefined) {
                                        matchingChildDomNode = unkeyedNodes.shift()
                                        if (matchingChildDomNode !== undefined) {
                                            // Make sure that the DOM node will be
                                            // recreated when rendered
                                            childAction = ACTION_REPLACE
                                        }
                                    }
                                    // If there was a matching key, use the old vNodes dom ref
                                    else {
                                        [oldChildVNode, matchingChildDomNode] = keyMapEntry
                                    }

                                    // Move the matching dom node to it's new position
                                    if (matchingChildDomNode !== undefined && matchingChildDomNode !== domNodeAtIndex) {
                                        // If there is no DOM node at the current index, 
                                        // the matching DOM node should be appended.
                                        if (domNodeAtIndex === null) {
                                            existingDomNode!.appendChild(matchingChildDomNode)
                                        }
                                        // Move the node by replacing the node at the current index
                                        else if (existingDomNode!.contains(matchingChildDomNode)) {
                                            existingDomNode!.replaceChild(matchingChildDomNode, domNodeAtIndex)
                                            nextDomNode = matchingChildDomNode.nextSibling
                                        }
                                        else {
                                            existingDomNode!.insertBefore(matchingChildDomNode, domNodeAtIndex)
                                        }
                                    }
                                }
                            }

                            render(existingDomNode as Element, newChildVNode, oldChildVNode, matchingChildDomNode, isSvg, childAction)

                            domNodeAtIndex = nextDomNode
                        }
                    }

                    if (diffNoOfChildNodes > 0) {
                        // Remove old unused DOM nodes backwards from the end
                        for (let i = newChildVNodes.length + diffNoOfChildNodes - 1; i > newChildVNodes.length - 1; i--) {
                            const oldChildVNode = oldChildVNodes[i]

                            // Make sure any sub-components are "unmounted"
                            findAndUnmountComponentsRec(oldChildVNode)

                            const oldChildDomNode = oldChildVNode.domRef!
                            if (oldChildDomNode !== undefined && existingDomNode!.contains(oldChildDomNode!)) {
                                existingDomNode!.removeChild(oldChildDomNode!)
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

/**
 * Sets attributes and renders children of the VNode, if it is an 
 * ElementVNode
 */
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
    // The the "value" attribute shoud be set explicitly (and only if it has 
    // changed) to prevent jumping cursors in some browsers (Safari)
    else if (attributeName === 'value' && (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT')) {
        if ((element as any).value !== attributeValue) {
            (element as any).value = attributeValue
        }
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
        case VNODE_NOTHING:
            return document.createComment('Nothing')
    }
}

/**
 * Find out which attributes has been unset or should be removed anyways 
 * (event listeners)
 */
function getAttributesToRemove(newVNode: ElementVNode<any>, oldVNode: VNode) {
    const attributesToRemove = [] as string[]
    for (const attributeName in (oldVNode as ElementVNode<any>).props) {
        if ((newVNode.props as any)[attributeName] === undefined || attributeName.indexOf('on') === 0) {
            attributesToRemove.push(attributeName)
        }
    }
    return attributesToRemove
}

/**
 * Sets/removes attributes on an element node
 */
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
        hasAttr = (existingDomNode as Element).hasAttribute(name)

        // We need to check the actual DOM value of the "value" property
        // otherwise it may not be updated if the new prop value equals the old 
        // prop value
        if (name === 'value' && name in existingDomNode) {
            oldAttributeValue = (existingDomNode as HTMLInputElement).value
        } else {
            oldAttributeValue = ((oldVNode as ElementVNode<any>).props as any)[name]
        }

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
