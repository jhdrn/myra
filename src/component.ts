import {
    ComponentProps,
    ComponentVNode,
    ElementVNode,
    FragmentVNode,
    NothingVNode,
    TextVNode,
    VNode,
    VNodeType,
} from './contract'
import { ComponentLink, EffectWrapper, RenderNode } from './internal'

interface IRenderingContext {
    hookIndex: number
    isSvg: boolean
    /**
     * Set to the current RenderNode when this is a same-component update from a
     * parent re-render (allows memo to skip re-render). Undefined for initial
     * renders, type changes, and state-change re-renders.
     */
    oldRenderNode: RenderNode | undefined
    parentElement: Element
    renderNode: RenderNode
    memo?: boolean
}

/**
 * The renderingContext is used to obtain context variables from within "hooks".
 */
let renderingContext: IRenderingContext | undefined

function isEventProp(name: string): boolean {
    return name.indexOf('on') === 0
}

/**
 * Tracks the component vNode currently rendering its subtree, used to set
 * parent references on child component vNodes.
 */
let currentParentVNode: RenderNode | undefined

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
export function tryHandleComponentError(parentElement: Element, renderNode: RenderNode, isSvg: boolean, err: Error) {

    // Do nothing if the parentElement is not longer connected to the DOM
    if (parentElement.parentNode === null) {
        return
    }

    if (renderNode.errorHandler !== undefined) {

        renderingContext = undefined

        try {
            const errorView = renderNode.errorHandler(err)
            const oldRendition = renderNode.rendition
            const newRenditionNodes = render(parentElement, [errorView], oldRendition !== undefined ? [oldRendition] : [], isSvg)
            renderNode.rendition = newRenditionNodes[0]
        } catch (handlerErr) {
            console.error('An error occurred in the error handler: ' + handlerErr)
            throw err
        }
    } else {
        throw err
    }
}

