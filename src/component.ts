/** @internal */
import {
    ComponentVNode,
    UpdateState,
    VNode,
    StatelessComponentVNode,
    SetupContext,
    RenderedContext
} from './contract'
import { equal } from './helpers'
import { render } from './renderer'
import { VNODE_COMPONENT, VNODE_ELEMENT, VNODE_FUNCTION } from './constants'

/** 
 * Initializes a component from a ComponentVNode.
 * 
 * Will create a ComponentContext for for the component instance and call 
 * dispatch with the intial value from the component spec. If spec.onMount is
 * set, it will also be applied.
 */
export function initComponent(parentElement: Element, vNode: ComponentVNode<any, any> | StatelessComponentVNode<any>, isSvg: boolean) {

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

                if (typeof update !== 'object') {
                    update = update(link.vNode.state)
                }
                link.vNode.state = { ...(link.vNode.state as any), ...(update as object) }

                tryRender(parentElement, link.vNode, isSvg)
            }
        }
        vNode.ctx = ctx

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
            tryRender(parentElement, vNode, isSvg)
        }

        if (ctx.didMount !== undefined) {
            ctx.didMount(ctx as RenderedContext<any, any>)
        }
    }
    else {
        doRender(parentElement, vNode, isSvg)
    }
    return vNode.domRef!
}

/** 
 * Updates a component by comparing the new and old virtual nodes. 
 */
export function updateComponent<TState, TProps>(
    parentElement: Element,
    newVNode: ComponentVNode<TState, TProps> | StatelessComponentVNode<TProps>,
    oldVNode: ComponentVNode<TState, TProps> | StatelessComponentVNode<TProps>,
    isSvg: boolean
) {

    const shouldRender =
        newVNode.props !== undefined
        && newVNode.props !== null
        && (newVNode.props as any).forceUpdate
        || !equal(oldVNode.props, newVNode.props)
        || !equal(oldVNode.children, newVNode.children)

    newVNode.rendition = oldVNode.rendition

    if (newVNode._ === VNODE_COMPONENT) {

        newVNode.view = (oldVNode as ComponentVNode<TState, TProps>).view
        newVNode.state = (oldVNode as ComponentVNode<TState, TProps>).state
        newVNode.link = (oldVNode as ComponentVNode<TState, TProps>).link
        newVNode.link.vNode = newVNode
        newVNode.dispatchLevel = 0
        newVNode.ctx = (oldVNode as ComponentVNode<TState, TProps>).ctx

        if (shouldRender
            && (newVNode.ctx.shouldRender === undefined
                || newVNode.ctx.shouldRender(oldVNode.props, newVNode.props))) {

            tryRender(parentElement, newVNode, isSvg)
        }
    }
    else if (shouldRender) {
        doRender(parentElement, newVNode, isSvg)
    }
}

/** 
 * Traverses the virtual node hierarchy and unmounts any components in the 
 * hierarchy.
 */
export function findAndUnmountComponentsRec(vNode: VNode) {
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
 * 
 * @param vNode 
 */
function tryRender<TState extends {}, TProps extends {}>(parentElement: Element, vNode: ComponentVNode<TState, TProps>, isSvg: boolean) {

    vNode.dispatchLevel++

    // Render view if the component was already initialized and the 
    // dispatchLevel is at "lowest" level (i.e. 1).
    if (vNode.dispatchLevel === 1) {

        if (vNode.ctx.willRender !== undefined) {
            vNode.ctx.willRender(vNode.ctx)
        }

        doRender(parentElement, vNode, isSvg)

        if (vNode.ctx.didRender !== undefined) {
            vNode.ctx.didRender(vNode.ctx as RenderedContext<any, any>)
        }
    }
    vNode.dispatchLevel--
}

function doRender(parentElement: Element, vNode: ComponentVNode<any, any> | StatelessComponentVNode<any>, isSvg: boolean) {
    let newView: VNode

    try {
        if (vNode._ === VNODE_COMPONENT) {
            newView = vNode.view(vNode.state, vNode.props, vNode.children)
        }
        else {
            newView = vNode.view(vNode.props, vNode.children)
        }
    }
    catch (err) {
        if (vNode._ === VNODE_COMPONENT && vNode.ctx.onError !== undefined) {
            newView = vNode.ctx.onError(err)
        } else {
            // Propagate the error upwards in the hierarchy
            throw err
        }
    }

    try {
        let oldNode: Node | undefined
        if (vNode.rendition !== undefined) {
            oldNode = vNode.rendition.domRef
        }

        render(parentElement, newView, vNode.rendition, oldNode, isSvg)
    }
    catch (err) {
        console.error(err)
    }

    vNode.rendition = newView
    vNode.domRef = newView.domRef
}
