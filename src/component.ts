/** @internal */
import {
    ComponentVNode,
    UpdateState,
    VNode,
    Context
} from './contract'
import { equal } from './helpers'
import { render } from './renderer'

/** 
 * Initializes a component from a ComponentVNode.
 * 
 * Will create a ComponentContext for for the component instance and call 
 * dispatch with the intial value from the component spec. If spec.onMount is
 * set, it will also be applied.
 */
export function initComponent(vNode: ComponentVNode<any, any>, parentElement: Element) {

    const link = {
        vNode: vNode
    }
    vNode.link = link
    vNode.parentElement = parentElement

    const ctx: Context<any, any> = {
        get state() {
            return link.vNode.state
        },
        get props() {
            return link.vNode.props
        },
        get domRef() {
            return link.vNode.domRef as Element | undefined
        },
        evolve: (fn: UpdateState<any>) => {
            dispatch(link.vNode, render, fn)
        }
    }
    vNode.ctx = ctx

    const view = vNode.spec(ctx)
    vNode.view = view

    if (vNode.ctx.willMount !== undefined) {
        // Setting dispatchLevel to 1 will make any dispatch call just update
        // the state without rendering the view
        vNode.dispatchLevel = 1
        vNode.ctx.willMount(vNode.props)
    }
    vNode.dispatchLevel = 0

    // Dispatch to render the view. 
    dispatch(vNode, render)

    if (vNode.ctx.didMount !== undefined) {
        vNode.ctx.didMount(vNode.ctx)
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
    newVNode.ctx = oldVNode.ctx
    newVNode.view = oldVNode.view

    if (shouldUpdate) {

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
        if (vNode.ctx.willUnmount !== undefined) {
            vNode.ctx.willUnmount(vNode.ctx)
        }

        findAndUnmountComponentsRec(vNode.rendition!)
    }
    else if (vNode._ === 2) {
        for (const c of vNode.children) {
            findAndUnmountComponentsRec(c)
        }
    }
}

/**
 * Calls the update function (if any), updates the state and renders the view.
 * 
 * @param vNode 
 * @param render 
 * @param update 
 */
function dispatch<TState extends {}, TProps extends {}>(
    vNode: ComponentVNode<TState, TProps>,
    render: (parentNode: Element, view: VNode, oldView: VNode | undefined, oldRootNode: Node | undefined) => void,
    update?: UpdateState<TState>) {

    vNode.dispatchLevel++

    if (update !== undefined) {
        if (typeof update === 'function') {
            update = update(vNode.state)
        }
        vNode.state = { ...(vNode.state as any), ...(update as object) }
    }

    // Update view if the component was already initialized and the 
    // dispatchLevel is at "lowest" level (i.e. 1).
    if (vNode.dispatchLevel === 1) {

        if (vNode.ctx.willRender !== undefined) {
            vNode.ctx.willRender(vNode.ctx)
        }

        const newView = vNode.view(vNode.state, vNode.props, vNode.children)
        const oldNode = vNode.rendition ? vNode.rendition.domRef : undefined
        render(vNode.parentElement!, newView, vNode.rendition, oldNode)

        vNode.rendition = newView
        vNode.domRef = newView.domRef

        if (vNode.ctx.didRender !== undefined) {
            vNode.ctx.didRender(vNode.ctx)
        }
    }
    vNode.dispatchLevel--
}
