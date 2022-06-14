import {
    ComponentProps,
    ComponentVNode,
    EffectWrapper,
    ElementVNode,
    FragmentVNode,
    Key,
    NothingVNode,
    TextVNode,
    VNode,
    VNodeType,
} from './contract'

interface IRenderingContext {
    hookIndex: number
    isSvg: boolean
    memo?: boolean
    oldVNode: VNode | undefined
    parentElement: Element
    vNode: ComponentVNode<ComponentProps>
}

/**
 * The renderingContext is used to obtain context varibles from within "hooks".
 */
let renderingContext: IRenderingContext | undefined

export function getRenderingContext() {
    return renderingContext
}

/**
 * An array of DOM nodes to use as DOM hierarchy references
 * when rendering nodes within fragment nodes. When a fragment
 * is rendered, any "nextSibling" will be pushed to this array,
 * and will then be used to insert other nodes. When the fragment
 * has been rendered, the last DOM node will be removed.
 */
const fragmentNextSiblings: Node[] = []

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

export function render(parentElement: Element, newChildVNodes: VNode[], oldChildVNodes: VNode[], isSvg = false) {

    const diffNoOfChildNodes = oldChildVNodes.length - newChildVNodes.length

    if (newChildVNodes.length > 0) {
        // Create a map holding references to all the old child 
        // VNodes indexed by key
        const keyMap: Record<string, [VNode, Node] | undefined> = {}

        let anyKeyedNodes = false

        // Prepare the map with the keys from the new nodes
        for (let i = 0; i < newChildVNodes.length; i++) {
            const newChildVNode = newChildVNodes[i] as ElementVNode<any>
            const props = newChildVNode.props
            if (props !== undefined && props !== null && props.key !== undefined) {
                keyMap[props.key] = undefined
                anyKeyedNodes = true
            }
        }

        // Go through the old child VNodes to see if there are any old ones matching the new VNodes
        // let matchingKeyedNodes = false
        if (anyKeyedNodes) {
            for (let i = 0; i < oldChildVNodes.length; i++) {
                const oldChildVNode = oldChildVNodes[i]
                const props = (oldChildVNode as ElementVNode<HTMLElement>).props

                if (props !== undefined && props !== null && props.key !== undefined) {
                    let oldDOMNode = oldChildVNode.domRef!

                    if (oldChildVNode._ === VNodeType.Fragment || oldChildVNode._ === VNodeType.Component && oldChildVNode.rendition!._ === VNodeType.Fragment) {
                        const fragmentNodes = getFragmentChildNodesRec(oldChildVNode._ === VNodeType.Component ? oldChildVNode.rendition as FragmentVNode : oldChildVNode)
                        const documentFragment = createDocumentFragmentNode()
                        const fragmentDOMNodes = Array<Node>(fragmentNodes.length)

                        for (let i = 0; i < fragmentNodes.length; i++) {
                            fragmentDOMNodes[i] = fragmentNodes[i].domRef
                        }

                        documentFragment.append(...fragmentDOMNodes)

                        oldDOMNode = documentFragment
                    }

                    // If the key has been added (from a new VNode), update it's value
                    if (props.key in keyMap) {
                        keyMap[props.key] = [oldChildVNode, oldDOMNode]
                    }
                }
            }
        }

        let domNodeAtIndex: Node | null = parentElement.firstChild
        let nextDomNode: Node | null = null

        for (let i = 0; i < newChildVNodes.length; i++) {
            const newChildVNode = newChildVNodes[i]
            let oldChildVNode: VNode | undefined = oldChildVNodes[i]
            let matchingChildDomNode: Node | undefined

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
            if (anyKeyedNodes && newProps !== undefined && oldChildVNodes.length > 0) {

                const newChildVNodeKey: Key | undefined = newProps.key
                if (newChildVNodeKey !== undefined) {

                    // Fetch the old keyed item from the key map
                    const keyMapEntry = keyMap[newChildVNodeKey]

                    // If there was no old matching key, reset oldChildVNode so 
                    // a new DOM node will be added (somewhat ugly) 
                    if (keyMapEntry === undefined) {

                        oldChildVNode = {
                            _: VNodeType.Nothing,
                        }
                        createAndSetNothingNode(oldChildVNode)
                        insertElementChildBefore(parentElement, oldChildVNode.domRef!, domNodeAtIndex)

                        nextDomNode = domNodeAtIndex
                    }
                    // If there was a matching key, use the old vNodes dom ref
                    else {

                        const [mappedVNode, domNode] = keyMapEntry

                        if (oldChildVNode !== undefined && mappedVNode != oldChildVNode) {
                            // Push the "unused" VNode to the end
                            oldChildVNodes.splice(i, 1)
                            oldChildVNodes.push(oldChildVNode);
                        }
                        oldChildVNode = mappedVNode
                        matchingChildDomNode = domNode
                    }

                    // FIXME: handle fragments with multiple children
                    // Move the matching dom node to it's new position
                    if (matchingChildDomNode !== undefined && matchingChildDomNode !== domNodeAtIndex) {
                        // If there is no DOM node at the current index, 
                        // the matching DOM node should be appended.
                        if (domNodeAtIndex === null) {
                            appendElementChild(parentElement, matchingChildDomNode)
                        }
                        // Move the node by replacing the node at the current index
                        else if (elementContainsNode(parentElement, matchingChildDomNode)) {

                            replaceElementChild(parentElement, matchingChildDomNode, domNodeAtIndex)

                            nextDomNode = matchingChildDomNode.nextSibling
                        }
                        else {
                            insertElementChildBefore(parentElement, matchingChildDomNode, domNodeAtIndex)

                            nextDomNode = matchingChildDomNode.nextSibling
                        }
                    }
                }
            }

            switch (newChildVNode._) {
                case VNodeType.Component:
                    renderComponentVNode(oldChildVNode, newChildVNode, parentElement, isSvg)
                    break

                case VNodeType.Element:
                    renderElementVNode(oldChildVNode, newChildVNode, parentElement, isSvg)
                    break

                case VNodeType.Fragment:
                    renderFragmentVNode(oldChildVNode, newChildVNode, parentElement, isSvg)
                    break

                case VNodeType.Nothing:
                    renderNothingVNode(oldChildVNode, newChildVNode, parentElement)
                    break

                case VNodeType.Text:
                    renderTextVNode(oldChildVNode, newChildVNode, parentElement)
                    break
            }

            domNodeAtIndex = nextDomNode
        }

        if (diffNoOfChildNodes > 0) {
            // const diffThresholdMet = diffNoOfChildNodes > (newChildVNodes.length / 2)
            // if (diffThresholdMet) {
            //     const newChildDomNodes: Node[] = []
            //     for (let i = 0; i < newChildVNodes.length; i++) {
            //         const n = newChildVNodes[i]

            //         if (n._ === VNodeType.Fragment || n._ === VNodeType.Component && n.rendition?._ === VNodeType.Fragment) {
            //             newChildDomNodes.push(...getFragmentChildNodesRec(n).map(fn => fn.domRef!))
            //         } else {
            //             newChildDomNodes.push(n.domRef!)
            //         }
            //     }

            //     parentElement.replaceChildren(...newChildDomNodes)
            // }

            // Remove old unused nodes backwards from the end
            for (let i = newChildVNodes.length + diffNoOfChildNodes - 1; i > newChildVNodes.length - 1; i--) {
                const oldChildVNode = oldChildVNodes[i]

                // Make sure any sub-components are "unmounted"
                cleanupRecursively(oldChildVNode, false)

                // if (!diffThresholdMet) {
                if (oldChildVNode._ === VNodeType.Fragment) {
                    removeFragmentDOMNodes(parentElement, oldChildVNode)
                } else if (oldChildVNode._ === VNodeType.Component && oldChildVNode.rendition?._ === VNodeType.Fragment) {
                    removeFragmentDOMNodes(parentElement, oldChildVNode.rendition as FragmentVNode)
                } else {
                    const oldChildDomNode = oldChildVNode.domRef!
                    if (oldChildDomNode !== undefined && elementContainsNode(parentElement, oldChildDomNode)) {
                        removeElementChild(parentElement, oldChildDomNode)
                    }
                }
                // }
            }
        }

    } else if (oldChildVNodes.length > 0) {
        // no new nodes, clear DOM and clean up
        parentElement.replaceChildren()

        for (let i = 0; i < oldChildVNodes.length; i++) {
            // Make sure any sub-components are "unmounted"
            cleanupRecursively(oldChildVNodes[i], false)
        }
    }
}

