import {
    ComponentProps,
    ComponentVNode,
    EffectWrapper,
    ElementVNode,
    Key,
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

/**
 * Renders the component and handles it's "lifecycle" by triggering any effects.
 */
export function renderComponent(parentElement: Element, newVNode: ComponentVNode<any>, oldVNode: ComponentVNode<any> | undefined, isSvg: boolean) {

    let oldNode: Node | undefined

    const {
        props: newProps,
        rendition
    } = newVNode

    if (rendition !== undefined) {
        oldNode = rendition.domRef
    }

    if (renderingContext === undefined) {

        try {
            renderingContext = {
                vNode: newVNode,
                isSvg,
                parentElement,
                hookIndex: 0
            }

            let newView = newVNode.view(newProps) as VNode

            if (newView._ === VNodeType.Memo) {
                if (oldVNode !== undefined && newView.compare(newVNode.props, oldVNode.props)) {
                    newVNode.domRef = oldNode
                    renderingContext = undefined
                    return
                }
                newView = newView.view(newProps) as VNode
            }
            renderingContext = undefined

            render(parentElement, newView as VNode, newVNode.rendition, oldNode, isSvg)

            newVNode.rendition = (newView as VNode)
            newVNode.domRef = (newView as VNode).domRef

            // Trigger synchronous effects (useLayoutEffect)
            triggerEffects(newVNode, parentElement, isSvg, true)

            // Trigger asynchronous effects (useEffect)
            triggerEffects(newVNode, parentElement, isSvg, false)
        }
        catch (err) {
            tryHandleComponentError(parentElement, newVNode, isSvg, err)
        }

    }
}

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

        let oldNode: Node | undefined
        if (vNode.rendition !== undefined) {
            oldNode = vNode.rendition.domRef
        }
        const errorView = vNode.errorHandler(err)
        render(parentElement, errorView, vNode.rendition, oldNode, isSvg)
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
function findAndUnmountComponentsRec(vNode: VNode | undefined) {
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
        findAndUnmountComponentsRec(vNode.rendition!)
    }
    else if (vNode._ === VNodeType.Element) {
        for (const c of vNode.props.children) {
            findAndUnmountComponentsRec(c)
        }
    }
}

const enum RenderingAction {
    APPEND = 1,
    INSERT = 2,
    REPLACE = 3,
    UPDATE = 4
}

/** 
 * Renders the view by traversing the virtual node tree recursively 
 */
export function render(
    parentDomNode: Element,
    newVNode: VNode,
    oldVNode: VNode | undefined,
    existingDomNode: Node | undefined,
    isSvg = false,
    action: RenderingAction | undefined = undefined
): Node {
    if (action === undefined) {
        // Decide what action to take
        if (oldVNode === undefined || oldVNode.domRef === undefined) {
            action = RenderingAction.APPEND
        }
        else if (oldVNode.domRef !== undefined && existingDomNode === undefined) {
            action = RenderingAction.INSERT
        }
        else if (newVNode._ !== oldVNode._) {
            action = RenderingAction.REPLACE
        }
        else if (newVNode._ === VNodeType.Element && oldVNode._ === VNodeType.Element &&
            newVNode.tagName !== oldVNode.tagName) {
            action = RenderingAction.REPLACE
        }
        else if (newVNode._ === VNodeType.Component && oldVNode._ === VNodeType.Component &&
            newVNode.view !== oldVNode.view) {
            action = RenderingAction.REPLACE
        } else {
            action = RenderingAction.UPDATE
        }
    }

    if ((newVNode as ElementVNode<any>).tagName === 'svg') {
        isSvg = true
    }

    switch (action) {
        case RenderingAction.APPEND:
        case RenderingAction.INSERT:
        case RenderingAction.REPLACE:

            return renderCreate(
                parentDomNode,
                newVNode,
                oldVNode,
                existingDomNode,
                isSvg,
                action
            )

        case RenderingAction.UPDATE:
            return renderUpdate(
                parentDomNode,
                newVNode,
                oldVNode,
                existingDomNode,
                isSvg
            )
    }
}

