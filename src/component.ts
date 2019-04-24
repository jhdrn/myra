/** @internal */
import {
    ElementVNode,
    UpdateState,
    VNode,
    ComponentVNode,
    Evolve,
    LifecycleEvent,
    LifecycleEventListener,
    ComponentProps,
    TextVNode,
    ErrorHandler,
    Ref,
    LifecyclePhase
} from './contract'
import { equal, typeOf } from './helpers'
import { VNODE_ELEMENT, VNODE_COMPONENT, VNODE_TEXT, VNODE_NOTHING } from './constants'

interface IRenderingContext {
    vNode: ComponentVNode<ComponentProps>
    isSvg: boolean
    parentElement: Element
    hookIndex: number
}

let renderingContext: IRenderingContext | undefined

function useState<TState>(initialState: TState): [TState, Evolve<TState>] {

    const { hookIndex, isSvg, parentElement, vNode } = renderingContext!
    if (vNode.data === undefined) {
        vNode.data = []
    }

    if (vNode.data[hookIndex] === undefined) {
        vNode.data[hookIndex] = initialState
    }

    const link = vNode.link

    function evolve(update: UpdateState<any>) {
        const currentVNode = link.vNode
        try {
            if (typeof update === 'function') {
                update = update(currentVNode.data![hookIndex])
            }

            const updateType = typeOf(update)
            if (updateType === 'object') {
                currentVNode.data![hookIndex] = {
                    ...(currentVNode.data![hookIndex] as any),
                    ...(update as object)
                }
            }
            else {
                currentVNode.data![hookIndex] = update
            }

            if (renderingContext === undefined) {
                requestAnimationFrame(() => {
                    renderComponent(parentElement, link.vNode, isSvg, undefined)
                })
            }
        } catch (err) {
            requestAnimationFrame(() => {
                tryHandleComponentError(parentElement, currentVNode, isSvg, err)
            })
        }
        return currentVNode.data![hookIndex]
    }

    const state = vNode.data[hookIndex]
    renderingContext!.hookIndex++

    return [state, evolve]
}

function useRef<T>(current?: T): Ref<T> {
    const { hookIndex, vNode } = renderingContext!
    if (vNode.data === undefined) {
        vNode.data = []
    }

    if (vNode.data[hookIndex] === undefined) {
        const link = vNode.link
        vNode.data[hookIndex] = {
            current,
            get node() {
                return link.vNode.domRef
            }
        }
    }
    renderingContext!.hookIndex++
    return vNode.data[hookIndex]
}

function useErrorHandler(handler: ErrorHandler) {

    const vNode = renderingContext!.vNode as ComponentVNode<any>
    vNode.errorHandler = handler
}

function useLifecycle(callback: LifecycleEventListener<any>) {

    const { hookIndex, vNode } = renderingContext!

    if (vNode.events === undefined) {
        vNode.events = []
    }

    vNode.events[hookIndex] = callback

    renderingContext!.hookIndex++
}

function useMemo<TMemoization, TArgs>(fn: (args: TArgs) => TMemoization, inputs: TArgs) {

    const { hookIndex, vNode } = renderingContext!

    if (vNode.data === undefined) {
        vNode.data = []
    }

    let res: TMemoization
    if (vNode.data[hookIndex] === undefined) {
        res = fn(inputs)
        vNode.data[hookIndex] = [res, inputs]
    }
    else {
        let [prevRes, prevInputs] = vNode.data[hookIndex]
        if (equal(prevInputs, inputs)) {
            res = prevRes
        }
        else {
            res = fn(inputs)
            vNode.data[hookIndex] = [res, inputs]
        }
    }

    renderingContext!.hookIndex++
    return res
}

const context = {
    useRef,
    useErrorHandler,
    useLifecycle,
    useMemo,
    useState
}