function renderTextVNode(oldChildVNode: VNode | undefined, newChildVNode: TextVNode, parentElement: Element) {
    if (oldChildVNode === undefined) {
        const newNode = createAndSetTextNode(newChildVNode)

        insertOrAppendDOMNode(parentElement, newNode)
    }

    // Reuse the old DOM node and update it's text content if 
    // changed
    else if (oldChildVNode._ === VNodeType.Text) {
        const reuseNode = oldChildVNode.domRef!
        newChildVNode.domRef = reuseNode
        if (reuseNode.textContent !== newChildVNode.text) {
            reuseNode.textContent = newChildVNode.text
        }
    }
    else if (oldChildVNode._ === VNodeType.Component && oldChildVNode.rendition!._ === VNodeType.Fragment) {
        replaceFragmentWithTextNode(parentElement, newChildVNode, oldChildVNode.rendition as FragmentVNode)
    }
    else if (oldChildVNode._ === VNodeType.Fragment) {
        replaceFragmentWithTextNode(parentElement, newChildVNode, oldChildVNode)
    }
    else {
        replaceNode(parentElement, newChildVNode, oldChildVNode, oldChildVNode?.domRef)
    }
}

function renderNothingVNode(oldChildVNode: VNode | undefined, newChildVNode: NothingVNode, parentElement: Element) {
    if (oldChildVNode === undefined) {
        const newNode = createAndSetNothingNode(newChildVNode)

        insertOrAppendDOMNode(parentElement, newNode)
    }

    // Reuse the old DOM node
    else if (oldChildVNode._ === VNodeType.Nothing) {
        newChildVNode.domRef = oldChildVNode.domRef
    }
    else if (oldChildVNode._ === VNodeType.Component && oldChildVNode.rendition!._ === VNodeType.Fragment) {
        replaceFragmentWithNothingNode(parentElement, newChildVNode, oldChildVNode.rendition as FragmentVNode)
    }
    else if (oldChildVNode._ === VNodeType.Fragment) {
        replaceFragmentWithNothingNode(parentElement, newChildVNode, oldChildVNode)
    }
    else {
        replaceNode(parentElement, newChildVNode, oldChildVNode, oldChildVNode.domRef!)
    }
}

