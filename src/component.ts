import {
    ComponentProps,
    ComponentVNode,
    EffectWrapper,
    ElementVNode,
    FragmentVNode,
    NothingVNode,
    TextVNode,
    VNode,
    VNodeType,
    Key,
} from './contract'
import { appendElementChild, createDocumentFragmentNode, elementContainsNode, getPropValue, insertElementChildBefore, removeElementAttribute, removeElementChild, replaceElementChild, setElementAttribute } from './helpers'

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
export function tryHandleComponentError(parentElement: Element, vNode: ComponentVNode<ComponentProps>, isSvg: boolean, err: Error) {

    // Do nothing if the parentElement is not longer connected to the DOM
    if (parentElement.parentNode === null) {
        return
    }

    if (vNode.errorHandler !== undefined) {

        renderingContext = undefined

        const errorView = vNode.errorHandler(err)

        render(parentElement, [errorView], vNode.rendition === undefined ? [] : [vNode.rendition], isSvg)

        vNode.rendition = errorView
    } else {
        throw err
    }
}

export function render(parentElement: Element, newChildVNodes: VNode[], oldChildVNodes: VNode[], isSvg = false) {

    if (newChildVNodes.length > 0) {
        // Create a map holding references to all the old child 
        // VNodes indexed by key
        // Use Map<Key, [VNode, Node]> for keyMap to support string | number keys
        const keyMap: Map<Key, [VNode, Node] | undefined> = new Map()

        // Node "pool" for reuse
        const unkeyedNodes: Node[] = []

        const newKeys: Set<Key> = new Set()

        let anyKeyedNodes = false
        for (let i = 0; i < newChildVNodes.length; i++) {
            const newChildVNode = newChildVNodes[i] as ElementVNode<Element>
            const props = newChildVNode.props
            if (props !== undefined && props !== null && props.key !== undefined) {
                newKeys.add(props.key)
                anyKeyedNodes = true
            }
        }
        // Only build keyMap for old nodes with keys present in newKeys
        if (oldChildVNodes.length > 0 && anyKeyedNodes) {
            for (let i = 0; i < oldChildVNodes.length; i++) {
                const oldChildVNode = oldChildVNodes[i]
                const props = (oldChildVNode as ElementVNode<HTMLElement>).props
                if (props !== undefined && props !== null && props.key !== undefined && newKeys.has(props.key)) {
                    let oldDOMNode = oldChildVNode.domRef!
                    if (oldChildVNode._ === VNodeType.Fragment || (oldChildVNode._ === VNodeType.Component && oldChildVNode.rendition!._ === VNodeType.Fragment)) {
                        const fragmentNodes = getFragmentChildNodesRec(
                            oldChildVNode._ === VNodeType.Component ? oldChildVNode.rendition as FragmentVNode : oldChildVNode
                        )
                        const fragmentDOMNodes = fragmentNodes.map(n => n.domRef!)
                        const documentFragment = createDocumentFragmentNode()
                        documentFragment.append(...fragmentDOMNodes)
                        oldDOMNode = documentFragment
                    }
                    keyMap.set(props.key, [oldChildVNode, oldDOMNode])
                } else if (props !== undefined && props !== null && props.key !== undefined) {
                    // Old keyed node not in newKeys, treat as unkeyed for reuse
                    unkeyedNodes.push(oldChildVNode.domRef!)
                }
            }
        }

        let domNodeAtIndex: Node | null = parentElement.firstChild
        let nextDomNode: Node | null = null

        const oldChildVNodesToRemove: Set<VNode> = new Set(oldChildVNodes)

        for (let i = 0; i < newChildVNodes.length; i++) {
            const newChildVNode = newChildVNodes[i]
            let oldChildVNode: VNode | undefined = oldChildVNodes[i]

            if (domNodeAtIndex !== null) {
                nextDomNode = domNodeAtIndex.nextSibling
            }

            const newProps = (newChildVNode as ElementVNode<Element>).props
            // Check if the new VNode is "keyed"
            if (anyKeyedNodes && newProps !== undefined && newProps.key !== undefined && oldChildVNodes.length > 0) {

                const newChildVNodeKey = newProps.key

                // Fetch the old keyed item
                const keyMapEntry = keyMap.get(newChildVNodeKey)

                // If there was no old matching key, reset oldChildVNode so 
                // a new DOM node will be added (somewhat ugly) 
                if (keyMapEntry === undefined) {
                    if (domNodeAtIndex === null) {
                        // unsetting the oldChildVNode will cause the DOM node to be appended
                        oldChildVNode = undefined
                    } else if (unkeyedNodes.length > 0) {

                        const domNode = unkeyedNodes.shift()!
                        // ...reuse an old unkeyed node, if any available
                        oldChildVNode = {
                            _: VNodeType.Nothing,
                            domRef: domNode
                        }
                        if (domNode !== domNodeAtIndex) {
                            replaceElementChild(parentElement, domNode, domNodeAtIndex)
                            nextDomNode = domNode.nextSibling
                        }
                    } else {
                        oldChildVNode = {
                            _: VNodeType.Nothing,
                            domRef: domNodeAtIndex
                        }
                    }
                } else {
                    // If there was a matching key, use the old vNodes dom ref
                    const [mappedVNode, domNode] = keyMapEntry
                    oldChildVNodesToRemove.delete(mappedVNode)
                    oldChildVNode = mappedVNode
                    // Only move if not already in place
                    if (domNode !== undefined && domNode !== domNodeAtIndex) {
                        // If there is no DOM node at the current index, 
                        // the matching DOM node should be appended.
                        if (domNodeAtIndex === null) {
                            appendElementChild(parentElement, domNode)
                        } else if (elementContainsNode(parentElement, domNode)) {
                            // Move the node by replacing the node at the current index
                            replaceElementChild(parentElement, domNode, domNodeAtIndex)
                            nextDomNode = domNode.nextSibling
                        } else {
                            insertElementChildBefore(parentElement, domNode, domNodeAtIndex)

                            nextDomNode = domNode.nextSibling
                        }
                    }
                }
            } else {
                if (oldChildVNodesToRemove.size > 0) {
                    oldChildVNodesToRemove.delete(oldChildVNode!)
                }

                // Remove the current DOM node from unkeyedNodes to make sure it's not reused!
                const unkeyedIndex = unkeyedNodes.indexOf(domNodeAtIndex!)
                if (unkeyedIndex >= 0) {
                    unkeyedNodes.splice(unkeyedIndex, 1)
                }
            }

            switch (newChildVNode._) {
                case VNodeType.Component:
                    renderComponentVNode(oldChildVNode, newChildVNode as ComponentVNode<ComponentProps>, parentElement, isSvg)
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

        if (oldChildVNodesToRemove.size > 0) {
            // Remove old unused nodes backwards from the end
            for (const oldChildVNode of Array.from(oldChildVNodesToRemove).reverse()) {
                cleanupRecursively(oldChildVNode, false)
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
        const domRef = oldChildVNode.domRef!
        if (domRef!.nodeType !== Node.TEXT_NODE) {
            createAndSetTextNode(newChildVNode)
            replaceElementChild(parentElement, newChildVNode.domRef!, domRef!)
        } else {
            newChildVNode.domRef = domRef
        }
        if (domRef.textContent !== newChildVNode.text) {
            domRef.textContent = newChildVNode.text
        }
    }
    else if (oldChildVNode._ === VNodeType.Component && oldChildVNode.rendition!._ === VNodeType.Fragment) {
        replaceFragmentWithTextNode(parentElement, newChildVNode, oldChildVNode.rendition as FragmentVNode)
    }
    else if (oldChildVNode._ === VNodeType.Fragment) {
        replaceFragmentWithTextNode(parentElement, newChildVNode, oldChildVNode)
    }
    else {
        if (oldChildVNode?.domRef !== undefined) {
            replaceNode(parentElement, newChildVNode, oldChildVNode, oldChildVNode.domRef!)
        }
    }
}

function renderNothingVNode(oldChildVNode: VNode | undefined, newChildVNode: NothingVNode, parentElement: Element) {
    if (oldChildVNode === undefined) {
        const newNode = createAndSetNothingNode(newChildVNode)

        insertOrAppendDOMNode(parentElement, newNode)
    }

    // Reuse the old DOM node
    else if (oldChildVNode._ === VNodeType.Nothing) {
        const domRef = oldChildVNode.domRef
        if (domRef!.nodeType !== Node.COMMENT_NODE) {
            createAndSetNothingNode(newChildVNode)
            replaceElementChild(parentElement, newChildVNode.domRef!, domRef!)
        } else {
            newChildVNode.domRef = domRef
        }
    }
    else if (oldChildVNode._ === VNodeType.Component && oldChildVNode.rendition!._ === VNodeType.Fragment) {
        replaceFragmentWithNothingNode(parentElement, newChildVNode, oldChildVNode.rendition as FragmentVNode)
    }
    else if (oldChildVNode._ === VNodeType.Fragment) {
        replaceFragmentWithNothingNode(parentElement, newChildVNode, oldChildVNode)
    }
    else {
        // Fix: Only call replaceNode if domRef is defined
        if (oldChildVNode.domRef !== undefined) {
            replaceNode(parentElement, newChildVNode, oldChildVNode, oldChildVNode.domRef!)
        }
    }
}

function renderElementVNode(oldChildVNode: VNode | undefined, newChildVNode: ElementVNode<Element>, parentElement: Element, isSvg: boolean) {
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

        const domRef = oldChildVNode.domRef

        if (domRef!.nodeType !== Node.ELEMENT_NODE) {
            createAndSetElement(newChildVNode, isSvg)
            replaceElementChild(parentElement, newChildVNode.domRef!, domRef!)
        } else {
            // Reuse the same DOM element
            newChildVNode.domRef = domRef
        }

        // Update/remove/add any attributes
        updateElementAttributes(newChildVNode, oldChildVNode, domRef!)

        // Render the element's children
        render(domRef as Element, newChildVNode.props.children, oldChildVNode.props.children, isSvg)
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
        if (oldChildVNode.domRef !== undefined) {
            replaceNode(parentElement, newChildVNode, oldChildVNode, oldChildVNode.domRef!, isSvg)
            render(newChildVNode.domRef!, newChildVNode.props.children, [], isSvg)
        }
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
            if (child.domRef && child.domRef.parentElement === parentElement) {
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

        render(documentFragment as unknown as Element, newChildVNode.props.children, [], isSvg)

        replaceElementChild(parentElement, documentFragment, oldChildVNode.domRef!)
    }
}

function renderComponentVNode(oldChildVNode: VNode | undefined, newChildVNode: ComponentVNode<ComponentProps>, parentElement: Element, isSvg: boolean) {
    let replaceOrUpdateVNode: VNode | undefined

    if (oldChildVNode !== undefined) {
        if (oldChildVNode._ === VNodeType.Component) {
            // Fix: Type assertion for oldChildVNode.props
            if (
                newChildVNode.view === oldChildVNode.view &&
                (oldChildVNode.props as ComponentProps).key === newChildVNode.props.key
            ) {
                newChildVNode.data = oldChildVNode.data
                newChildVNode.effects = oldChildVNode.effects
                newChildVNode.errorHandler = oldChildVNode.errorHandler
                newChildVNode.link = oldChildVNode.link as { vNode: ComponentVNode<ComponentProps> }
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
    newVNode: ComponentVNode<ComponentProps>,
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

            const newView = newVNode.view(newVNode.props) as VNode

            if (oldVNode !== undefined && oldVNode._ === VNodeType.Component && renderingContext!.memo) {

                newVNode.rendition = oldVNode.rendition

                renderingContext = undefined

                return
            }

            renderingContext = undefined

            render(parentElement, [newView], replaceOrUpdateVNode === undefined ? [] : [replaceOrUpdateVNode], isSvg)

            newVNode.rendition = (newView as VNode)

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

function removeFragmentDOMNodes(parentElement: Element, oldChildVNode: FragmentVNode) {
    const oldVNodes = getFragmentChildNodesRec(oldChildVNode)
    for (let i = oldVNodes.length; i > 0; i--) {
        const oldNode = oldVNodes[i - 1]
        if (oldNode.domRef !== undefined && elementContainsNode(parentElement, oldNode.domRef)) {
            removeElementChild(parentElement, oldNode.domRef)
        }
    }
}

function replaceFragmentWithElementNode(parentElement: Element, newChildVNode: ElementVNode<Element>, oldChildVNode: FragmentVNode, isSvg: boolean) {
    const oldNodes = getFragmentChildNodesRec(oldChildVNode)

    let reuseVNode: ElementVNode<Element> | undefined
    let replaceVNode: VNode | undefined
    for (let i = 0; i < oldNodes.length; i++) {
        const oldNode = oldNodes[i]
        const doReuseNode = reuseVNode === undefined && (oldNode as ElementVNode<Element>).tagName === newChildVNode.tagName

        cleanupRecursively(oldNode, doReuseNode)

        // Check for a DOM node to reuse
        if (doReuseNode) {
            reuseVNode = oldNode as ElementVNode<Element>
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
        if (replaceVNode !== undefined && replaceVNode.domRef !== undefined) {
            removeElementChild(parentElement, replaceVNode.domRef!)
        }
        // Reuse the same DOM element
        newChildVNode.domRef = reuseVNode.domRef

        // Update/remove/add any attributes
        updateElementAttributes(newChildVNode, reuseVNode, reuseVNode.domRef!)

        oldChildren = reuseVNode.props.children
    }
    // We should have a DOM node to replace in this case
    else {
        if (replaceVNode !== undefined && replaceVNode.domRef !== undefined) {
            replaceNode(parentElement, newChildVNode, replaceVNode!, replaceVNode!.domRef!, isSvg)
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
        if (replaceVNode !== undefined && replaceVNode.domRef !== undefined) {
            removeElementChild(parentElement, replaceVNode.domRef!)
        }
        // Reuse the same DOM element
        newChildVNode.domRef = reuseVNode.domRef
    }
    // We should have a DOM node to replace in this case
    else {
        // Fix: Only call replaceNode if replaceVNode and its domRef are defined
        if (replaceVNode !== undefined && replaceVNode.domRef !== undefined) {
            replaceNode(parentElement, newChildVNode, replaceVNode!, replaceVNode!.domRef!)
        }
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
        if (replaceVNode?.domRef !== undefined) {
            removeElementChild(parentElement, replaceVNode.domRef!)
        }

        // Reuse the same DOM element
        const reuseNode = reuseVNode.domRef!
        reuseNode.textContent = newChildVNode.text
        newChildVNode.domRef = reuseNode
    }
    // We should have a DOM node to replace in this case
    else {
        if (replaceVNode !== undefined && replaceVNode.domRef !== undefined) {
            replaceNode(parentElement, newChildVNode, replaceVNode!, replaceVNode!.domRef!)
        }
    }
}

function replaceNode(parentElement: Element, newChildVNode: NothingVNode | TextVNode | ElementVNode<Element>, oldChildVNode: VNode, oldDomNode: Node, isSvg = false) {

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
            for (const effect of effects) {
                attemptEffectCleanup(effect)
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
function getFragmentChildNodesRec(fragmentNode: FragmentVNode | ComponentVNode<{ children: VNode[] }>): VNode[] {
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
 * Sets/removes attributes on an DOM element node
 */
function updateElementAttributes(newVNode: ElementVNode<Element>, oldVNode: VNode, existingDomNode: Element) {
    const newProps = newVNode.props
    const oldProps = (oldVNode as ElementVNode<Element>).props
    if (newProps === oldProps) {
        return
    }

    // remove any attributes that was added with the old virtual node but does 
    // not exist in the new virtual node or should be removed anyways (event listeners).
    for (const attributeName in oldProps) {
        if (attributeName === 'children' || attributeName === 'key' || attributeName === 'ref') {
            continue
        }
        // Use type-safe access for props
        const newPropValue = getPropValue(newProps, attributeName)
        if (newPropValue === undefined || attributeName.indexOf('on') === 0) {
            removeElementAttribute(attributeName, existingDomNode)
        }
    }

    // update any attribute where the attribute value has changed
    for (const name in newProps) {
        if (name === 'children' || name === 'key') {
            continue
        } else if (name === 'ref') {
            // Only set .current if the ref is an object with a current property
            const ref = newProps[name]
            if (ref && typeof ref === 'object' && 'current' in ref) {
                (ref as { current: unknown }).current = existingDomNode
            }
            continue
        }
        // Use helper for dynamic prop access
        const attributeValue = getPropValue(newProps, name)
        const hasAttr = existingDomNode.hasAttribute(name)

        // We need to check the actual DOM value of the "value" property
        // otherwise it may not be updated if the new prop value equals the old 
        // prop value
        const oldAttributeValue =
            name === 'value' && name in existingDomNode
                ? (existingDomNode as HTMLInputElement).value
                : getPropValue(oldProps, name)

        if ((name.indexOf('on') === 0 || attributeValue !== oldAttributeValue ||
            !hasAttr) && attributeValue !== undefined
        ) {
            setElementAttribute(
                existingDomNode,
                name,
                attributeValue as string
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
function triggerEffects(newVNode: ComponentVNode<ComponentProps>, parentElement: Element, isSvg: boolean, sync: boolean) {
    const effects = newVNode.effects
    if (effects !== undefined) {
        for (const effect of effects) {
            if (!effect) {
                continue
            }
            if (effect.invoke) {
                if (effect.sync && sync) {
                    // useLayoutEffect: schedule in a microtask, not synchronously
                    queueMicrotask(() => {
                        try {
                            attemptEffectCleanup(effect)
                            effect.cleanup = effect.effect()
                        } catch (err) {
                            tryHandleComponentError(parentElement, newVNode, isSvg, err as Error)
                        }
                        effect.invoke = false
                    })
                } else if (!sync) {
                    // useEffect: schedule in a macrotask
                    setTimeout(() => {
                        try {
                            attemptEffectCleanup(effect)
                            effect.cleanup = effect.effect()
                        } catch (err) {
                            tryHandleComponentError(parentElement, newVNode, isSvg, err as Error)
                        }
                    }, 0)
                    effect.invoke = false
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
function createAndSetElement(vNode: ElementVNode<Element>, isSvg: boolean): Element {

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
            const ref = getPropValue(attributes, name)
            if (ref && typeof ref === 'object' && 'current' in ref) {
                (ref as { current: unknown }).current = el
            }
            continue
        }
        const attributeValue = getPropValue(attributes, name)
        if (attributeValue !== undefined) {
            setElementAttribute(
                el,
                name,
                attributeValue as string
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