export function render(parentElement: Element, newChildVNodes: VNode[], oldNodes: RenderNode[], isSvg = false): RenderNode[] {

    const result: RenderNode[] = []

    if (newChildVNodes.length > 0) {
        // Create a map holding references to all the old child
        // RenderNodes indexed by key
        const keyMap: Record<string, [RenderNode, Node | undefined] | undefined> = {}

        // Node "pool" for reuse
        const unkeyedNodes = new Set<Node>()

        let anyKeyedNodes = false

        if (oldNodes.length > 0) {
            // Prepare the map with the keys from the new nodes
            for (let i = 0; i < newChildVNodes.length; i++) {
                const newChildVNode = newChildVNodes[i] as ElementVNode<Element>
                const props = newChildVNode.props
                if (props !== undefined && props !== null && props.key !== undefined) {
                    keyMap[props.key] = undefined
                    anyKeyedNodes = true
                }
            }

            // Go through the old RenderNodes to see if there are any matching the new VNodes
            if (anyKeyedNodes) {
                for (let i = 0; i < oldNodes.length; i++) {
                    const oldNode = oldNodes[i]
                    const oldVNode = oldNode.vNode
                    const props = (oldVNode as ElementVNode<HTMLElement>)?.props

                    if (props !== undefined && props !== null && props.key !== undefined) {
                        // For Component nodes, domRef is undefined — resolve through the rendition chain.
                        let oldDOMNode: Node | undefined = getRenderNodeDomRef(oldNode)

                        // In the case of a fragment, group all its DOM nodes into a DocumentFragment
                        if (oldVNode?._ === VNodeType.Fragment ||
                            oldVNode?._ === VNodeType.Component && oldNode.rendition?.vNode?._ === VNodeType.Fragment) {
                            const fragmentNodes = getFragmentChildNodesRec(
                                oldVNode?._ === VNodeType.Component ? oldNode.rendition! : oldNode
                            )
                            const documentFragment = document.createDocumentFragment()
                            const fragmentDOMNodes = Array<Node>(fragmentNodes.length)

                            for (let j = 0; j < fragmentNodes.length; j++) {
                                fragmentDOMNodes[j] = getRenderNodeDomRef(fragmentNodes[j])!
                            }

                            documentFragment.append(...fragmentDOMNodes)

                            oldDOMNode = documentFragment
                        }

                        // If the key has been added (from a new VNode), update its value
                        if (props.key in keyMap) {
                            keyMap[props.key] = [oldNode, oldDOMNode]
                        }
                        // else save the DOM node for reuse or removal
                        else if (oldDOMNode?.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
                            const nodes = (oldDOMNode as DocumentFragment).childNodes
                            for (let j = 0; j < nodes.length; j++) {
                                unkeyedNodes.add(nodes.item(j))
                            }
                        }
                        else if (oldDOMNode !== undefined) {
                            unkeyedNodes.add(oldDOMNode)
                        }
                    }
                }
            }
        }

        let domNodeAtIndex: Node | null = parentElement.firstChild
        let nextDomNode: Node | null = null

        const oldNodesToRemove = new Set<RenderNode>(oldNodes)

        for (let i = 0; i < newChildVNodes.length; i++) {
            const newChildVNode = newChildVNodes[i]
            let oldNode: RenderNode | undefined = oldNodes[i]

            if (domNodeAtIndex !== null) {
                nextDomNode = domNodeAtIndex.nextSibling
            }

            const newProps = (newChildVNode as ElementVNode<Element>).props
            // Check if the new VNode is "keyed"
            if (anyKeyedNodes && newProps !== undefined && newProps.key !== undefined && oldNodes.length > 0) {

                const newChildVNodeKey = newProps.key

                // Fetch the old keyed item from the key map
                const keyMapEntry = keyMap[newChildVNodeKey]

                // If there was no old matching key, reset oldNode so
                // a new DOM node will be added
                if (keyMapEntry === undefined) {
                    if (domNodeAtIndex === null) {
                        oldNode = undefined
                    }
                    else if (unkeyedNodes.size > 0) {

                        const domNode = unkeyedNodes.values().next().value!
                        unkeyedNodes.delete(domNode)
                        // ...reuse an old unkeyed node, if any available
                        oldNode = {
                            children: [],
                            domRef: domNode
                        }

                        parentElement.replaceChild(domNode, domNodeAtIndex)

                        nextDomNode = domNode.nextSibling
                    } else {
                        oldNode = {
                            children: [],
                            domRef: domNodeAtIndex
                        }
                    }
                }
                // If there was a matching key, use the old RenderNode
                else {

                    const [mappedNode, domNode] = keyMapEntry

                    oldNodesToRemove.delete(mappedNode)

                    oldNode = mappedNode

                    // Move the matching dom node to its new position
                    if (domNode !== undefined && domNode !== domNodeAtIndex) {
                        const lastFragmentChild = domNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE
                            ? domNode.lastChild
                            : null

                        if (domNodeAtIndex === null) {
                            parentElement.appendChild(domNode)
                        }
                        else if (parentElement.contains(domNode)) {

                            parentElement.replaceChild(domNode, domNodeAtIndex)

                            nextDomNode = lastFragmentChild !== null ? lastFragmentChild.nextSibling : domNode.nextSibling
                        }
                        else {
                            parentElement.insertBefore(domNode, domNodeAtIndex)

                            nextDomNode = lastFragmentChild !== null ? lastFragmentChild.nextSibling : domNode.nextSibling
                        }
                    }
                }
            } else {
                if (oldNode !== undefined) {
                    oldNodesToRemove.delete(oldNode)
                }

                // Remove the current DOM node from unkeyedNodes to make sure it's not reused!
                unkeyedNodes.delete(domNodeAtIndex!)
            }

            let newNode: RenderNode
            switch (newChildVNode._) {
                case VNodeType.Component:
                    newNode = renderComponentVNode(oldNode, newChildVNode, parentElement, isSvg)
                    break

                case VNodeType.Element:
                    newNode = renderElementVNode(oldNode, newChildVNode, parentElement, isSvg)
                    break

                case VNodeType.Fragment:
                    newNode = renderFragmentVNode(oldNode, newChildVNode, parentElement, isSvg)
                    break

                case VNodeType.Nothing:
                    newNode = renderNothingVNode(oldNode, newChildVNode, parentElement)
                    break

                case VNodeType.Text:
                    newNode = renderTextVNode(oldNode, newChildVNode, parentElement)
                    break
            }

            result.push(newNode!)
            domNodeAtIndex = nextDomNode
        }

        oldNodesToRemove.forEach(oldNode => {
            // Make sure any sub-components are "unmounted"
            cleanupRecursively(oldNode, false)

            const vNodeType = oldNode.vNode?._
            if (vNodeType === VNodeType.Fragment) {
                removeFragmentDOMNodes(parentElement, oldNode)
            } else if (vNodeType === VNodeType.Component && oldNode.rendition?.vNode?._ === VNodeType.Fragment) {
                removeFragmentDOMNodes(parentElement, oldNode.rendition!)
            } else {
                const domRef = getRenderNodeDomRef(oldNode)
                if (domRef !== undefined && parentElement.contains(domRef)) {
                    parentElement.removeChild(domRef)
                }
            }
        })

    } else if (oldNodes.length > 0) {
        // no new nodes, clear DOM and clean up
        parentElement.replaceChildren()

        for (let i = 0; i < oldNodes.length; i++) {
            // Make sure any sub-components are "unmounted"
            cleanupRecursively(oldNodes[i], false)
        }
    }

    return result
}