function renderElementVNode(oldChildVNode: VNode | undefined, newChildVNode: ElementVNode<any>, parentElement: Element, isSvg: boolean) {
    if (newChildVNode.tagName === 'svg') {
        isSvg = true
    }

    // Create a new DOM element, add it to the parent DOM element 
    // and render the children.
    if (oldChildVNode === undefined) {
        const newNode = createAndSetElement(newChildVNode, isSvg)

        insertOrAppendDOMNode(parentElement, newNode)

        render(newNode, newChildVNode.props.children, [], isSvg)
    }
    // If the node type has not changed, reuse the old DOM node and
    // update it's attributes
    else if (oldChildVNode._ === VNodeType.Element && oldChildVNode.tagName === newChildVNode.tagName) {

        const reuseNode = oldChildVNode.domRef

        // Reuse the same DOM element
        newChildVNode.domRef = reuseNode

        // Update/remove/add any attributes
        updateElementAttributes(newChildVNode, oldChildVNode, reuseNode)

        // Render the element's children
        render(reuseNode as Element, newChildVNode.props.children, oldChildVNode.props.children, isSvg)
    }
    else if (oldChildVNode._ === VNodeType.Component && oldChildVNode.rendition!._ === VNodeType.Fragment) {
        replaceFragmentWithElementNode(parentElement, newChildVNode, oldChildVNode.rendition as FragmentVNode, isSvg)
    }
    else if (oldChildVNode._ === VNodeType.Fragment) {
        replaceFragmentWithElementNode(parentElement, newChildVNode, oldChildVNode, isSvg)
    }
    // Replace the old DOM node with a new element and render it's
    // children
    else {
        replaceNode(parentElement, newChildVNode, oldChildVNode, oldChildVNode.domRef, isSvg)
        render(newChildVNode.domRef, newChildVNode.props.children, [], isSvg)
    }
}

function renderFragmentVNode(oldChildVNode: VNode | undefined, newChildVNode: FragmentVNode, parentElement: Element, isSvg: boolean) {

    if (oldChildVNode === undefined) {
        render(parentElement, newChildVNode.props.children, [], isSvg)
    }
    else if (oldChildVNode._ === newChildVNode._) {
        const newChildren = newChildVNode.props.children
        const oldChildren = oldChildVNode.props.children

        let nextSibling: Node | null = null
        const allOldChildren = getFragmentChildNodesRec(oldChildVNode)
        for (let i = allOldChildren.length - 1; i > -1; i--) {
            const child = allOldChildren[i]
            if (child.domRef.parentElement === parentElement) {
                nextSibling = child.domRef.nextSibling
                break
            }
        }
        if (nextSibling !== null) {
            fragmentNextSiblings.push(nextSibling)
        }

        render(parentElement, newChildren, oldChildren, isSvg)

        if (fragmentNextSiblings[fragmentNextSiblings.length - 1] === nextSibling) {
            fragmentNextSiblings.pop()
        }
    }
    else {
        cleanupRecursively(oldChildVNode, false)

        const documentFragment = createDocumentFragmentNode()

        render(documentFragment as any as Element, newChildVNode.props.children, [], isSvg)

        replaceElementChild(parentElement, documentFragment, oldChildVNode.domRef!)
    }
}