/**
 * Creates a new DOM node from a VNode and then renders all it's children.
 */
function renderCreate(
    parentDomNode: Element,
    newVNode: VNode,
    oldVNode: VNode | undefined,
    existingDomNode: Node | undefined,
    isSvg = false,
    action: RenderingAction | undefined = undefined
) {
    let newNode = createNode(newVNode, parentDomNode, isSvg)
    newVNode.domRef = newNode

    if (action === RenderingAction.APPEND) {
        parentDomNode.appendChild(newNode)
    }
    else if (action === RenderingAction.INSERT) {
        parentDomNode.insertBefore(newNode, oldVNode!.domRef)
    }
    else { // action === ACTION_REPLACE

        // If it's a component node or an element node and it should be 
        // replaced, unmount any components in the tree.
        if (oldVNode!._ === VNodeType.Component || oldVNode!._ === VNodeType.Element) {
            findAndUnmountComponentsRec(oldVNode!)
        }

        // If it's an element node remove old event listeners before 
        // replacing the node. 
        if (oldVNode!._ === VNodeType.Element) {
            for (const attr in (oldVNode as ElementVNode<any>).props) {
                if (attr.indexOf('on') === 0) {
                    removeAttr(attr, existingDomNode as Element)
                }
            }
        }

        parentDomNode.replaceChild(newNode, existingDomNode!)
    }

    // If it's an element node set attributes and event listeners
    if (newVNode._ === VNodeType.Element) {
        const props = newVNode.props
        for (const name in props) {
            if (name === 'children' || name === 'key') {
                continue
            } else if (name === 'ref') {
                (props as any)[name].current = newNode
            }
            const attributeValue = (props as any)[name]

            if (attributeValue !== undefined) {
                setAttr(
                    newNode as HTMLElement,
                    name,
                    attributeValue
                )
            }
        }

        for (const c of props.children) {
            if (c !== undefined) {
                render(newNode as Element, c, c, undefined, isSvg, undefined)
            }
        }
    }

    return newVNode.domRef
}

/**
 * Updates an existing HTMLElement DOM node from a new VNode.
 */
