import {
    ComponentProps,
    ComponentVNode,
    EffectWrapper,
    ElementVNode,
    FragmentVNode,
    GlobalAttributes,
    VNode,
    VNodeType,
} from './contract'

interface IRenderingContext {
    vNode: ComponentVNode<ComponentProps>
    isSvg: boolean
    parentElement: Element
    hookIndex: number
}

/**
 * The renderingContext is used to obtain context varibles from within "hooks".
 */
let renderingContext: IRenderingContext | undefined

export function getRenderingContext() {
    return renderingContext
}

// /**
//  * Renders the component and handles it's "lifecycle" by triggering any effects.
//  */
// export function renderComponent(
//     parentElement: Element,
//     newVNode: ComponentVNode<any>,
//     oldVNode: ComponentVNode<any> | undefined,
//     isSvg: boolean
// ) {

//     let oldNode: Node | undefined

//     const {
//         props: newProps,
//         rendition
//     } = newVNode

//     if (rendition !== undefined) {
//         oldNode = rendition.domRef
//     }

//     if (renderingContext === undefined) {
//         try {
//             renderingContext = {
//                 vNode: newVNode,
//                 isSvg,
//                 parentElement,
//                 hookIndex: 0
//             }
//             let newView = newVNode.view(newProps) as VNode

//             if (newView._ === VNodeType.Memo) {
//                 if (oldVNode !== undefined && newView.compare(newVNode.props, oldVNode.props)) {
//                     newVNode.domRef = oldNode
//                     renderingContext = undefined
//                     return
//                 }
//                 newView = newView.view(newProps) as VNode
//             }

//             renderingContext = undefined

//             render2(parentElement, newView as VNode, newVNode.rendition, oldNode, isSvg)

//             newVNode.rendition = (newView as VNode)
//             newVNode.domRef = (newView as VNode).domRef

//             // Trigger synchronous effects (useLayoutEffect)
//             triggerEffects(newVNode, parentElement, isSvg, true)

//             // Trigger asynchronous effects (useEffect)
//             triggerEffects(newVNode, parentElement, isSvg, false)
//         }
//         catch (err) {
//             tryHandleComponentError(parentElement, newVNode, isSvg, err)
//         }
//     }
// }

/**
 * Triggers all invokeable effects.
 */
function triggerEffects(newVNode: ComponentVNode<any>, parentElement: Element, isSvg: boolean, sync: boolean) {
    const effects = newVNode.effects
    if (effects !== undefined) {
        for (const i in effects) {
            const t = effects[i]
            if (t.invoke) {
                if (t.sync && sync) {
                    attemptEffectCleanup(t)
                    t.cleanup = t.effect()
                    t.invoke = false
                } else if (!sync) {
                    setTimeout(() => {
                        try {
                            attemptEffectCleanup(t)

                            t.cleanup = t.effect()
                        } catch (err) {
                            tryHandleComponentError(parentElement, newVNode, isSvg, err)
                        }
                    }, 0)
                    t.invoke = false
                }
            }
        }
    }
}

/**
 * Calls the cleanup function if it's set and then removes it from the wrapper
 */
function attemptEffectCleanup(t: EffectWrapper) {
    if (t.cleanup !== undefined) {
        try {
            t.cleanup()
        } catch (err) {
            console.error('An error occured during effect cleanup: ' + err)
        }
        t.cleanup = undefined
    }
}

/**
 * Calls the error handler (if any) and renders the returned view.
 */
export function tryHandleComponentError(parentElement: Element, vNode: ComponentVNode<any>, isSvg: boolean, err: Error) {

    // Do nothing if the parentElement is not longer connected to the DOM
    if (parentElement.parentNode === null) {
        return
    }

    if (vNode.errorHandler !== undefined) {

        renderingContext = undefined

        const errorView = vNode.errorHandler(err)

        render(parentElement, [errorView], vNode.rendition === undefined ? [] : [vNode.rendition], isSvg)

        vNode.rendition = errorView
        vNode.domRef = errorView.domRef
    } else {
        throw err
    }
}

/** 
 * Traverses the virtual node hierarchy and unmounts any components in the 
 * hierarchy.
 */
function cleanupComponentsRec(vNode: VNode | undefined) {
    if (vNode === undefined) {
        return
    }

    if (vNode._ === VNodeType.Component) {
        // Attempt to call any "cleanup" function for all effects before unmount.
        const effects = vNode.effects
        if (effects !== undefined) {
            for (const i in effects) {
                attemptEffectCleanup(effects[i])
            }
        }
        cleanupComponentsRec(vNode.rendition!)
    }
    else if (vNode._ === VNodeType.Element || vNode._ === VNodeType.Fragment) {
        for (const c of vNode.props.children) {
            cleanupComponentsRec(c)
        }
    }
}

// const enum RenderingAction {
//     APPEND = 1,
//     INSERT = 2,
//     REPLACE = 3,
//     UPDATE = 4
// }