function renderComponentVNode(oldChildVNode: VNode | undefined, newChildVNode: ComponentVNode<any>, parentElement: Element, isSvg: boolean) {
    let replaceOrUpdateVNode: VNode | undefined

    if (oldChildVNode !== undefined) {
        if (oldChildVNode._ === VNodeType.Component) {
            if (newChildVNode.view === oldChildVNode.view) {
                newChildVNode.data = oldChildVNode.data
                newChildVNode.effects = oldChildVNode.effects
                newChildVNode.errorHandler = oldChildVNode.errorHandler
                newChildVNode.link = oldChildVNode.link
                newChildVNode.link.vNode = newChildVNode
            } else {
                cleanupRecursively(oldChildVNode, true)
            }

            replaceOrUpdateVNode = oldChildVNode.rendition
        }
        else if (oldChildVNode._ === VNodeType.Fragment) {
            const oldNodes = getFragmentChildNodesRec(oldChildVNode)

            for (let i = 0; i < oldNodes.length; i++) {
                const oldNode = oldNodes[i]
                // TODO: Optimize by finding a node to reuse?
                if (replaceOrUpdateVNode === undefined && oldNode.domRef !== undefined) {
                    replaceOrUpdateVNode = oldNode
                }
                else if (oldNode.domRef !== undefined) {

                    cleanupRecursively(oldNode, false)

                    removeElementChild(parentElement, oldNode.domRef)
                }
            }
        }
        else {
            cleanupRecursively(oldChildVNode, true)
            replaceOrUpdateVNode = oldChildVNode
        }
    }

    renderComponent(
        parentElement,
        newChildVNode,
        oldChildVNode,
        replaceOrUpdateVNode,
        isSvg
    )
}

/**
 * Renders a component and then triggers any effects
 */
export function renderComponent(
    parentElement: Element,
    newVNode: ComponentVNode<any>,
    oldVNode: VNode | undefined,
    replaceOrUpdateVNode: VNode | undefined,
    isSvg: boolean
) {
    if (renderingContext === undefined && !newVNode.stale) {
        try {
            renderingContext = {
                vNode: newVNode,
                isSvg,
                oldVNode,
                parentElement,
                hookIndex: 0
            }

            let newView = newVNode.view(newVNode.props) as VNode

            if (oldVNode !== undefined && oldVNode._ === VNodeType.Component && renderingContext!.memo) {
                newVNode.domRef = oldVNode.domRef
                newVNode.rendition = oldVNode.rendition

                renderingContext = undefined

                return
            }

            renderingContext = undefined

            render(parentElement, [newView], replaceOrUpdateVNode === undefined ? [] : [replaceOrUpdateVNode], isSvg)

            newVNode.rendition = (newView as VNode)
            newVNode.domRef = (newView as VNode).domRef

            // Trigger synchronous effects (useLayoutEffect)
            triggerEffects(newVNode, parentElement, isSvg, true)

            // Trigger asynchronous effects (useEffect)
            triggerEffects(newVNode, parentElement, isSvg, false)
        }
        catch (err) {
            tryHandleComponentError(parentElement, newVNode, isSvg, err as Error)
        }
    }
}

function insertOrAppendDOMNode(parentElement: Element, newNode: Node) {
    const nextSibling = fragmentNextSiblings[fragmentNextSiblings.length - 1]
    if (nextSibling !== undefined && nextSibling.parentElement === parentElement) {
        insertElementChildBefore(parentElement, newNode, nextSibling)
    }
    else {
        appendElementChild(parentElement, newNode)
    }
}

function removeFragmentDOMNodes(parentElement: Element, oldChildVNode: FragmentVNode,) {
    const oldVNodes = getFragmentChildNodesRec(oldChildVNode)
    for (let i = oldVNodes.length; i > 0; i--) {
        const oldNode = oldVNodes[i - 1]
        if (oldNode.domRef !== undefined) {
            removeElementChild(parentElement, oldNode.domRef)
        }
    }
}