function renderTextVNode(oldNode: RenderNode | undefined, newChildVNode: TextVNode, parentElement: Element): RenderNode {
    const newRenderNode: RenderNode = { children: [], vNode: newChildVNode }

    if (oldNode === undefined) {
        const el = document.createTextNode(newChildVNode.text)
        newRenderNode.domRef = el
        insertOrAppendDOMNode(parentElement, el)
    }

    // Reuse the old DOM node and update its text content if changed
    else if (oldNode.vNode?._ === VNodeType.Text) {
        const domRef = oldNode.domRef!
        if (domRef.nodeType !== Node.TEXT_NODE) {
            const el = document.createTextNode(newChildVNode.text)
            newRenderNode.domRef = el
            parentElement.replaceChild(el, domRef)
        } else {
            newRenderNode.domRef = domRef
        }
        if (domRef.textContent !== newChildVNode.text) {
            domRef.textContent = newChildVNode.text
        }
    }
    else if (oldNode.vNode?._ === VNodeType.Component && oldNode.rendition?.vNode?._ === VNodeType.Fragment) {
        replaceFragmentWithTextNode(parentElement, newChildVNode, oldNode.rendition!, newRenderNode)
    }
    else if (oldNode.vNode?._ === VNodeType.Fragment) {
        replaceFragmentWithTextNode(parentElement, newChildVNode, oldNode, newRenderNode)
    }
    else {
        replaceNode(parentElement, newChildVNode, oldNode, getRenderNodeDomRef(oldNode), undefined, newRenderNode)
    }

    return newRenderNode
}

function renderNothingVNode(oldNode: RenderNode | undefined, newChildVNode: NothingVNode, parentElement: Element): RenderNode {
    const newRenderNode: RenderNode = { children: [], vNode: newChildVNode }

    if (oldNode === undefined) {
        const el = document.createComment('Nothing')
        newRenderNode.domRef = el
        insertOrAppendDOMNode(parentElement, el)
    }

    // Reuse the old DOM node
    else if (oldNode.vNode?._ === VNodeType.Nothing) {
        const domRef = oldNode.domRef
        if (domRef!.nodeType !== Node.COMMENT_NODE) {
            const el = document.createComment('Nothing')
            newRenderNode.domRef = el
            parentElement.replaceChild(el, domRef!)
        } else {
            newRenderNode.domRef = domRef
        }
    }
    else if (oldNode.vNode?._ === VNodeType.Component && oldNode.rendition?.vNode?._ === VNodeType.Fragment) {
        replaceFragmentWithNothingNode(parentElement, newChildVNode, oldNode.rendition!, newRenderNode)
    }
    else if (oldNode.vNode?._ === VNodeType.Fragment) {
        replaceFragmentWithNothingNode(parentElement, newChildVNode, oldNode, newRenderNode)
    }
    else {
        replaceNode(parentElement, newChildVNode, oldNode, getRenderNodeDomRef(oldNode), undefined, newRenderNode)
    }

    return newRenderNode
}