// /** 
//  * Renders the view by traversing the virtual node tree recursively 
//  */
// export function render2(
//     parentDomNode: Element,
//     newVNode: VNode,
//     oldVNode: VNode | undefined,
//     existingDomNode: Node | undefined,
//     isSvg = false,
//     action: RenderingAction | null = null
// ) {
//     if (action === null) {
//         // Decide what action to take
//         if (newVNode._ === VNodeType.Fragment && oldVNode !== undefined && oldVNode._ === VNodeType.Fragment) {
//             action = RenderingAction.UPDATE
//         }
//         else if (oldVNode === undefined || oldVNode.domRef === undefined && oldVNode._ !== VNodeType.Fragment && oldVNode._ !== VNodeType.Component) {
//             action = RenderingAction.APPEND
//         }
//         else if (oldVNode.domRef !== undefined && existingDomNode === undefined) {
//             action = RenderingAction.INSERT
//         }
//         else if (newVNode._ !== oldVNode._) {
//             action = RenderingAction.REPLACE
//         }
//         else if (newVNode._ === VNodeType.Element && oldVNode._ === VNodeType.Element &&
//             newVNode.tagName !== oldVNode.tagName) {
//             action = RenderingAction.REPLACE
//         }
//         else if (newVNode._ === VNodeType.Component && oldVNode._ === VNodeType.Component &&
//             newVNode.view !== oldVNode.view) {
//             action = RenderingAction.REPLACE
//         } else {
//             action = RenderingAction.UPDATE
//         }
//     }

//     if ((newVNode as ElementVNode<any>).tagName === 'svg') {
//         isSvg = true
//     }

//     switch (action) {
//         case RenderingAction.APPEND:
//         case RenderingAction.INSERT:
//         case RenderingAction.REPLACE:
//             renderCreate(
//                 parentDomNode,
//                 newVNode,
//                 oldVNode,
//                 existingDomNode,
//                 isSvg,
//                 action
//             )
//             break

//         case RenderingAction.UPDATE:
//             renderUpdate(
//                 parentDomNode,
//                 newVNode,
//                 oldVNode,
//                 existingDomNode,
//                 isSvg
//             )
//             break
//     }
// }

// /**
//  * Creates a new DOM node from a VNode and then renders all it's children.
//  */
// function renderCreate(
//     parentDomNode: Element,
//     newVNode: VNode,
//     oldVNode: VNode | undefined,
//     existingDomNode: Node | undefined,
//     isSvg = false,
//     action: RenderingAction | undefined = undefined
// ) {

//     if (newVNode._ === VNodeType.Component) {

//         renderComponent(parentDomNode, newVNode, undefined, isSvg)

//         const domNode = newVNode.domRef
//         if (domNode !== undefined) {
//             if (action === RenderingAction.APPEND) {
//                 parentDomNode.appendChild(domNode)
//             }
//             else if (action === RenderingAction.INSERT) {
//                 parentDomNode.insertBefore(domNode, oldVNode!.domRef)
//             }
//             else if (action === RenderingAction.REPLACE) {

//                 // If it's a component node or an element node and it should be 
//                 // replaced, unmount any components in the tree.
//                 if (oldVNode!._ === VNodeType.Component || oldVNode!._ === VNodeType.Element || oldVNode!._ === VNodeType.Fragment) {
//                     cleanupComponentsRec(oldVNode!)
//                 }

//                 // When using fragments, we can have cases where several "steps" in
//                 // the hierarchy is skipped.
//                 if (oldVNode!.domRef === undefined && (oldVNode!._ === VNodeType.Fragment || oldVNode!._ === VNodeType.Component)) {
//                     replaceAndRemoveFragmentNodes(parentDomNode, oldVNode as FragmentVNode, domNode)
//                 } else {
//                     parentDomNode.replaceChild(domNode, existingDomNode!)
//                 }
//             }
//         }
//     }
//     else if (newVNode._ === VNodeType.Fragment) {

//         // Skip creating a node for the fragment, instead render the children
//         // directly to the parent DOM node
//         for (let i = 0; i < newVNode.props.children.length; i++) {
//             const childNode = newVNode.props.children[i]
//             let oldChildNode: VNode | undefined
//             if (oldVNode !== undefined && (oldVNode._ === VNodeType.Element || oldVNode._ === VNodeType.Component)) {
//                 if (i <= oldVNode.props.children.length) {
//                     oldChildNode = oldVNode.props.children[i]
//                 }
//             }
//             render2(parentDomNode, childNode, oldChildNode, undefined, isSvg)
//         }

//     } else if (newVNode._ !== VNodeType.Memo) {

//         let newNode = createNode(newVNode, isSvg)
//         newVNode.domRef = newNode

//         if (action === RenderingAction.APPEND) {
//             parentDomNode.appendChild(newNode)
//         }
//         else if (action === RenderingAction.INSERT) {
//             parentDomNode.insertBefore(newNode, oldVNode!.domRef)
//         }
//         else { // action === ACTION_REPLACE

//             // If it's a component node or an element node and it should be 
//             // replaced, unmount any components in the tree.
//             if (oldVNode!._ === VNodeType.Component || oldVNode!._ === VNodeType.Element || oldVNode!._ === VNodeType.Fragment) {
//                 cleanupComponentsRec(oldVNode!)
//             }