function replaceFragmentWithElementNode(parentElement: Element, newChildVNode: ElementVNode<any>, oldChildVNode: FragmentVNode, isSvg: boolean) {
    const oldNodes = getFragmentChildNodesRec(oldChildVNode)

    let reuseVNode: ElementVNode<any> | undefined
    let replaceVNode: VNode | undefined
    for (let i = 0; i < oldNodes.length; i++) {
        const oldNode = oldNodes[i]
        const doReuseNode = reuseVNode === undefined && (oldNode as ElementVNode<any>).tagName === newChildVNode.tagName

        cleanupRecursively(oldNode, doReuseNode)

        // Check for a DOM node to reuse
        if (doReuseNode) {
            reuseVNode = oldNode as ElementVNode<any>
        }
        // If no DOM node suitable for reuse is found, keep one to replace
        else if (replaceVNode === undefined && oldNode.domRef !== undefined) {
            replaceVNode = oldNode
        }
        else if (oldNode.domRef !== undefined) {
            removeElementChild(parentElement, oldNode.domRef)
        }
    }

    let oldChildren: VNode[] = []
    if (reuseVNode !== undefined) {

        // Clean up any temporary "replaceVNode"
        if (replaceVNode !== undefined) {
            removeElementChild(parentElement, replaceVNode.domRef)
        }

        // Reuse the same DOM element
        newChildVNode.domRef = reuseVNode.domRef

        // Update/remove/add any attributes
        updateElementAttributes(newChildVNode, reuseVNode, reuseVNode.domRef)

        oldChildren = reuseVNode.props.children
    }
    // We should have a DOM node to replace in this case
    else {
        replaceNode(parentElement, newChildVNode, replaceVNode!, replaceVNode!.domRef, isSvg)

        if ((replaceVNode as ElementVNode<any>).props !== undefined) {
            oldChildren = (replaceVNode as ElementVNode<any>).props.children
        }
    }

    // Render the element's children
    render(newChildVNode.domRef as Element, newChildVNode.props.children, oldChildren, isSvg)
}

function replaceFragmentWithNothingNode(parentElement: Element, newChildVNode: NothingVNode, oldChildVNode: FragmentVNode) {
    const oldNodes = getFragmentChildNodesRec(oldChildVNode)

    let reuseVNode: NothingVNode | undefined
    let replaceVNode: VNode | undefined
    for (let i = 0; i < oldNodes.length; i++) {
        const oldNode = oldNodes[i]
        const doReuseNode = reuseVNode === undefined && oldNode._ === VNodeType.Nothing

        cleanupRecursively(oldNode, doReuseNode)

        // Check for a DOM node to reuse
        if (doReuseNode) {
            reuseVNode = oldNode
        }
        // If no DOM node suitable for reuse is found, keep one to replace
        else if (replaceVNode === undefined && oldNode.domRef !== undefined) {
            replaceVNode = oldNode
        }
        else if (oldNode.domRef !== undefined) {
            removeElementChild(parentElement, oldNode.domRef)
        }
    }

    if (reuseVNode !== undefined) {

        // Clean up any temporary "replaceVNode"
        if (replaceVNode !== undefined) {
            removeElementChild(parentElement, replaceVNode.domRef)
        }

        // Reuse the same DOM element
        newChildVNode.domRef = reuseVNode.domRef
    }

    // We should have a DOM node to replace in this case
    else {
        replaceNode(parentElement, newChildVNode, replaceVNode!, replaceVNode?.domRef)
    }
}

function replaceFragmentWithTextNode(parentElement: Element, newChildVNode: TextVNode, oldChildVNode: FragmentVNode) {
    const oldNodes = getFragmentChildNodesRec(oldChildVNode)

    let reuseVNode: TextVNode | undefined
    let replaceVNode: VNode | undefined
    for (let i = 0; i < oldNodes.length; i++) {
        const oldNode = oldNodes[i]
        const doReuseNode = reuseVNode === undefined && oldNode._ === VNodeType.Text

        cleanupRecursively(oldNode, doReuseNode)

        // Check for a DOM node to reuse
        if (doReuseNode) {
            reuseVNode = oldNode
        }
        // If no DOM node suitable for reuse is found keep one to replace
        else if (replaceVNode === undefined && oldNode.domRef !== undefined) {
            replaceVNode = oldNode
        }
        else if (oldNode.domRef !== undefined) {
            removeElementChild(parentElement, oldNode.domRef)
        }
    }

    if (reuseVNode !== undefined) {

        // Clean up any temporary "replaceVNode"
        if (replaceVNode !== undefined) {
            removeElementChild(parentElement, replaceVNode.domRef)
        }

        // Reuse the same DOM element
        const reuseNode = reuseVNode.domRef!
        reuseNode.textContent = newChildVNode.text
        newChildVNode.domRef = reuseNode
    }

    // We should have a DOM node to replace in this case
    else {
        replaceNode(parentElement, newChildVNode, replaceVNode!, replaceVNode?.domRef)
    }
}