function renderElementVNode(oldNode: RenderNode | undefined, newChildVNode: ElementVNode<Element>, parentElement: Element, isSvg: boolean): RenderNode {
    if (newChildVNode.tagName === 'svg') {
        isSvg = true
    }

    const newRenderNode: RenderNode = { children: [], vNode: newChildVNode }

    // Create a new DOM element, add it to the parent DOM element
    // and render the children.
    if (oldNode === undefined) {
        const newElement = createAndSetElement(newChildVNode, isSvg, newRenderNode)

        insertOrAppendDOMNode(parentElement, newElement)

        newRenderNode.children = render(newElement, newChildVNode.props.children, [], isSvg)
    }
    // If the node type has not changed, reuse the old DOM node and
    // update its attributes
    else if (oldNode.vNode?._ === VNodeType.Element && (oldNode.vNode as ElementVNode<Element>).tagName === newChildVNode.tagName) {

        const domRef = oldNode.domRef!

        if (domRef.nodeType !== Node.ELEMENT_NODE) {
            createAndSetElement(newChildVNode, isSvg, newRenderNode)
            parentElement.replaceChild(newRenderNode.domRef!, domRef)
        } else {
            // Reuse the same DOM element
            newRenderNode.domRef = domRef
        }

        // Update/remove/add any attributes
        updateElementAttributes(newChildVNode, oldNode.vNode as ElementVNode<Element>, domRef as Element)

        // Render the element's children
        newRenderNode.children = render(domRef as Element, newChildVNode.props.children, oldNode.children, isSvg)
    }
    else if (oldNode.vNode?._ === VNodeType.Component && oldNode.rendition?.vNode?._ === VNodeType.Fragment) {
        newRenderNode.children = replaceFragmentWithElementNode(parentElement, newChildVNode, oldNode.rendition!, isSvg, newRenderNode)
    }
    else if (oldNode.vNode?._ === VNodeType.Fragment) {
        newRenderNode.children = replaceFragmentWithElementNode(parentElement, newChildVNode, oldNode, isSvg, newRenderNode)
    }
    // Replace the old DOM node with a new element and render its children
    else {
        replaceNode(parentElement, newChildVNode, oldNode, getRenderNodeDomRef(oldNode), isSvg, newRenderNode)
        newRenderNode.children = render(newRenderNode.domRef as Element, newChildVNode.props.children, [], isSvg)
    }

    return newRenderNode
}

function renderFragmentVNode(oldNode: RenderNode | undefined, newChildVNode: FragmentVNode, parentElement: Element, isSvg: boolean): RenderNode {
    const newRenderNode: RenderNode = { children: [], vNode: newChildVNode }

    if (oldNode === undefined) {
        newRenderNode.children = render(parentElement, newChildVNode.props.children, [], isSvg)
    }
    else if (oldNode.vNode?._ === VNodeType.Fragment) {
        const newChildren = newChildVNode.props.children
        const oldChildren = oldNode.children

        let nextSibling: Node | null = null
        const allOldChildren = getFragmentChildNodesRec(oldNode)
        for (let i = allOldChildren.length - 1; i > -1; i--) {
            const child = allOldChildren[i]
            const childDomRef = getRenderNodeDomRef(child)
            if (childDomRef !== undefined && childDomRef.parentElement === parentElement) {
                nextSibling = childDomRef.nextSibling
                break
            }
        }
        if (nextSibling !== null) {
            fragmentNextSiblings.push(nextSibling)
        }

        try {
            newRenderNode.children = render(parentElement, newChildren, oldChildren, isSvg)
        } finally {
            if (fragmentNextSiblings[fragmentNextSiblings.length - 1] === nextSibling) {
                fragmentNextSiblings.pop()
            }
        }
    }
    else if (oldNode.vNode?._ === VNodeType.Component && oldNode.rendition?.vNode?._ === VNodeType.Fragment) {
        cleanupRecursively(oldNode, false)

        const documentFragment = document.createDocumentFragment()

        newRenderNode.children = render(documentFragment as unknown as Element, newChildVNode.props.children, [], isSvg)

        const oldFragmentNodes = getFragmentChildNodesRec(oldNode.rendition!)
        const firstDomRef = oldFragmentNodes.length > 0 ? getRenderNodeDomRef(oldFragmentNodes[0]) : undefined
        if (firstDomRef !== undefined) {
            parentElement.insertBefore(documentFragment, firstDomRef)
        } else {
            parentElement.appendChild(documentFragment)
        }
        for (let i = 0; i < oldFragmentNodes.length; i++) {
            const domRef = getRenderNodeDomRef(oldFragmentNodes[i])
            if (domRef !== undefined && parentElement.contains(domRef)) {
                parentElement.removeChild(domRef)
            }
        }
    }
    else {
        cleanupRecursively(oldNode, false)

        const documentFragment = document.createDocumentFragment()

        newRenderNode.children = render(documentFragment as unknown as Element, newChildVNode.props.children, [], isSvg)

        const oldDomRef = getRenderNodeDomRef(oldNode)
        if (oldDomRef !== undefined && parentElement.contains(oldDomRef)) {
            parentElement.replaceChild(documentFragment, oldDomRef)
        } else {
            insertOrAppendDOMNode(parentElement, documentFragment)
        }
    }

    return newRenderNode
}

