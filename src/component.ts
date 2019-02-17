/** @internal */
import {
    ElementVNode,
    UpdateState,
    VNode,
    ComponentVNode,
    Evolve,
    LifeCycleEvent,
    LifeCycleEventListener,
    ComponentProps,
    TextVNode,
    ErrorHandler
} from './contract'
import { equal } from './helpers'
import { VNODE_ELEMENT, VNODE_COMPONENT, VNODE_TEXT, VNODE_NOTHING } from './constants'

interface IRenderingContext {
    vNode: ComponentVNode<ComponentProps>
    isSvg: boolean
    parentElement: Element
    hookIndex: number
    shouldRender: boolean
}

let renderingContext: IRenderingContext | undefined

/** 
 * Traverses the virtual node hierarchy and unmounts any components in the 
 * hierarchy.
 */
function findAndUnmountComponentsRec(vNode: VNode | undefined) {
    if (vNode === undefined) {
        return
    }
    if (vNode._ === VNODE_COMPONENT) {
        triggerLifeCycleEvent(vNode.events, { type: 'willUnmount' })

        findAndUnmountComponentsRec(vNode.rendition!)
    }
    else if (vNode._ === VNODE_ELEMENT) {
        for (const c of vNode.props.children) {
            findAndUnmountComponentsRec(c)
        }
    }
}

function useState<TState>(initialState: TState): [TState, Evolve<TState>] {

    const vNode = renderingContext!.vNode as ComponentVNode<any>
    if (vNode.data === undefined) {
        vNode.data = []
    }

    const parentElement = renderingContext!.parentElement
    const isSvg = renderingContext!.isSvg
    const stateIndex = renderingContext!.hookIndex

    if (vNode.data[stateIndex] === undefined) {
        vNode.data[stateIndex] = initialState
    }

    function evolve(update: UpdateState<any>) {
        const currentVNode = vNode.link.vNode
        try {
            if (typeof update === 'function') {
                update = update(currentVNode.data![stateIndex])
            }

            currentVNode.data![stateIndex] = {
                ...(currentVNode.data![stateIndex] as any),
                ...(update as object)
            }

            if (currentVNode.dispatchLevel === 0) {
                currentVNode.dispatchLevel++
                if (renderingContext === undefined) {
                    requestAnimationFrame(() => {
                        renderComponent(parentElement, vNode.link.vNode, isSvg, undefined)
                        vNode.link.vNode.dispatchLevel--
                    })
                }
                else {
                    //renderComponent(parentElement, currentVNode, isSvg, undefined)
                    currentVNode.dispatchLevel--
                }
            }
        } catch (err) {
            requestAnimationFrame(() => {
                tryHandleComponentError(parentElement, currentVNode, isSvg, err)
            })
        }
        return currentVNode.data![stateIndex]
    }

    const state = vNode.data[stateIndex]
    renderingContext!.hookIndex++

    return [state, evolve]
}

function getDomRef(): Node | undefined {
    const vNode = renderingContext!.vNode as ComponentVNode<any>
    return vNode.domRef
}

function useDefaultProps<TProps extends object>(defaultProps: TProps): TProps {
    // Merge any defaultProps with received props
    return { ...(defaultProps as object), ...renderingContext!.vNode.props } as TProps
}

function useErrorHandler(handler: ErrorHandler) {

    const vNode = renderingContext!.vNode as ComponentVNode<any>
    vNode.errorHandler = handler
}

function useLifeCycle<TProps>(callback: LifeCycleEventListener<LifeCycleEvent<TProps>>) {

    const vNode = renderingContext!.vNode as ComponentVNode<any>

    if (vNode.events === undefined) {
        vNode.events = []
    }

    if (vNode.events[renderingContext!.hookIndex] === undefined) {
        vNode.events[renderingContext!.hookIndex] = callback
    }

    renderingContext!.hookIndex++
}

