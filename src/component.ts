/** @internal */
import {
    ComponentVNode,
    ElementVNode,
    UpdateState,
    VNode,
    StatelessComponentVNode,
    SetupContext,
    RenderedContext
} from './contract'
import { equal } from './helpers'
import { VNODE_COMPONENT, VNODE_ELEMENT, VNODE_FUNCTION, VNODE_TEXT, VNODE_NOTHING } from './constants'


/** 
 * Traverses the virtual node hierarchy and unmounts any components in the 
 * hierarchy.
 */
function findAndUnmountComponentsRec(vNode: VNode) {
    if (vNode._ === VNODE_COMPONENT) {
        if (vNode.ctx.willUnmount !== undefined) {
            vNode.ctx.willUnmount(vNode.ctx as RenderedContext<any, any>)
        }
        findAndUnmountComponentsRec(vNode.rendition!)
    }
    else if (vNode._ === VNODE_FUNCTION) {
        findAndUnmountComponentsRec(vNode.rendition!)
    }
    else if (vNode._ === VNODE_ELEMENT) {
        for (const c of vNode.children) {
            findAndUnmountComponentsRec(c)
        }
    }
}

/**
 * Tries to render the view.
 */
function tryRenderComponent<TState extends {}, TProps extends {}>(parentElement: Element, vNode: ComponentVNode<TState, TProps>, isSvg: boolean) {

    vNode.dispatchLevel++

    // Render view if the component was already initialized and the 
    // dispatchLevel is at "lowest" level (i.e. 1).
    if (vNode.dispatchLevel === 1) {

        if (vNode.ctx.willRender !== undefined) {
            vNode.ctx.willRender(vNode.ctx)
        }

        doRenderComponent(parentElement, vNode, isSvg)

        if (vNode.ctx.didRender !== undefined) {
            vNode.ctx.didRender(vNode.ctx as RenderedContext<any, any>)
        }
    }
    vNode.dispatchLevel--
}

function doRenderComponent(parentElement: Element, vNode: ComponentVNode<any, any> | StatelessComponentVNode<any>, isSvg: boolean) {
    let newView: VNode | undefined

    let oldNode: Node | undefined
    if (vNode.rendition !== undefined) {
        oldNode = vNode.rendition.domRef
    }

    try {
        if (vNode._ === VNODE_COMPONENT) {
            newView = vNode.view(vNode.state, vNode.props, vNode.children)
        }
        else {
            newView = vNode.view(vNode.props, vNode.children)
        }

        render(parentElement, newView, vNode.rendition, oldNode, isSvg)
    }
    catch (err) {
        if (vNode._ === VNODE_COMPONENT && vNode.ctx.onError !== undefined) {
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

            tryHandleComponentError(parentElement, vNode, isSvg, err)

            return
        } else {
            // Propagate the error upwards in the hierarchy
            throw err
        }
    }

    vNode.rendition = newView
    vNode.domRef = newView.domRef
}

function tryHandleComponentError(parentElement: Element, vNode: ComponentVNode<any, any> | StatelessComponentVNode<any>, isSvg: boolean, err: Error) {

    if (vNode._ === VNODE_COMPONENT && vNode.ctx.onError !== undefined) {

        let oldNode: Node | undefined
        if (vNode.rendition !== undefined) {
            oldNode = vNode.rendition.domRef
        }
        const errorView = vNode.ctx.onError(err)
        render(parentElement, errorView, vNode.rendition, oldNode, isSvg)
        vNode.rendition = errorView
        vNode.domRef = errorView.domRef
    }
    else {
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
            newVNode.spec !== oldVNode.spec) {
            action = RenderingAction.REPLACE
        }
        else {
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

            let newNode = createNode(newVNode, parentDomNode, isSvg)
            if (newNode === undefined) {

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

            return newVNode.domRef

        case RenderingAction.UPDATE:
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
                    break
                case VNODE_TEXT: // text node
                    existingDomNode!.textContent = newVNode.value
                    break
                case VNODE_COMPONENT: // component node
                case VNODE_FUNCTION: // stateless component node

                    const shouldRender =
                        newVNode.props !== undefined
                        && newVNode.props !== null
                        && (newVNode.props as any).forceUpdate
                        || !equal((oldVNode as ComponentVNode<any, any>).props, newVNode.props)
                        || !equal((oldVNode as ComponentVNode<any, any>).children, newVNode.children)

                    newVNode.rendition = (oldVNode as ComponentVNode<any, any>).rendition

                    if (newVNode._ === VNODE_COMPONENT) {

                        newVNode.view = (oldVNode as ComponentVNode<any, any>).view
                        newVNode.state = (oldVNode as ComponentVNode<any, any>).state
                        newVNode.link = (oldVNode as ComponentVNode<any, any>).link
                        newVNode.link.vNode = newVNode
                        newVNode.dispatchLevel = 0
                        newVNode.ctx = (oldVNode as ComponentVNode<any, any>).ctx
                        try {
                            if (shouldRender
                                && (newVNode.ctx.shouldRender === undefined
                                    || newVNode.ctx.shouldRender((oldVNode as ComponentVNode<any, any>).props, newVNode.props))) {

                                tryRenderComponent(parentDomNode, newVNode, isSvg)
                            }
                        } catch (err) {
                            tryHandleComponentError(parentDomNode, newVNode, isSvg, err)
                        }
                    }
                    else if (shouldRender) {
                        doRenderComponent(parentDomNode, newVNode, isSvg)
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
        case VNODE_FUNCTION:
            if (vNode._ === VNODE_COMPONENT) {
                const link = {
                    vNode: vNode
                }
                vNode.link = link

                const ctx: SetupContext<any, any> = {
                    get state() {
                        return link.vNode.state
                    },
                    get props() {
                        return link.vNode.props
                    },
                    get domRef() {
                        return link.vNode.domRef as Element | undefined
                    },
                    evolve: function evolve(update: UpdateState<any>) {
                        try {
                            if (typeof update !== 'object') {
                                update = update(link.vNode.state)
                            }
                            link.vNode.state = { ...(link.vNode.state as any), ...(update as object) }
                            tryRenderComponent(parentElement, link.vNode, isSvg)
                        } catch (err) {
                            tryHandleComponentError(parentElement, link.vNode, isSvg, err)
                        }

                    }
                }
                vNode.ctx = ctx

                try {
                    const view = vNode.spec(ctx)
                    vNode.view = view

                    // Merge any defaultProps with received props
                    if (ctx.defaultProps !== undefined) {
                        vNode.props = { ...ctx.defaultProps, ...vNode.props }
                    }

                    if (ctx.willMount !== undefined) {
                        // Setting dispatchLevel to 1 will make any dispatch call just update
                        // the state without rendering the view
                        vNode.dispatchLevel = 1
                        ctx.willMount(ctx)
                    }
                    vNode.dispatchLevel = 0

                    if (ctx.shouldRender === undefined
                        || ctx.shouldRender(ctx.defaultProps === undefined ? {} : ctx.defaultProps, vNode.props)) {

                        // Render the view. 
                        tryRenderComponent(parentElement, vNode, isSvg)
                    }

                    if (ctx.didMount !== undefined) {
                        ctx.didMount(ctx as RenderedContext<any, any>)
                    }
                }
                catch (err) {
                    tryHandleComponentError(parentElement, link.vNode, isSvg, err)
                }
            }
            else {
                doRenderComponent(parentElement, vNode, isSvg)
            }

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
        if ((newVNode.props as any)[attributeName] === undefined || attributeName.indexOf('on') === 0) {
            removeAttr(attributeName, existingDomNode as Element)
        }
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