function renderComponentVNode(oldNode: RenderNode | undefined, newChildVNode: ComponentVNode<ComponentProps>, parentElement: Element, isSvg: boolean): RenderNode {
    let renderNode: RenderNode
    let replaceOrUpdateNode: RenderNode | undefined
    let allowMemo = false

    if (oldNode !== undefined) {
        const oldVNode = oldNode.vNode
        if (oldVNode?._ === VNodeType.Component) {
            const oldComponentVNode = oldVNode as ComponentVNode<ComponentProps>
            if (newChildVNode.view === oldComponentVNode.view && (newChildVNode.props as ComponentProps).key === (oldComponentVNode.props as ComponentProps).key && !oldNode.stale) {
                // Same component — reuse the render node, update the VNode reference
                renderNode = oldNode
                renderNode.vNode = newChildVNode
                allowMemo = true
            } else {
                cleanupRecursively(oldNode, true)
                renderNode = { children: [], vNode: newChildVNode }
                renderNode.link = { renderNode }
            }

            replaceOrUpdateNode = oldNode.rendition

        }
        else if (oldVNode?._ === VNodeType.Fragment) {
            const oldFragmentNodes = getFragmentChildNodesRec(oldNode)

            renderNode = { children: [], vNode: newChildVNode }
            renderNode.link = { renderNode }

            for (let i = 0; i < oldFragmentNodes.length; i++) {
                const oldFragChild = oldFragmentNodes[i]
                const domRef = getRenderNodeDomRef(oldFragChild)

                if (replaceOrUpdateNode === undefined && domRef !== undefined) {
                    cleanupRecursively(oldFragChild, false)
                    replaceOrUpdateNode = oldFragChild
                }
                else if (domRef !== undefined) {
                    cleanupRecursively(oldFragChild, false)
                    parentElement.removeChild(domRef)
                }
            }
        }
        else {
            cleanupRecursively(oldNode, true)
            renderNode = { children: [], vNode: newChildVNode }
            renderNode.link = { renderNode }
            replaceOrUpdateNode = oldNode
        }
    } else {
        renderNode = { children: [], vNode: newChildVNode }
        renderNode.link = { renderNode }
    }

    renderComponent(
        parentElement,
        newChildVNode,
        renderNode,
        replaceOrUpdateNode,
        isSvg,
        allowMemo
    )

    return renderNode
}

/**
 * Renders a component and then triggers any effects.
 */
export function renderComponent(
    parentElement: Element,
    vNode: ComponentVNode<ComponentProps>,
    renderNode: RenderNode,
    replaceOrUpdateNode: RenderNode | undefined,
    isSvg: boolean,
    allowMemo = false
) {
    if (renderingContext === undefined && !renderNode.stale) {
        if (currentParentVNode !== undefined || renderNode.parent === undefined) {
            renderNode.parent = currentParentVNode
        }
        renderNode.parentElement = parentElement
        renderNode.isSvg = isSvg
        try {
            renderingContext = {
                renderNode,
                isSvg,
                // For memo: set to the current renderNode if this is a
                // same-component update from a parent re-render. Undefined
                // for initial renders, type changes, and state-change
                // re-renders so that memo is never skipped in those cases.
                oldRenderNode: allowMemo ? renderNode : undefined,
                parentElement,
                hookIndex: 0
            }

            const rawView = vNode.view(vNode.props)
            let newView: VNode
            if (rawView === null || rawView === undefined || typeof rawView === 'boolean') {
                newView = { _: VNodeType.Nothing }
            } else if (typeof rawView === 'string' || typeof rawView === 'number') {
                newView = { _: VNodeType.Text, text: String(rawView) }
            } else {
                newView = rawView as VNode
            }

            if (renderingContext!.memo) {
                // Props are equal — rendition is already preserved on
                // renderNode from the previous render cycle; just return.
                renderingContext = undefined
                return
            }

            renderingContext = undefined

            const prevParentVNode = currentParentVNode
            currentParentVNode = renderNode
            let newRenditionNodes: RenderNode[]
            try {
                newRenditionNodes = render(parentElement, [newView], replaceOrUpdateNode !== undefined ? [replaceOrUpdateNode] : [], isSvg)
            } finally {
                currentParentVNode = prevParentVNode
            }

            renderNode.rendition = newRenditionNodes[0]

            // Trigger synchronous effects (useLayoutEffect)
            triggerEffects(renderNode, parentElement, isSvg, true)

            // Trigger asynchronous effects (useEffect)
            triggerEffects(renderNode, parentElement, isSvg, false)
        }
        catch (err) {
            // Ensure renderingContext is always cleared even when the component's
            // view function throws before the normal renderingContext = undefined
            // at line 597. Leaving it set would cause the guard at the top of
            // renderComponent to silently drop all subsequent renders.
            renderingContext = undefined
            tryHandleComponentError(parentElement, renderNode, isSvg, err as Error)
        }
    }
}