//             // When using fragments, we can have cases where several "steps" in
//             // the hierarchy is skipped, thus we might need to remove multiple 
//             // DOM nodes in addition to replacing one.
//             if (oldVNode!.domRef === undefined && (oldVNode!._ === VNodeType.Fragment || oldVNode!._ === VNodeType.Component)) {

//                 let fragmentNode = oldVNode!
//                 if (oldVNode!._ === VNodeType.Component) {
//                     fragmentNode = (oldVNode as ComponentVNode<any>).rendition!
//                 }
//                 replaceAndRemoveFragmentNodes(parentDomNode, fragmentNode as FragmentVNode, newNode)
//             } else {

//                 // If it's an element node remove old event listeners before 
//                 // replacing the node. 
//                 if (oldVNode!._ === VNodeType.Element) {
//                     for (const attr in (oldVNode as ElementVNode<any>).props) {
//                         if (attr.indexOf('on') === 0) {
//                             removeElementAttribute(attr, existingDomNode as Element)
//                         }
//                     }
//                 }

//                 parentDomNode.replaceChild(newNode, existingDomNode!)
//             }
//         }

//         // If it's an element node set attributes and event listeners
//         if (newVNode._ === VNodeType.Element) {
//             const props = newVNode.props
//             for (const name in props) {
//                 if (name === 'children' || name === 'key') {
//                     continue
//                 } else if (name === 'ref') {
//                     (props as any)[name].current = newNode
//                 }
//                 const attributeValue = (props as any)[name]

//                 if (attributeValue !== undefined) {
//                     setElementAttribute(
//                         newNode as HTMLElement,
//                         name,
//                         attributeValue
//                     )
//                 }
//             }

//             for (const c of props.children) {
//                 if (c !== undefined) {
//                     render2(newNode as Element, c, undefined, undefined, isSvg)
//                 }
//             }
//         }
//     }
// }

// /**
//  * Finds fragment child nodes, replaces the first one with newNode and removes
//  * the rest.
//  */
// function replaceAndRemoveFragmentNodes(parentDomNode: Element, fragmentVNode: FragmentVNode, newNode: Node) {
//     const childNodes = getFragmentChildDomNodesRec(fragmentVNode, parentDomNode)

//     for (let i = 0; i < childNodes.length; i++) {
//         const child = childNodes[i]
//         if (i === 0) {
//             parentDomNode.replaceChild(newNode, child)
//         } else {
//             parentDomNode.removeChild(child)
//         }
//     }
// }

// /**
//  * Updates a DOM not from a new VNode.
//  */
// function renderUpdate(
//     parentDomNode: Element,
//     newVNode: VNode,
//     oldVNode: VNode | undefined,
//     existingDomNode: Node | undefined,
//     isSvg = false
// ) {
//     // if (!nodesEqual(oldVNode.node, existingDomNode)) {
//     //     TODO: "debug mode" with warnings?
//     //     console.error('The view is not matching the DOM. Are outside forces tampering with it?')
//     // }

//     // update existing node
//     switch (newVNode._) {
//         case VNodeType.Element:

//             updateElementAttributes(newVNode, oldVNode!, existingDomNode as Element)
//             updateElementVNode(
//                 newVNode,
//                 oldVNode as ElementVNode<any>,
//                 existingDomNode as Element,
//                 isSvg
//             )
//             break
//         case VNodeType.Text:
//             if (existingDomNode!.textContent !== newVNode.value) {
//                 existingDomNode!.textContent = newVNode.value
//             }
//             break
//         case VNodeType.Component:

//             newVNode.rendition = (oldVNode as ComponentVNode<any>).rendition
//             newVNode.data = (oldVNode as ComponentVNode<any>).data
//             newVNode.effects = (oldVNode as ComponentVNode<any>).effects
//             newVNode.errorHandler = (oldVNode as ComponentVNode<any>).errorHandler
//             newVNode.link = (oldVNode as ComponentVNode<any>).link
//             newVNode.link.vNode = newVNode

//             renderComponent(parentDomNode, newVNode, oldVNode as ComponentVNode<any>, isSvg)

//             break
//         case VNodeType.Fragment:
//             updateElementVNode(
//                 newVNode,
//                 oldVNode as FragmentVNode,
//                 parentDomNode, // Fragments doesn´t reference any DOM node, instead pass the parent
//                 isSvg
//             )
//             break
//     }

//     if (newVNode.domRef === undefined) {
//         // add a reference to the node
//         newVNode.domRef = existingDomNode
//     }

//     if (newVNode !== oldVNode) {
//         // clean up
//         oldVNode!.domRef = undefined
//     }
// }

// type BasicVNode = TextVNode | ElementVNode<any> | NothingVNode

