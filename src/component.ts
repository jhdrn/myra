import {
    ComponentFactory,
    ComponentVNode,
    ComponentSpec,
    VNode,
    Post,
    Update,
    Render,
    ViewContext
} from './contract'
import { equal } from './helpers'
import { render } from './renderer'

/** 
 * Defines a component from a ComponentSpec returning a factory that creates 
 * ComponentVNode/JSXElement's for the component.
 */
export function define<TState, TProps>(initialState: TState, render: Render<TState, TProps>): ComponentFactory<TState, TProps>
export function define<TState, TProps>(spec: ComponentSpec<TState, TProps>): ComponentFactory<TState, TProps>
export function define<TState, TProps>(): ComponentFactory<TState, TProps> {
    let spec: ComponentSpec<TState, TProps>
    if (arguments.length === 1) {
        spec = arguments[0]
    }
    else {
        spec = {
            init: arguments[0],
            render: arguments[1]
        }
    }
    return (props: TProps, childNodes: VNode[] = []): ComponentVNode<TState, TProps> => {
        return {
            _: 3,
            spec: spec,
            children: childNodes,
            props: props,
            state: spec.init,
            dispatchLevel: 0
        }
    }
}

/** 
 * Mounts the component onto the supplied element by calling the supplied 
 * component factory. 
 */
export function mount(componentFactory: ComponentFactory<any, any>, element: Element) {
    initComponent(componentFactory({}), element)
}

/** 
 * Initializes a component from a ComponentVNode.
 * 
 * Will create a ComponentContext for for the component instance and call 
 * dispatch with the intial value from the component spec. If spec.onMount is
 * set, it will also be applied.
 */
export function initComponent<TState, TProps>(vNode: ComponentVNode<TState, TProps>, parentElement: Element) {

    vNode.parentElement = parentElement

    mountComponent(vNode)

    return vNode.domRef!
}


/** 
 * Updates a component by comparing the new and old virtual nodes. 
 */
export function updateComponent<TState, TProps>(newVNode: ComponentVNode<TState, TProps>, oldVNode: ComponentVNode<TState, TProps>) {

    newVNode.parentElement = oldVNode.parentElement
    newVNode.rendition = oldVNode.rendition
    newVNode.state = oldVNode.state

    if (typeof newVNode.props !== 'undefined' && newVNode.props !== null && (newVNode.props as any).forceUpdate
        || !equal(oldVNode.props, newVNode.props)) {

        mountComponent(newVNode)
    }
}

function mountComponent<TState, TProps>(vNode: ComponentVNode<TState, TProps>) {

    let onMount: Update<TState> | undefined
    if (typeof vNode.spec.onMount !== 'undefined') {
        const post: Post<TState> = (update: Update<TState>) => {
            dispatch(vNode, render, update)
        }
        onMount = (s: TState) => vNode.spec.onMount!(s, vNode.props, post)
    }

    // Dispatch to render the view. 
    dispatch(vNode, render, onMount)
}

/** 
 * Traverses the virtual node hierarchy and unmounts any components in the 
 * hierarchy.
 */
export function findAndUnmountComponentsRec(vNode: VNode) {
    if (vNode._ === 3) {
        let onUnmount: Update<any> | undefined
        if (typeof vNode.spec.onUnmount !== 'undefined') {
            onUnmount = (s: any) => vNode.spec.onUnmount!(s, vNode.props)
        }

        dispatch(vNode, render, onUnmount)

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
    update?: Update<TState>) {

    vNode.dispatchLevel++

    const post: Post<TState> = update => {
        let updateFn: Update<TState>
        if (typeof update === 'function') {
            updateFn = update
        }
        else {
            updateFn = (_s: Readonly<TState>) => update
        }
        dispatch(vNode, render, updateFn)
    }

    if (typeof update !== 'undefined') {
        vNode.state = { ...<any>vNode.state, ...(update(vNode.state!) as object) }
    }

    // Update view if the component was already initialized and the 
    // dispatchLevel is at "lowest" level (i.e. 1).
    if (vNode.dispatchLevel === 1) {
        const ctx = {
            props: vNode.props,
            state: vNode.state!,
            children: vNode.children,
            parentElement: vNode.parentElement,
            post: post
        } as ViewContext<TState, any>

        const newView = vNode.spec.render(ctx)

        const oldNode = vNode.rendition ? vNode.rendition.domRef : undefined
        render(vNode.parentElement!, newView, vNode.rendition, oldNode)

        vNode.rendition = newView

        if (typeof newView.domRef !== undefined) {
            vNode.domRef = newView.domRef
        }
        else {
            vNode.domRef = undefined
        }
    }
    vNode.dispatchLevel--
}