function insertOrAppendDOMNode(parentElement: Element, newNode: Node) {
    const nextSibling = fragmentNextSiblings[fragmentNextSiblings.length - 1]
    if (nextSibling !== undefined && nextSibling.parentElement === parentElement) {
        parentElement.insertBefore(newNode, nextSibling)
    }
    else {
        parentElement.appendChild(newNode)
    }
}

function removeFragmentDOMNodes(parentElement: Element, fragmentRenderNode: RenderNode) {
    const oldNodes = getFragmentChildNodesRec(fragmentRenderNode)
    for (let i = oldNodes.length; i > 0; i--) {
        const oldNode = oldNodes[i - 1]
        const domRef = getRenderNodeDomRef(oldNode)
        if (domRef !== undefined && parentElement.contains(domRef)) {
            parentElement.removeChild(domRef)
        }
    }
}

function scanFragmentForReuse(
    parentElement: Element,
    oldFragmentNode: RenderNode,
    canReuse: (node: RenderNode) => boolean
): { reuseNode: RenderNode | undefined, replaceDomRef: Node | undefined } {
    const oldNodes = getFragmentChildNodesRec(oldFragmentNode)
    let reuseNode: RenderNode | undefined
    let replaceDomRef: Node | undefined
    for (let i = 0; i < oldNodes.length; i++) {
        const oldNode = oldNodes[i]
        const doReuseNode = reuseNode === undefined && canReuse(oldNode)
        cleanupRecursively(oldNode, doReuseNode)
        if (doReuseNode) {
            reuseNode = oldNode
        } else {
            const domRef = getRenderNodeDomRef(oldNode)
            if (replaceDomRef === undefined && domRef !== undefined) {
                replaceDomRef = domRef
            } else if (domRef !== undefined) {
                parentElement.removeChild(domRef)
            }
        }
    }
    return { reuseNode, replaceDomRef }
}

function replaceFragmentWithElementNode(parentElement: Element, newChildVNode: ElementVNode<Element>, oldFragmentNode: RenderNode, isSvg: boolean, newRenderNode: RenderNode): RenderNode[] {
    const { reuseNode, replaceDomRef } = scanFragmentForReuse(
        parentElement,
        oldFragmentNode,
        n => n.vNode?._ === VNodeType.Element && (n.vNode as ElementVNode<Element>).tagName === newChildVNode.tagName
    )

    let oldChildren: RenderNode[] = []
    if (reuseNode !== undefined) {
        if (replaceDomRef !== undefined) {
            parentElement.removeChild(replaceDomRef)
        }
        newRenderNode.domRef = reuseNode.domRef
        updateElementAttributes(newChildVNode, reuseNode.vNode as ElementVNode<Element>, reuseNode.domRef as Element)
        oldChildren = reuseNode.children
    } else {
        const newElement = createAndSetElement(newChildVNode, isSvg, newRenderNode)
        if (replaceDomRef !== undefined && parentElement.contains(replaceDomRef)) {
            parentElement.replaceChild(newElement, replaceDomRef)
        } else {
            insertOrAppendDOMNode(parentElement, newElement)
        }
    }

    return render(newRenderNode.domRef as Element, newChildVNode.props.children, oldChildren, isSvg)
}

function replaceFragmentWithNothingNode(parentElement: Element, _newChildVNode: NothingVNode, oldFragmentNode: RenderNode, newRenderNode: RenderNode) {
    const { reuseNode, replaceDomRef } = scanFragmentForReuse(
        parentElement, oldFragmentNode, n => n.vNode?._ === VNodeType.Nothing
    )

    if (reuseNode !== undefined) {
        if (replaceDomRef !== undefined) {
            parentElement.removeChild(replaceDomRef)
        }
        newRenderNode.domRef = reuseNode.domRef
    } else {
        const el = document.createComment('Nothing')
        newRenderNode.domRef = el
        if (replaceDomRef !== undefined && parentElement.contains(replaceDomRef)) {
            parentElement.replaceChild(el, replaceDomRef)
        } else {
            insertOrAppendDOMNode(parentElement, el)
        }
    }
}

function replaceFragmentWithTextNode(parentElement: Element, newChildVNode: TextVNode, oldFragmentNode: RenderNode, newRenderNode: RenderNode) {
    const { reuseNode, replaceDomRef } = scanFragmentForReuse(
        parentElement, oldFragmentNode, n => n.vNode?._ === VNodeType.Text
    )

    if (reuseNode !== undefined) {
        if (replaceDomRef !== undefined) {
            parentElement.removeChild(replaceDomRef)
        }
        const domRef = reuseNode.domRef!
        domRef.textContent = newChildVNode.text
        newRenderNode.domRef = domRef
    } else {
        const el = document.createTextNode(newChildVNode.text)
        newRenderNode.domRef = el
        if (replaceDomRef !== undefined && parentElement.contains(replaceDomRef)) {
            parentElement.replaceChild(el, replaceDomRef)
        } else {
            insertOrAppendDOMNode(parentElement, el)
        }
    }
}