// /** 
//  * Creates a DOM Node from a (non component or fragment) VNode. 
//  */
// function createNode(vNode: BasicVNode, isSvg: boolean): Node {
//     switch (vNode._) {
//         case VNodeType.Element:
//             if (isSvg) {
//                 return document.createElementNS('http://www.w3.org/2000/svg', vNode.tagName)
//             }
//             return document.createElement(vNode.tagName)
//         case VNodeType.Text:
//             return document.createTextNode(vNode.value)

//         case VNodeType.Nothing:
//             return document.createComment('Nothing')
//     }
// }

// /**
//  * Updates an existing HTMLElement DOM node from a new VNode.
//  */
// function updateElementVNode(
//     newVNode: ElementVNode<any> | FragmentVNode,
//     oldVNode: ElementVNode<any> | FragmentVNode,
//     existingDomNode: Element,
//     isSvg = false
// ) {

//     const newChildVNodes = newVNode.props.children
//     const oldChildVNodes = oldVNode.props.children
//     let diffNoOfChildNodes = oldChildVNodes.length - newChildVNodes.length
//     if (newChildVNodes.length > 0) {
//         // Create a map holding references to all the old child 
//         // VNodes indexed by key
//         const keyMap: Record<string, [VNode, Node] | undefined> = {}

//         // Node "pool" for reuse
//         const unkeyedNodes: Node[] = []

//         // Prepare the map with the keys from the new nodes
//         for (let i = 0; i < newChildVNodes.length; i++) {
//             const newChildVNode = newChildVNodes[i] as ElementVNode<any>
//             const props = newChildVNode.props
//             if (props !== undefined && props !== null && props.key !== undefined) {
//                 keyMap[props.key] = undefined
//             }
//         }

//         // Go through the old child VNodes to see if there are any old ones matching the new VNodes
//         let matchingKeyedNodes = false
//         for (let i = 0; i < oldChildVNodes.length; i++) {
//             const oldChildVNode = oldChildVNodes[i] as ElementVNode<HTMLElement>
//             const props = oldChildVNode.props
//             if (props !== undefined && props !== null && props.key !== undefined) {
//                 // If the key has been added (from a new VNode), update it's value
//                 if (props.key in keyMap) {
//                     keyMap[props.key] = [oldChildVNode, oldChildVNode.domRef!]
//                     matchingKeyedNodes = true
//                 }
//                 // else save the DOM node for reuse or removal
//                 else if (existingDomNode!.contains(oldChildVNode.domRef!)) {
//                     unkeyedNodes.push(oldChildVNode.domRef!)
//                 }
//             }
//         }

//         // If there was no matching keyed nodes, remove all old 
//         // DOM nodes
//         if (!matchingKeyedNodes && Object.keys(keyMap).length > 0) {
//             (existingDomNode as HTMLElement).innerHTML = ''
//             unkeyedNodes.length = 0

//             for (let i = newChildVNodes.length + diffNoOfChildNodes - 1; i > -1; i--) {
//                 const oldChildVNode = oldChildVNodes[i]
//                 oldChildVNode.domRef = undefined

//                 // Make sure any sub-components are "unmounted"
//                 cleanupComponentsRec(oldChildVNode)
//             }
//         }

//         let domNodeAtIndex: Node | null = existingDomNode!.firstChild
//         let nextDomNode: Node | null = null

//         // Start iterating over the new nodes and render them
//         for (let i = 0; i < newChildVNodes.length; i++) {
//             const newChildVNode = newChildVNodes[i]
//             let oldChildVNode = oldChildVNodes[i]
//             let matchingChildDomNode: Node | undefined
//             let childAction: RenderingAction | undefined

//             if (domNodeAtIndex !== null) {
//                 nextDomNode = domNodeAtIndex.nextSibling
//             }

//             // If there is an old VNode, it's DOM ref should be
//             // treated as the current/matching DOM node
//             if (oldChildVNode !== undefined) {
//                 matchingChildDomNode = oldChildVNode.domRef
//             }

//             const newProps = (newChildVNode as ElementVNode<any>).props
//             // Check if the new VNode is "keyed"
//             if (newProps !== undefined
//                 && oldChildVNodes.length > 0) {

//                 const newChildVNodeKey: Key | undefined = newProps.key

//                 if (newChildVNodeKey !== undefined) {

//                     // Fetch the old keyed item from the key map
//                     const keyMapEntry = keyMap[newChildVNodeKey]

//                     // If there was no old matching key, reuse an old unkeyed node
//                     if (keyMapEntry === undefined) {
//                         matchingChildDomNode = unkeyedNodes.shift()
//                         if (matchingChildDomNode !== undefined) {
//                             // Make sure that the DOM node will be
//                             // recreated when rendered
//                             childAction = RenderingAction.REPLACE
//                         }
//                     }
//                     // If there was a matching key, use the old vNodes dom ref
//                     else {
//                         [oldChildVNode, matchingChildDomNode] = keyMapEntry
//                     }