function replaceNode(parentElement: Element, newChildVNode: NothingVNode | TextVNode | ElementVNode<any>, oldChildVNode: VNode, oldDomNode: Node, isSvg = false) {

    cleanupRecursively(oldChildVNode, false)

    let newNode: Node
    switch (newChildVNode._) {
        case VNodeType.Element:
            newNode = createAndSetElement(newChildVNode, isSvg)
            break
        case VNodeType.Text:
            newNode = createAndSetTextNode(newChildVNode)
            break
        case VNodeType.Nothing:
            newNode = createAndSetNothingNode(newChildVNode)
            break
    }

    replaceElementChild(parentElement, newNode, oldDomNode)
}

/** 
 * Traverses the virtual node hierarchy and unmounts any components in the 
 * hierarchy.
 */
function cleanupRecursively(vNode: VNode | undefined, removeEventListeners: boolean) {
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

        vNode.stale = true

        cleanupRecursively(vNode.rendition!, removeEventListeners)
    }
    else if (vNode._ === VNodeType.Element || vNode._ === VNodeType.Fragment) {
        if (vNode._ === VNodeType.Element && removeEventListeners) {

            // If the old VNode is an element node, remove old event listeners 
            for (const attr in vNode.props) {
                if (attr.indexOf('on') === 0) {
                    removeElementAttribute(attr, vNode.domRef as Element)
                }
            }
        }

        for (const c of vNode.props.children) {
            cleanupRecursively(c, removeEventListeners)
        }
    }
}

/**
 * Recursively traverses the vNode tree, finds all fragment child nodes and 
 * reuturns them as a flattened array.
 */
function getFragmentChildNodesRec(fragmentNode: FragmentVNode | ComponentVNode<any>): VNode[] {
    const nodes: VNode[] = []
    for (const fragmentChild of fragmentNode.props.children) {
        if (fragmentChild._ === VNodeType.Fragment) {
            nodes.push(...getFragmentChildNodesRec(fragmentChild))
        }
        else if (fragmentChild._ === VNodeType.Component && fragmentChild.rendition?._ === VNodeType.Fragment) {
            nodes.push(...getFragmentChildNodesRec(fragmentChild.rendition))
        } else {
            nodes.push(fragmentChild)
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
                            tryHandleComponentError(parentElement, newVNode, isSvg, err as Error)
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
 * Creates a DOM element, set it's attributes from vNode.props, and sets the
 * new Element to vNode.domRef.
 */
function createAndSetElement(vNode: ElementVNode<any>, isSvg: boolean): Element {

    const attributes = vNode.props
    const tagName = vNode.tagName

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

    vNode.domRef = el

    return el
}

/**
 * Creates a comment DOM node and sets it to vNode.domRef.
 */
function createAndSetNothingNode(vNode: NothingVNode): Node {
    const el = document.createComment('Nothing')
    vNode.domRef = el
    return el
}

/**
 * Creates a text DOM node with textContent set to vNode.text and sets it to 
 * vNode.domRef.
 */
function createAndSetTextNode(vNode: TextVNode): Node {
    const el = document.createTextNode(vNode.text)
    vNode.domRef = el
    return el
}

function createDocumentFragmentNode(): DocumentFragment {
    return document.createDocumentFragment()
}

function appendElementChild(parentElement: Element, newNode: Node) {
    parentElement.appendChild(newNode)
}

function elementContainsNode(parentElement: Element, node: Node) {
    return parentElement.contains(node)
}

function insertElementChildBefore(parentElement: Element, newNode: Node, beforeChild: Node | null) {
    parentElement.insertBefore(newNode, beforeChild)
}

function replaceElementChild(parentElement: Element, newChild: Node, oldChild: Node) {
    parentElement.replaceChild(newChild, oldChild)
}

function removeElementChild(parentElement: Element, oldDOMNode: Node) {
    parentElement.removeChild(oldDOMNode)
}