function renderComponent(parentElement: Element, newVNode: ComponentVNode<any>, isSvg: boolean, oldVNode: ComponentVNode<any> | undefined) {

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

            const newView = newVNode.view(newProps, context)

            const { events } = newVNode

            renderingContext = undefined

            let oldProps = undefined
            if (oldVNode !== undefined) {
                oldProps = oldVNode.props
            }

            if (oldNode === undefined) {
                triggerLifeCycleEvent(events, { phase: LifecyclePhase.BeforeMount })
            }

            let doPreventRender = false

            triggerLifeCycleEvent(events, {
                phase: LifecyclePhase.BeforeRender,
                oldProps,
                preventRender: () => {
                    doPreventRender = true
                }
            })

            if (!doPreventRender) {

                render(parentElement, newView, newVNode.rendition, oldNode, isSvg)

                newVNode.rendition = newView
                newVNode.domRef = newView.domRef

                triggerAsyncLifecycleEvent(newVNode, { phase: LifecyclePhase.AfterRender, domRef: newView.domRef }, parentElement, isSvg)

                if (oldNode === undefined) {
                    triggerAsyncLifecycleEvent(newVNode, { phase: LifecyclePhase.AfterMount, domRef: newView.domRef }, parentElement, isSvg)
                }

            }
            else if (oldVNode !== undefined) {
                newVNode.domRef = oldVNode.domRef
            }
            renderingContext = undefined
        }
        catch (err) {
            tryHandleComponentError(parentElement, newVNode, isSvg, err)
        }

    }
}

function triggerAsyncLifecycleEvent(newVNode: ComponentVNode<any>, ev: LifecycleEvent<any>, parentElement: Element, isSvg: boolean) {
    const events = newVNode.events
    if (events !== undefined) {
        Promise.resolve().then(() =>
            triggerLifeCycleEvent(events, ev)
        ).catch(err =>
            tryHandleComponentError(parentElement, newVNode, isSvg, err)
        )
    }
}

function triggerLifeCycleEvent(events: Array<LifecycleEventListener<any>> | undefined, event: LifecycleEvent<any>) {
    if (events !== undefined) {
        for (let i = 0; i < events.length; i++) {
            if (events[i] !== undefined) {
                events[i](event)
            }
        }
    }
}

function tryHandleComponentError(parentElement: Element, vNode: ComponentVNode<any>, isSvg: boolean, err: Error) {

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
    if (vNode._ === VNODE_COMPONENT) {
        triggerLifeCycleEvent(vNode.events, { phase: LifecyclePhase.BeforeUnmount, domRef: vNode.domRef! })

        findAndUnmountComponentsRec(vNode.rendition!)
    }
    else if (vNode._ === VNODE_ELEMENT) {
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
        const props = newVNode.props
        for (const name in props) {
            if (name === 'children') {
                continue
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

                const newChildVNodeKey: string | undefined = newProps.key

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
            if (existingDomNode!.textContent !== newVNode.value) {
                existingDomNode!.textContent = newVNode.value
            }
            break
        case VNODE_COMPONENT: // stateless component node

            newVNode.rendition = (oldVNode as ComponentVNode<any>).rendition
            newVNode.data = (oldVNode as ComponentVNode<any>).data
            newVNode.events = (oldVNode as ComponentVNode<any>).events
            newVNode.link = (oldVNode as ComponentVNode<any>).link
            newVNode.link.vNode = newVNode

            if (oldVNode === undefined ||
                (newVNode.props as any).forceUpdate ||
                !equalProps((oldVNode as ComponentVNode<any>).props, newVNode.props)) {

                renderComponent(parentDomNode, newVNode, isSvg, oldVNode as ComponentVNode<any>)
            }

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
    const newProps = newVNode.props
    const oldProps = (oldVNode as ElementVNode<any>).props
    // remove any attributes that was added with the old virtual node but does 
    // not exist in the new virtual node or should be removed anyways (event listeners).
    for (const attributeName in oldProps) {
        if (attributeName === 'children') {
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
        if (name === 'children') {
            continue
        }
        attributeValue = (newProps as any)[name]
        oldAttributeValue = (oldProps as any)[name]
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