function replaceNode(parentElement: Element, newChildVNode: NothingVNode | TextVNode | ElementVNode<Element>, oldNode: RenderNode, oldDomNode: Node | undefined, isSvg: boolean | undefined, newRenderNode: RenderNode) {

    cleanupRecursively(oldNode, false)

    let newNode: Node
    switch (newChildVNode._) {
        case VNodeType.Element:
            newNode = createAndSetElement(newChildVNode, isSvg ?? false, newRenderNode)
            break
        case VNodeType.Text:
            newNode = document.createTextNode((newChildVNode as TextVNode).text)
            newRenderNode.domRef = newNode
            break
        case VNodeType.Nothing:
            newNode = document.createComment('Nothing')
            newRenderNode.domRef = newNode
            break
    }

    if (oldDomNode !== undefined && parentElement.contains(oldDomNode)) {
        parentElement.replaceChild(newNode!, oldDomNode)
    } else {
        insertOrAppendDOMNode(parentElement, newNode!)
    }
}

/**
 * Traverses the render node hierarchy and unmounts any components.
 */
function cleanupRecursively(renderNode: RenderNode | undefined, removeEventListeners: boolean) {
    if (renderNode === undefined) {
        return
    }

    const vNode = renderNode.vNode

    if (vNode?._ === VNodeType.Component) {
        // Attempt to call any "cleanup" function for all effects before unmount.
        const effects = renderNode.effects
        if (effects !== undefined) {
            for (const i in effects) {
                attemptEffectCleanup(effects[i])
            }
        }

        renderNode.stale = true

        cleanupRecursively(renderNode.rendition, removeEventListeners)
    }
    else if (vNode?._ === VNodeType.Element || vNode?._ === VNodeType.Fragment) {
        if (vNode._ === VNodeType.Element && removeEventListeners) {

            // If the old VNode is an element node, remove old event listeners
            for (const attr in (vNode as ElementVNode<Element>).props) {
                if (isEventProp(attr)) {
                    removeElementAttribute(attr, renderNode.domRef as Element)
                }
            }
        }

        for (const c of renderNode.children) {
            cleanupRecursively(c, removeEventListeners)
        }
    }
}

/**
 * Recursively traverses the RenderNode tree, finds all fragment child nodes
 * and returns them as a flattened array.
 */
function getFragmentChildNodesRec(fragmentNode: RenderNode, acc: RenderNode[] = []): RenderNode[] {
    for (const child of fragmentNode.children) {
        const vNodeType = child.vNode?._
        if (vNodeType === VNodeType.Fragment) {
            getFragmentChildNodesRec(child, acc)
        }
        else if (vNodeType === VNodeType.Component) {
            const innerFragment = getComponentRenderedFragment(child)
            if (innerFragment !== undefined) {
                getFragmentChildNodesRec(innerFragment, acc)
            } else {
                acc.push(child)
            }
        } else {
            acc.push(child)
        }
    }
    return acc
}

/**
 * Follows a component's rendition chain and returns the first non-Component
 * RenderNode encountered (the leaf), or undefined if the component has not rendered.
 */
function getLeafFromComponent(renderNode: RenderNode): RenderNode | undefined {
    const rendition = renderNode.rendition
    if (rendition === undefined) {
        return undefined
    }
    if (rendition.vNode?._ === VNodeType.Component) {
        return getLeafFromComponent(rendition)
    }
    return rendition
}

/**
 * Returns the DOM node associated with a RenderNode, resolving through
 * component rendition chains when the RenderNode is for a component.
 */
function getRenderNodeDomRef(renderNode: RenderNode): Node | undefined {
    if (renderNode.vNode?._ === VNodeType.Component) {
        return getLeafFromComponent(renderNode)?.domRef
    }
    return renderNode.domRef
}

/**
 * Follows a component's rendition chain and returns the first fragment
 * RenderNode encountered, or undefined if the component renders a non-fragment.
 */