//                     // Move the matching dom node to it's new position
//                     if (matchingChildDomNode !== undefined && matchingChildDomNode !== domNodeAtIndex) {
//                         // If there is no DOM node at the current index, 
//                         // the matching DOM node should be appended.
//                         if (domNodeAtIndex === null) {
//                             existingDomNode!.appendChild(matchingChildDomNode)
//                         }
//                         // Move the node by replacing the node at the current index
//                         else if (existingDomNode!.contains(matchingChildDomNode)) {
//                             existingDomNode!.replaceChild(matchingChildDomNode, domNodeAtIndex)
//                             nextDomNode = matchingChildDomNode.nextSibling
//                         }
//                         else {
//                             existingDomNode!.insertBefore(matchingChildDomNode, domNodeAtIndex)
//                         }
//                     }
//                 }
//             }

//             render2(existingDomNode as Element, newChildVNode, oldChildVNode, matchingChildDomNode, isSvg, childAction)

//             domNodeAtIndex = nextDomNode
//         }
//     }

//     if (diffNoOfChildNodes > 0) {
//         // Remove old unused DOM nodes backwards from the end
//         for (let i = newChildVNodes.length + diffNoOfChildNodes - 1; i > newChildVNodes.length - 1; i--) {
//             const oldChildVNode = oldChildVNodes[i]

//             // Make sure any sub-components are "unmounted"
//             cleanupComponentsRec(oldChildVNode)

//             if (oldChildVNode._ === VNodeType.Fragment) {
//                 removeFragmentChildNodes(oldChildVNode, existingDomNode)
//             } else if (oldChildVNode._ === VNodeType.Component && oldChildVNode.rendition?._ === VNodeType.Fragment) {
//                 removeFragmentChildNodes(oldChildVNode.rendition, existingDomNode)
//             } else {
//                 const oldChildDomNode = oldChildVNode.domRef!
//                 if (oldChildDomNode !== undefined && existingDomNode.contains(oldChildDomNode)) {
//                     existingDomNode.removeChild(oldChildDomNode)
//                 }
//             }
//         }
//     }
// }

// /**
//  * Removes any Fragment child DOM nodes from parentDomElement
//  */
// function removeFragmentChildNodes(fragmentNode: FragmentVNode, parentDomElement: Element) {
//     const childNodes = getFragmentChildDomNodesRec(fragmentNode, parentDomElement)

//     for (const c of childNodes) {
//         parentDomElement.removeChild(c)
//     }
// }

/**
 * Recursively traverses the vNode tree and removes any Fragment child DOM nodes
 * from domElement
 */
function getFragmentChildDomNodesRec(fragmentNode: FragmentVNode | ComponentVNode<any>, parentDomElement: Element) {
    const nodes: Node[] = []
    for (const fragmentChild of fragmentNode.props.children) {
        if (fragmentChild._ === VNodeType.Fragment) {
            nodes.push(...getFragmentChildDomNodesRec(fragmentChild, parentDomElement))
        }
        else if (fragmentChild._ === VNodeType.Component && fragmentChild.rendition?._ === VNodeType.Fragment) {
            nodes.push(...getFragmentChildDomNodesRec(fragmentChild.rendition, parentDomElement))
        }
        const childNode = fragmentChild.domRef
        if (childNode !== undefined) {
            nodes.push(childNode)
        }
    }
    return nodes
}


/** 
 * Sets an attribute or event listener on an Element. 
 */
function setElementAttribute(el: Element, attributeName: string, attributeValue: any) {
    // The the "value" attribute shoud be set explicitly (and only if it has 
    // changed) to prevent jumping cursors in some browsers (Safari)
    if (attributeName === 'value' && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT')) {
        if ((el as any).value !== attributeValue) {
            (el as any).value = attributeValue
        }
    }
    else if (attributeName in el) {
        try {
            (el as any)[attributeName] = attributeValue
            return
        }
        catch (_) {
            /** Ignore and use setAttribute instead  */
        }
    }

    const attrValueType = typeof attributeValue
    if (attrValueType !== 'function' && attrValueType !== 'object') {
        el.setAttribute(attributeName, attributeValue)
    }
}

/** 
 * Removes an attribute or event listener from an HTMLElement. 
 */
function removeElementAttribute(a: string, el: Element) {
    if (a.indexOf('on') === 0) {
        (el as any)[a] = null
    }
    else if (el.hasAttribute(a)) {
        el.removeAttribute(a)
    }
}


/**
 * Sets/removes attributes on an DOM element node
 */