function updateElementVNode(
    newVNode: ElementVNode<any>,
    oldVNode: ElementVNode<any>,
    existingDomNode: Node | undefined,
    isSvg = false
) {

    const newChildVNodes = newVNode.props.children
    const oldChildVNodes = oldVNode.props.children
    let diffNoOfChildNodes = oldChildVNodes.length - newChildVNodes.length

    if (newChildVNodes.length > 0) {
        // Create a map holding references to all the old child 
        // VNodes indexed by key
        const keyMap: Record<string, [VNode, Node] | undefined> = {}

        // Node "pool" for reuse
        const unkeyedNodes: Node[] = []

        // Prepare the map with the keys from the new nodes
        for (let i = 0; i < newChildVNodes.length; i++) {
            const newChildVNode = newChildVNodes[i] as ElementVNode<any>
            const props = newChildVNode.props
            if (props !== undefined && props !== null && props.key !== undefined) {
                keyMap[props.key] = undefined
            }
        }

        // Go through the old child VNodes to see if there are any old ones matching the new VNodes
        let matchingKeyedNodes = false
        for (let i = 0; i < oldChildVNodes.length; i++) {
            const oldChildVNode = oldChildVNodes[i] as ElementVNode<HTMLElement>
            const props = oldChildVNode.props
            if (props !== undefined && props !== null && props.key !== undefined) {
                // If the key has been added (from a new VNode), update it's value
                if (props.key in keyMap) {
                    keyMap[props.key] = [oldChildVNode, oldChildVNode.domRef!]
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
            let childAction: RenderingAction | undefined

            if (domNodeAtIndex !== null) {
                nextDomNode = domNodeAtIndex.nextSibling
            }

            // If there is an old VNode, it's DOM ref should be
            // treated as the current/matching DOM node
            if (oldChildVNode !== undefined) {
                matchingChildDomNode = oldChildVNode.domRef
            }

            const newProps = (newChildVNode as ElementVNode<any>).props
            // Check if the new VNode is "keyed"
            if (newProps !== undefined
                && oldChildVNodes.length > 0) {

                const newChildVNodeKey: Key | undefined = newProps.key

                if (newChildVNodeKey !== undefined) {

                    // Fetch the old keyed item from the key map
                    const keyMapEntry = keyMap[newChildVNodeKey]

                    // If there was no old matching key, reuse an old unkeyed node
                    if (keyMapEntry === undefined) {
                        matchingChildDomNode = unkeyedNodes.shift()
                        if (matchingChildDomNode !== undefined) {
                            // Make sure that the DOM node will be
                            // recreated when rendered
                            childAction = RenderingAction.REPLACE
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
}

/**
 * Updates a DOM not from a new VNode.
 */
function renderUpdate(
    parentDomNode: Element,
    newVNode: VNode,
    oldVNode: VNode | undefined,
    existingDomNode: Node | undefined,
    isSvg = false
) {
    // if (!nodesEqual(oldVNode.node, existingDomNode)) {
    //     // TODO: "debug mode" with warnings
    //     // console.error('The view is not matching the DOM. Are outside forces tampering with it?')
    // }

    // update existing node
    switch (newVNode._) {
        case VNodeType.Element: // element node

            updateElementAttributes(newVNode, oldVNode!, existingDomNode!)
            updateElementVNode(
                newVNode,
                oldVNode as ElementVNode<any>,
                existingDomNode,
                isSvg
            )
            break
        case VNodeType.Text: // text node
            if (existingDomNode!.textContent !== newVNode.value) {
                existingDomNode!.textContent = newVNode.value
            }
            break
        case VNodeType.Component: // component node

            newVNode.rendition = (oldVNode as ComponentVNode<any>).rendition
            newVNode.data = (oldVNode as ComponentVNode<any>).data
            newVNode.effects = (oldVNode as ComponentVNode<any>).effects
            newVNode.errorHandler = (oldVNode as ComponentVNode<any>).errorHandler
            newVNode.link = (oldVNode as ComponentVNode<any>).link
            newVNode.link.vNode = newVNode

            renderComponent(parentDomNode, newVNode, oldVNode as ComponentVNode<any>, isSvg)

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
    return newVNode.domRef
}

/** 
 * Creates a DOM Node from a VNode. 
 */
function createNode(vNode: VNode, parentElement: Element, isSvg: boolean): Node {
    switch (vNode._) {
        case VNodeType.Element:
            if (isSvg) {
                return document.createElementNS('http://www.w3.org/2000/svg', vNode.tagName)
            }
            return document.createElement(vNode.tagName)
        case VNodeType.Text:
            return document.createTextNode(vNode.value)
        case VNodeType.Component:

            renderComponent(parentElement, vNode, undefined, isSvg)

            if (vNode.domRef === undefined) {
                vNode.domRef = document.createComment('Nothing')
            }

            return vNode.domRef
        case VNodeType.Nothing:
        case VNodeType.Memo:
            return document.createComment('Nothing')
    }
}

/** 
 * Sets an attribute or event listener on an HTMLElement. 
 */
function setAttr(element: HTMLElement, attributeName: string, attributeValue: any) {
    // The the "value" attribute shoud be set explicitly (and only if it has 
    // changed) to prevent jumping cursors in some browsers (Safari)
    if (attributeName === 'value' && (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT')) {
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
 * Sets/removes attributes on an DOM element node
 */
function updateElementAttributes(newVNode: ElementVNode<any>, oldVNode: VNode, existingDomNode: Node) {
    const newProps = newVNode.props
    const oldProps = (oldVNode as ElementVNode<any>).props
    // remove any attributes that was added with the old virtual node but does 
    // not exist in the new virtual node or should be removed anyways (event listeners).
    for (const attributeName in oldProps) {
        if (attributeName === 'children' || attributeName === 'key' || attributeName === 'ref') {
            continue
        }
        if ((newProps as any)[attributeName] === undefined || attributeName.indexOf('on') === 0) {
            removeAttr(attributeName, existingDomNode as Element)
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
        hasAttr = (existingDomNode as Element).hasAttribute(name)

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