function useMemo<TMemoization, TArgs>(fn: (args: TArgs) => TMemoization, inputs: TArgs) {

    const vNode = renderingContext!.vNode

    if (vNode.data === undefined) {
        vNode.data = []
    }

    let res: TMemoization
    if (vNode.data[renderingContext!.hookIndex] === undefined) {
        res = fn(inputs)
        vNode.data[renderingContext!.hookIndex] = [res, inputs]
    }
    else {
        let [prevRes, ...prevInputs] = vNode.data[renderingContext!.hookIndex]
        if (equal(prevInputs, inputs)) {
            res = prevRes
        }
        else {
            res = fn(inputs)
            vNode.data[renderingContext!.hookIndex] = [res, inputs]
        }
    }

    renderingContext!.hookIndex++
    return res
}

function shouldRender(shouldRender: boolean) {
    renderingContext!.shouldRender = shouldRender
}

const context = {
    getDomRef,
    useDefaultProps,
    useErrorHandler,
    useLifeCycle,
    useMemo,
    useState,
    shouldRender
}

function renderComponent(parentElement: Element, newVNode: ComponentVNode<any>, isSvg: boolean, oldVNode: ComponentVNode<any> | undefined) {

    let newView: VNode | undefined

    let oldNode: Node | undefined
    if (newVNode.rendition !== undefined) {
        oldNode = newVNode.rendition.domRef
    }

    if (renderingContext === undefined) {

        try {
            let shouldRender =
                oldVNode === undefined ||
                (newVNode.props as any).forceUpdate ||
                !equalProps(oldVNode.props, newVNode.props)

            renderingContext = {
                vNode: newVNode,
                isSvg,
                parentElement,
                hookIndex: 0,
                shouldRender: shouldRender
            }

            newView = newVNode.view(newVNode.props, context)

            shouldRender = renderingContext.shouldRender
            renderingContext = undefined

            if (shouldRender) {
                if (oldNode === undefined) {
                    triggerLifeCycleEvent(newVNode.events, { type: 'willMount' })
                }

                triggerLifeCycleEvent(newVNode.events, { type: 'willRender', oldProps: {} })

                render(parentElement, newView, newVNode.rendition, oldNode, isSvg)

                triggerLifeCycleEvent(newVNode.events, { type: 'didRender' })

                if (oldNode === undefined) {
                    triggerLifeCycleEvent(newVNode.events, { type: 'didMount' })
                }
            }
        }
        catch (err) {
            if (newVNode.errorHandler !== undefined) {

                // Cleanup any nodes that already was rendered
                let topNode: Node | undefined
                if (newView !== undefined && newView.domRef !== undefined) {
                    topNode = newView.domRef
                }
                if (topNode === undefined) {
                    topNode = oldNode
                }

                if (topNode !== undefined) {
                    parentElement.removeChild(topNode)
                }

                tryHandleComponentError(parentElement, newVNode, isSvg, err)

                return
            } else {
                // Propagate the error upwards in the hierarchy
                throw err
            }
        }

        newVNode.rendition = newView
        newVNode.domRef = newView.domRef
    }
}

function triggerLifeCycleEvent(events: Array<LifeCycleEventListener<LifeCycleEvent<any>>> | undefined, event: LifeCycleEvent<any>) {
    if (events !== undefined) {
        for (let i = 0; i < events.length; i++) {
            if (events[i] !== undefined) {
                events[i](event)
            }
        }
    }
}