function updateElementAttributes(newVNode: ElementVNode<any>, oldVNode: VNode, existingDomNode: Element) {
    const newProps = newVNode.props
    const oldProps = (oldVNode as ElementVNode<any>).props
    // remove any attributes that was added with the old virtual node but does 
    // not exist in the new virtual node or should be removed anyways (event listeners).
    for (const attributeName in oldProps) {
        if (attributeName === 'children' || attributeName === 'key' || attributeName === 'ref') {
            continue
        }
        if ((newProps as any)[attributeName] === undefined || attributeName.indexOf('on') === 0) {
            removeElementAttribute(attributeName, existingDomNode)
        }
    }

    let attributeValue: any
    let oldAttributeValue: any
    let hasAttr: boolean

    // update any attribute where the attribute value has changed
    for (const name in newProps) {
        if (name === 'children' || name === 'key') {
            continue
        } else if (name === 'ref') {
            (newProps as any)[name].current = existingDomNode
            continue
        }
        attributeValue = (newProps as any)[name]
        hasAttr = (existingDomNode).hasAttribute(name)

        // We need to check the actual DOM value of the "value" property
        // otherwise it may not be updated if the new prop value equals the old 
        // prop value
        if (name === 'value' && name in existingDomNode) {
            oldAttributeValue = (existingDomNode as HTMLInputElement).value
        } else {
            oldAttributeValue = (oldProps as any)[name]
        }

        if ((name.indexOf('on') === 0 || attributeValue !== oldAttributeValue ||
            !hasAttr) && attributeValue !== undefined
        ) {
            setElementAttribute(
                existingDomNode,
                name,
                attributeValue
            )
        }
        else if (attributeValue === undefined && hasAttr) {
            (existingDomNode as Element).removeAttribute(name)
        }
    }
}


