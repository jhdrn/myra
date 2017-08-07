import {
    ComponentFactory,
    ComponentSpec,
    ComponentVNode,
    UpdateState,
    VNode
} from './contract'
import { equal } from './helpers'
import { render } from './renderer'

/** 
 * Defines a component from a ComponentSpec returning a factory that creates 
 * ComponentVNode/JSXElement's for the component.
 */
export function define<TState, TProps>(state: TState, spec: ComponentSpec<TState, TProps>) {
    return function (props: TProps, children: VNode[] = []) {
        return {
            _: 3,
            children,
            props,
            state,
            spec
        } as any as ComponentVNode<TState, TProps>
    }
}

/** 
 * Mounts the component onto the supplied element by calling the supplied 
 * component factory. 
 */
export function mount(componentFactory: ComponentFactory<any, any>, element: Element) {
    initComponent(componentFactory({}, []), element)
}

/** 
 * Initializes a component from a ComponentVNode.
 * 
 * Will create a ComponentContext for for the component instance and call 
 * dispatch with the intial value from the component spec. If spec.onMount is
 * set, it will also be applied.
 */
export function initComponent<TState, TProps>(vNode: ComponentVNode<TState, TProps>, parentElement: Element) {
    const link = {
        vNode: vNode
    }
    vNode.link = link
    vNode.parentElement = parentElement
    const evolve = (fn: UpdateState<TState>) =>
        dispatch(link.vNode, render, fn)
    const events = {}
    const view = vNode.spec(evolve, events)
    vNode.view = view
    vNode.events = events
    vNode.dispatchLevel = 0

    if (vNode.events.willMount !== undefined) {
        vNode.events.willMount(vNode.props)
    }

    // Dispatch to render the view. 
    dispatch(vNode, render)

    if (vNode.events.didMount !== undefined) {
        vNode.events.didMount(vNode.props, vNode.domRef!)
    }

    return vNode.domRef!
}


/** 
 * Updates a component by comparing the new and old virtual nodes. 
 */
export function updateComponent<TState, TProps>(newVNode: ComponentVNode<TState, TProps>, oldVNode: ComponentVNode<TState, TProps>) {

    const shouldUpdate =
        newVNode.props !== undefined
        && newVNode.props !== null
        && (newVNode.props as any).forceUpdate
        || !equal(oldVNode.props, newVNode.props)

    newVNode.parentElement = oldVNode.parentElement
    newVNode.rendition = oldVNode.rendition
    newVNode.state = oldVNode.state
    newVNode.link = oldVNode.link
    newVNode.link.vNode = newVNode
    newVNode.dispatchLevel = 0
    newVNode.events = oldVNode.events
    newVNode.view = oldVNode.view

    if (shouldUpdate) {

        if (newVNode.events.willUpdate !== undefined) {
            newVNode.events.willUpdate(newVNode.props)
        }
        // Dispatch to render the view. 
        dispatch(newVNode, render)
    }
}


/** 
 * Traverses the virtual node hierarchy and unmounts any components in the 
 * hierarchy.
 */
export function findAndUnmountComponentsRec(vNode: VNode) {
    if (vNode._ === 3) {
        if (vNode.events.willUnmount !== undefined) {
            vNode.events.willUnmount(vNode.domRef!)
        }

        findAndUnmountComponentsRec(vNode.rendition!)
    }
    else if (vNode._ === 2) {
        for (const c of vNode.children) {
            findAndUnmountComponentsRec(c)
        }
    }
}

function dispatch<TState extends {}, TProps extends {}>(
    vNode: ComponentVNode<TState, TProps>,
    render: (parentNode: Element, view: VNode, oldView: VNode | undefined, oldRootNode: Node | undefined) => void,
    update?: UpdateState<TState>) {

    vNode.dispatchLevel++

    if (update !== undefined) {
        if (typeof update === 'function') {
            update = update(vNode.state)
        }
        vNode.state = { ...<any>vNode.state, ...(update as object) }
    }

    // Update view if the component was already initialized and the 
    // dispatchLevel is at "lowest" level (i.e. 1).
    if (vNode.dispatchLevel === 1) {

        const newView = vNode.view(vNode.state, vNode.props, vNode.children)
        const oldNode = vNode.rendition ? vNode.rendition.domRef : undefined
        render(vNode.parentElement!, newView, vNode.rendition, oldNode)

        vNode.rendition = newView
        vNode.domRef = newView.domRef
    }
    vNode.dispatchLevel--
}