function tryHandleComponentError(parentElement: Element, vNode: ComponentVNode<any>, isSvg: boolean, err: Error) {

    renderingContext = undefined
    if (vNode.errorHandler !== undefined) {

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

enum RenderingAction {
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
        else if (newVNode._ === VNODE_ELEMENT && oldVNode._ === VNODE_ELEMENT &&
            newVNode.tagName !== oldVNode.tagName) {
            action = RenderingAction.REPLACE
        }
        else if (newVNode._ === VNODE_COMPONENT && oldVNode._ === VNODE_COMPONENT &&
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

function renderCreate(
    parentDomNode: Element,
    newVNode: VNode,
    oldVNode: VNode | undefined,
    existingDomNode: Node | undefined,
    isSvg = false,
    action: RenderingAction | undefined = undefined
) {
    let newNode = createNode(newVNode, parentDomNode, isSvg)
    if (newNode === undefined) {
        // FIXME?
    }
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

    // If it's an element node set attributes and event listeners
    if (newVNode._ === VNODE_ELEMENT) {

        for (const name in newVNode.props) {
            if (name === 'children') {
                continue
            }
            const attributeValue = (newVNode.props as any)[name]

            if (attributeValue !== undefined) {
                setAttr(
                    newNode as HTMLElement,
                    name,
                    attributeValue
                )
            }
        }

        for (const c of newVNode.props.children) {
            if (c !== undefined) {
                render(newNode as Element, c, c, undefined, isSvg, undefined)
            }
        }
    }

    return newVNode.domRef
}

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
            let childAction: RenderingAction | undefined

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
        case VNODE_ELEMENT: // element node

            updateElementAttributes(newVNode, oldVNode!, existingDomNode!)
            updateElementVNode(
                newVNode,
                oldVNode as ElementVNode<any>,
                existingDomNode,
                isSvg
            )
            break
        case VNODE_TEXT: // text node
            existingDomNode!.textContent = newVNode.value
            break
        case VNODE_COMPONENT: // stateless component node

            newVNode.rendition = (oldVNode as ComponentVNode<any>).rendition
            newVNode.data = (oldVNode as ComponentVNode<any>).data
            newVNode.events = (oldVNode as ComponentVNode<any>).events
            newVNode.link = (oldVNode as ComponentVNode<any>).link
            newVNode.link.vNode = newVNode

            renderComponent(parentDomNode, newVNode, isSvg, oldVNode as ComponentVNode<any>)

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

function equalProps(a: ComponentProps, b: ComponentProps) {
    if (Object.keys(a).length !== Object.keys(b).length) {
        return false
    }
    for (const k in a) {
        if (a.hasOwnProperty(k)) {
            if (k === 'children') {
                const children = a[k]
                if (children.length !== b[k].length) {
                    return false
                }

                for (let i = 0; i < children.length; i++) {
                    const aChild = children[i]
                    const bChild = b[k][i]
                    if (aChild._ !== bChild._) {
                        return false
                    }
                    if (aChild._ === VNODE_COMPONENT || aChild._ === VNODE_ELEMENT) {
                        if (!equalProps(aChild.props, (bChild as ElementVNode<any>).props)) {
                            return false
                        }
                    }
                    else if (aChild._ === VNODE_TEXT && !equal(aChild.value, (bChild as TextVNode).value)) {
                        return false
                    }
                }
            }
            else if (!equal((a as any)[k], (b as any)[k])) {
                return false
            }
        }
    }
    return true
}

/** 
 * Creates a Node from a VNode. 
 */
function createNode(vNode: VNode, parentElement: Element, isSvg: boolean): Node {
    switch (vNode._) {
        case VNODE_ELEMENT:
            if (isSvg) {
                return document.createElementNS('http://www.w3.org/2000/svg', vNode.tagName)
            }
            return document.createElement(vNode.tagName)
        case VNODE_TEXT:
            return document.createTextNode(vNode.value)
        case VNODE_COMPONENT:

            renderComponent(parentElement, vNode, isSvg, undefined)

            if (vNode.domRef === undefined) {
                vNode.domRef = document.createComment('Nothing')
            }

            return vNode.domRef
        case VNODE_NOTHING:
            return document.createComment('Nothing')
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
 * Sets/removes attributes on an element node
 */
function updateElementAttributes(newVNode: ElementVNode<any>, oldVNode: VNode, existingDomNode: Node) {
    // remove any attributes that was added with the old virtual node but does 
    // not exist in the new virtual node or should be removed anyways (event listeners).
    for (const attributeName in (oldVNode as ElementVNode<any>).props) {
        if (attributeName === 'children') {
            continue
        }
        if ((newVNode.props as any)[attributeName] === undefined || attributeName.indexOf('on') === 0) {
            removeAttr(attributeName, existingDomNode as Element)
        }
    }

    let attributeValue: any
    let oldAttributeValue: any
    let hasAttr: boolean

    // update any attribute where the attribute value has changed
    for (const name in newVNode.props) {
        if (name === 'children') {
            continue
        }
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