function getComponentRenderedFragment(renderNode: RenderNode): RenderNode | undefined {
    const rendition = renderNode.rendition
    if (rendition === undefined) {
        return undefined
    }
    if (rendition.vNode?._ === VNodeType.Fragment) {
        return rendition
    }
    if (rendition.vNode?._ === VNodeType.Component) {
        return getComponentRenderedFragment(rendition)
    }
    return undefined
}

/**
 * Sets an attribute or event listener on an Element.
 */
function setElementAttribute(el: Element, attributeName: string, attributeValue: string) {
    if (attributeName === 'value' && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT')) {
        if ((el as HTMLInputElement).value !== attributeValue) {
            (el as HTMLInputElement).value = attributeValue
        }
    }
    else if (attributeName in el) {
        try {
            (el as unknown as Record<string, unknown>)[attributeName] = attributeValue
            return
        }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    if (isEventProp(a)) {
        (el as unknown as Record<string, unknown>)[a] = null
    }
    else if (el.hasAttribute(a)) {
        el.removeAttribute(a)
    }
}


/**
 * Sets/removes attributes on a DOM element node.
 */
function updateElementAttributes(newVNode: ElementVNode<Element>, oldVNode: ElementVNode<Element>, existingDomNode: Element) {
    const newProps = newVNode.props
    const oldProps = oldVNode.props
    // remove any attributes that were in the old virtual node but are absent in
    // the new one, or whose event handler reference has changed.
    for (const attributeName in oldProps) {
        if (attributeName === 'children' || attributeName === 'key' || attributeName === 'ref') {
            continue
        }
        const newPropsRecord = newProps as unknown as Record<string, unknown>
        const oldPropsRecord = oldProps as unknown as Record<string, unknown>
        if (newPropsRecord[attributeName] === undefined ||
            (isEventProp(attributeName) && newPropsRecord[attributeName] !== oldPropsRecord[attributeName])) {
            removeElementAttribute(attributeName, existingDomNode)
        }
    }

    const newPropsRecord = newProps as unknown as Record<string, unknown>
    const oldPropsRecord = oldProps as unknown as Record<string, unknown>

    // update any attribute where the attribute value has changed
    for (const name in newProps) {
        if (name === 'children' || name === 'key') {
            continue
        } else if (name === 'ref') {
            (newPropsRecord[name] as { current: unknown }).current = existingDomNode
            continue
        }
        const attributeValue = newPropsRecord[name] as string
        const oldAttributeValue = (name === 'value' && name in existingDomNode)
            ? (existingDomNode as HTMLInputElement).value
            : oldPropsRecord[name] as string

        if (isEventProp(name)) {
            if (attributeValue !== oldAttributeValue && attributeValue !== undefined) {
                setElementAttribute(existingDomNode, name, attributeValue)
            }
        } else {
            const hasAttr = existingDomNode.hasAttribute(name)
            if ((attributeValue !== oldAttributeValue || !hasAttr) && attributeValue !== undefined) {
                setElementAttribute(existingDomNode, name, attributeValue)
            } else if (attributeValue === undefined && hasAttr) {
                existingDomNode.removeAttribute(name)
            }
        }
    }
}

/**
 * Triggers all invokeable effects.
 */
function triggerEffects(renderNode: RenderNode, parentElement: Element, isSvg: boolean, sync: boolean) {
    const effects = renderNode.effects
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
                        if (renderNode.stale) {
                            return
                        }
                        try {
                            attemptEffectCleanup(t)

                            t.cleanup = t.effect()
                        } catch (err) {
                            tryHandleComponentError(parentElement, renderNode, isSvg, err as Error)
                        }
                    }, 0)
                    t.invoke = false
                }
            }
        }
    }
}

/**
 * Calls the cleanup function if it's set and then removes it from the wrapper.
 */
function attemptEffectCleanup(t: EffectWrapper) {
    if (t.cleanup !== undefined) {
        try {
            t.cleanup()
        } catch (err) {
            console.error('An error occurred during effect cleanup: ' + err)
        }
        t.cleanup = undefined
    }
}

/**
 * Creates a DOM element, sets its attributes from vNode.props, and sets the
 * new Element to renderNode.domRef.
 */
function createAndSetElement(vNode: ElementVNode<Element>, isSvg: boolean, renderNode: RenderNode): Element {

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
            const attributesRecord = attributes as unknown as Record<string, { current: unknown }>
            attributesRecord[name].current = el
        }
        const attributeValue = (attributes as unknown as Record<string, unknown>)[name]

        if (attributeValue !== undefined) {
            setElementAttribute(
                el,
                name,
                attributeValue as string
            )
        }
    }

    renderNode.domRef = el

    return el
}

export type { ComponentLink }