export function render(parentElement: Element, newChildVNodes: VNode[], oldChildVNodes: VNode[], isSvg = false) {

    const diffNoOfChildNodes = oldChildVNodes.length - newChildVNodes.length

    for (let i = 0; i < newChildVNodes.length; i++) {
        const newChildVNode = newChildVNodes[i]
        const oldChildVNode = oldChildVNodes[i]

        // console.log('render child', newChildVNode, oldChildVNode)
        switch (newChildVNode._) {
            case VNodeType.Component:

                if (oldChildVNode !== undefined) {
                    if (oldChildVNode._ === VNodeType.Component) {
                        newChildVNode.rendition = oldChildVNode.rendition
                        newChildVNode.data = oldChildVNode.data
                        newChildVNode.effects = oldChildVNode.effects
                        newChildVNode.errorHandler = oldChildVNode.errorHandler
                        newChildVNode.link = oldChildVNode.link
                        newChildVNode.link.vNode = newChildVNode
                    }
                }

                let oldNode: Node | undefined

                if (newChildVNode.rendition !== undefined) {
                    oldNode = newChildVNode.rendition.domRef
                }

                if (renderingContext === undefined) {
                    try {
                        renderingContext = {
                            vNode: newChildVNode,
                            isSvg,
                            parentElement,
                            hookIndex: 0
                        }
                        let newView = newChildVNode.view(newChildVNode.props) as VNode

                        if (newView._ === VNodeType.Memo) {
                            if (oldChildVNode !== undefined && newView.compare(newChildVNode.props, newChildVNode.props)) {
                                newChildVNode.domRef = oldNode
                                renderingContext = undefined
                                return
                            }
                            newView = newView.view(newChildVNode.props) as VNode
                        }

                        renderingContext = undefined

                        render(parentElement, [newView], newChildVNode.rendition === undefined ? [] : [newChildVNode.rendition], isSvg)

                        newChildVNode.rendition = (newView as VNode)
                        newChildVNode.domRef = (newView as VNode).domRef

                        // Trigger synchronous effects (useLayoutEffect)
                        triggerEffects(newChildVNode, parentElement, isSvg, true)

                        // Trigger asynchronous effects (useEffect)
                        triggerEffects(newChildVNode, parentElement, isSvg, false)
                    }
                    catch (err) {
                        tryHandleComponentError(parentElement, newChildVNode, isSvg, err)
                    }
                }
                break

            case VNodeType.Element:
                if (newChildVNode.tagName === 'svg') {
                    isSvg = true
                }

                // Create a new DOM element, add it to the parent DOM element 
                // and render the children.
                if (oldChildVNode === undefined) {
                    newChildVNode.domRef = createElement(newChildVNode.tagName, isSvg, newChildVNode.props)

                    parentElement.appendChild(newChildVNode.domRef)

                    render(newChildVNode.domRef, newChildVNode.props.children, [], isSvg)
                }
                // If the node type has not changed, reuse the old DOM node and
                // update it's attributes
                else if (oldChildVNode._ === newChildVNode._ && oldChildVNode.tagName === newChildVNode.tagName) {

                    // Reuse the same DOM element
                    newChildVNode.domRef = oldChildVNode.domRef

                    // Update/remove/add any attributes
                    updateElementAttributes(newChildVNode, oldChildVNode, oldChildVNode.domRef)

                    // Render the element's children
                    render(newChildVNode.domRef as Element, newChildVNode.props.children, oldChildVNode.props.children, isSvg)
                }
                else if (oldChildVNode._ === VNodeType.Fragment) {

                    const oldDOMNodes = getFragmentChildDomNodesRec(oldChildVNode, parentElement)

                    let reuseDOMNode: Element | undefined
                    let replaceDOMNode: Node | undefined
                    for (let i = 0; i < oldDOMNodes.length; i++) {
                        const oldDOMNode = oldDOMNodes[i]

                        // Check for a DOM node to reuse
                        if (reuseDOMNode === undefined && (oldDOMNode as Element).tagName === newChildVNode.tagName) {
                            reuseDOMNode = oldDOMNode as Element
                        }
                        // If no DOM node suitable for reuse is found, keep the
                        // last one to be replaced
                        else if (i === oldDOMNodes.length - 1) {
                            replaceDOMNode = oldDOMNode
                        }
                        else {
                            parentElement.removeChild(oldDOMNode)
                        }
                    }

                    if (reuseDOMNode !== undefined) {

                        // Reuse the same DOM element
                        newChildVNode.domRef = reuseDOMNode

                        // Update/remove/add any attributes
                        updateElementAttributes(newChildVNode, oldChildVNode, reuseDOMNode as Element)
                    }
                    // We should have a DOM node to replace in this case
                    else {

                        newChildVNode.domRef = createElement(newChildVNode.tagName, isSvg, newChildVNode.props)

                        parentElement.replaceChild(newChildVNode.domRef, replaceDOMNode!)
                    }
                    // Render the element's children
                    render(newChildVNode.domRef as Element, newChildVNode.props.children, [], isSvg)
                }
                // Replace the old DOM node with a new element and render it's
                // children
                else {
                    newChildVNode.domRef = createElement(newChildVNode.tagName, isSvg, newChildVNode.props)

                    // If it's an element node remove old event listeners before 
                    // replacing the node. 
                    if (oldChildVNode._ === VNodeType.Element) {
                        for (const attr in oldChildVNode.props) {
                            if (attr.indexOf('on') === 0) {
                                removeElementAttribute(attr, oldChildVNode.domRef as Element)
                            }
                        }
                    }
                    // If the old child node is a component, it's (and it's 
                    // children's) effects should be "cleaned up"
                    else if (oldChildVNode._ === VNodeType.Component) {
                        cleanupComponentsRec(oldChildVNode)
                    }

                    parentElement.replaceChild(newChildVNode.domRef, oldChildVNode.domRef!)

                    render(newChildVNode.domRef, newChildVNode.props.children, [], isSvg)
                }
                break

            case VNodeType.Fragment:
                if (oldChildVNode === undefined) {
                    render(parentElement, newChildVNode.props.children, [], isSvg)
                }
                else if (oldChildVNode._ === newChildVNode._) {
                    render(parentElement, newChildVNode.props.children, oldChildVNode.props.children)
                }
                // If it's an element node remove old event listeners before 
                // replacing the node. 
                else {
                    if (oldChildVNode._ === VNodeType.Element) {
                        for (const attr in oldChildVNode.props) {
                            if (attr.indexOf('on') === 0) {
                                removeElementAttribute(attr, oldChildVNode.domRef as Element)
                            }
                        }
                    }
                    // If the old child node is a component, it's (and it's 
                    // children's) effects should be "cleaned up"
                    else if (oldChildVNode._ === VNodeType.Component) {
                        cleanupComponentsRec(oldChildVNode)
                    }

                    const documentFragment = document.createDocumentFragment()
                    render(documentFragment as any as Element, newChildVNode.props.children, [])

                    parentElement.replaceChild(documentFragment, oldChildVNode.domRef)
                }

                break

            case VNodeType.Memo:
                // FIXME
                break

            case VNodeType.Nothing:
                if (oldChildVNode === undefined) {
                    newChildVNode.domRef = createNothingNode()
                    parentElement.appendChild(newChildVNode.domRef)
                }
                // Reuse the old DOM node
                else if (oldChildVNode._ === VNodeType.Nothing) {
                    newChildVNode.domRef = oldChildVNode.domRef
                }
                else if (oldChildVNode._ === VNodeType.Fragment) {

                    const oldDOMNodes = getFragmentChildDomNodesRec(oldChildVNode, parentElement)

                    let reuseDOMNode: Node | undefined
                    let replaceDOMNode: Node | undefined
                    for (let i = 0; i < oldDOMNodes.length; i++) {
                        const oldDOMNode = oldDOMNodes[i]

                        // Check for a DOM node to reuse
                        if (reuseDOMNode === undefined && oldDOMNode.nodeType === Node.COMMENT_NODE && oldDOMNode.textContent === 'Nothing') {
                            reuseDOMNode = oldDOMNode as Element
                        }
                        // If no DOM node suitable for reuse is found, keep the
                        // last one to be replaced
                        else if (i === oldDOMNodes.length - 1) {
                            replaceDOMNode = oldDOMNode
                        }
                        else {
                            parentElement.removeChild(oldDOMNode)
                        }
                    }

                    if (reuseDOMNode !== undefined) {

                        // Reuse the same DOM element
                        newChildVNode.domRef = reuseDOMNode
                    }
                    // We should have a DOM node to replace in this case
                    else {

                        newChildVNode.domRef = createNothingNode()

                        parentElement.replaceChild(newChildVNode.domRef, replaceDOMNode!)
                    }
                }
                else {
                    newChildVNode.domRef = createNothingNode()

                    // If it's an element node remove old event listeners before 
                    // replacing the node. 
                    if (oldChildVNode._ === VNodeType.Element) {
                        for (const attr in oldChildVNode.props) {
                            if (attr.indexOf('on') === 0) {
                                removeElementAttribute(attr, oldChildVNode.domRef as Element)
                            }
                        }
                    }
                    // If the old child node is a component, it's (and it's 
                    // children's) effects should be "cleaned up"
                    else if (oldChildVNode._ === VNodeType.Component) {
                        cleanupComponentsRec(oldChildVNode)
                    }

                    parentElement.replaceChild(newChildVNode.domRef, oldChildVNode.domRef!)
                }
                break

            case VNodeType.Text:
                if (oldChildVNode === undefined) {
                    newChildVNode.domRef = createTextNode(newChildVNode.value)
                    parentElement.appendChild(newChildVNode.domRef)
                }
                // Reuse the old DOM node and update it's text content if 
                // changed
                else if (oldChildVNode._ === VNodeType.Text) {
                    newChildVNode.domRef = oldChildVNode.domRef
                    if (newChildVNode.domRef!.textContent !== newChildVNode.value) {
                        newChildVNode.domRef!.textContent = newChildVNode.value
                    }
                }
                // If the old child node is a component, it's (and it's 
                // children's) effects should be "cleaned up"
                else if (oldChildVNode._ === VNodeType.Component) {
                    cleanupComponentsRec(oldChildVNode)
                }
                else if (oldChildVNode._ === VNodeType.Fragment) {
                    const oldDOMNodes = getFragmentChildDomNodesRec(oldChildVNode, parentElement)

                    let reuseDOMNode: Node | undefined
                    let replaceDOMNode: Node | undefined
                    for (let i = 0; i < oldDOMNodes.length; i++) {
                        const oldDOMNode = oldDOMNodes[i]

                        // Check for a DOM node to reuse
                        if (reuseDOMNode === undefined && oldDOMNode.nodeType === Node.TEXT_NODE) {
                            reuseDOMNode = oldDOMNode as Element
                        }
                        // If no DOM node suitable for reuse is found, keep the
                        // last one to be replaced
                        else if (i === oldDOMNodes.length - 1) {
                            replaceDOMNode = oldDOMNode
                        }
                        else {
                            parentElement.removeChild(oldDOMNode)
                        }
                    }

                    if (reuseDOMNode !== undefined) {

                        // Reuse the same DOM element
                        newChildVNode.domRef = reuseDOMNode
                        newChildVNode.domRef!.textContent = newChildVNode.value
                    }
                    // We should have a DOM node to replace in this case
                    else {

                        newChildVNode.domRef = createTextNode(newChildVNode.value)

                        parentElement.replaceChild(newChildVNode.domRef, replaceDOMNode!)
                    }
                }
                else {
                    newChildVNode.domRef = createTextNode(newChildVNode.value)

                    // If it's an element node remove old event listeners before 
                    // replacing the node. 
                    if (oldChildVNode._ === VNodeType.Element) {
                        for (const attr in oldChildVNode.props) {
                            if (attr.indexOf('on') === 0) {
                                removeElementAttribute(attr, oldChildVNode.domRef as Element)
                            }
                        }
                    }

                    parentElement.replaceChild(newChildVNode.domRef, oldChildVNode.domRef!)
                }
                break
        }
    }

    if (diffNoOfChildNodes > 0) {
        // Remove old unused DOM nodes backwards from the end
        for (let i = newChildVNodes.length + diffNoOfChildNodes - 1; i > newChildVNodes.length - 1; i--) {
            const oldChildVNode = oldChildVNodes[i]

            // Make sure any sub-components are "unmounted"
            cleanupComponentsRec(oldChildVNode)

            if (oldChildVNode._ === VNodeType.Fragment || oldChildVNode._ === VNodeType.Component && oldChildVNode.rendition?._ === VNodeType.Fragment) {

                let count = getFragmentChildDomNodesRec(oldChildVNode._ === VNodeType.Component ? oldChildVNode.rendition as FragmentVNode : oldChildVNode, parentElement).length
                while (count > 0) {
                    parentElement.removeChild(parentElement.lastChild!)
                    count--
                }
            } else {
                const oldChildDomNode = oldChildVNode.domRef!
                if (oldChildDomNode !== undefined && parentElement.contains(oldChildDomNode)) {
                    parentElement.removeChild(oldChildDomNode)
                }
            }
        }
    }
}

function createElement(tagName: string, isSvg: boolean, attributes: GlobalAttributes<any>): Element {
    let el: Element
    if (isSvg) {
        el = document.createElementNS('http://www.w3.org/2000/svg', tagName)
    } else {
        el = document.createElement(tagName)
    }

    for (const name in attributes) {
        if (name === 'children' || name === 'key') {
            continue
        } else if (name === 'ref') {
            (attributes as any)[name].current = el
        }
        const attributeValue = (attributes as any)[name]

        if (attributeValue !== undefined) {
            setElementAttribute(
                el,
                name,
                attributeValue
            )
        }
    }
    return el
}

function createNothingNode(): Node {
    return document.createComment('Nothing')
}

function createTextNode(text: string): Node {
    return document.createTextNode(text)
}