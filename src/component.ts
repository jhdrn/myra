import { Update, ComponentFactory, ComponentVNode, ComponentSpec, ComponentContext, VNode } from './contract'
import { equal } from './helpers'
import { dispatch } from './dispatch'
import { render } from './view'

/** 
 * Holds all component specs. The component name is used as key.
 */
const componentSpecs = {} as { [name: string]: ComponentSpec<any, any> }

/** 
 * Holds all component contexts, indexed by id.
 */
const contexts: { [key: number]: ComponentContext<any, any> } = {}

let nextId = 1

/** 
 * Internal class that holds component state. 
 */
class ComponentContextImpl<TState, TProps> implements ComponentContext<TState, TProps> {
    constructor(
        readonly parentNode: Element,
        readonly spec: ComponentSpec<TState, any>,
        public childNodes?: VNode[]
    ) {
        this.state = spec.init.state
    }

    private _initialized = false
    get initialized() {
        return this._initialized
    }
    set initialized(_) {
        if (!this._initialized) {
            this._initialized = true
        }
    }

    dispatchLevel = 0
    isUpdating = false
    props: TProps | undefined
    state: TState | undefined
    rendition: VNode | undefined
    rootNode: Node
}

/** 
 * Initializes a component from a ComponentVNode.
 * 
 * Will create a ComponentContext for for the component instance and call 
 * dispatch with the intial value from the component spec. If spec.onMount is
 * set, it will also be applied.
 */
export function initComponent<T>(vNode: ComponentVNode<T>, parentNode: Element) {

    const spec = componentSpecs[vNode.name]
    const context = new ComponentContextImpl<T, any>(
        parentNode,
        spec,
        vNode.children
    )

    context.props = vNode.props

    vNode.id = nextId++
    contexts[vNode.id] = context

    if (typeof spec.init.effects !== 'undefined' && spec.init.effects.length) {
        // Dispatch once with init. The view won't be rendered.
        dispatch(context, render, function onInit() { return spec.init }, undefined)
    }

    context.initialized = true

    let onMount: Update<T, any>
    if (typeof spec.onMount === 'function') {
        onMount = spec.onMount
    }
    else {
        onMount = function onMount<S>(m: S) {
            return { state: m }
        }
    }

    // Dispatch to render the view. 
    dispatch(context, render, onMount, vNode.props)

    if (context.rendition) {
        vNode.domRef = context.rendition.domRef
        vNode.rendition = context.rendition
    }
    else {
        vNode.domRef = undefined
    }
}

/** 
 * Updates a component by comparing the new and old virtual nodes. 
 */
export function updateComponent<T>(newVNode: ComponentVNode<T>, oldVNode: ComponentVNode<T>) {

    newVNode.id = oldVNode.id

    const context = contexts[oldVNode.id]
    context.props = newVNode.props

    // The node might have changed if the node was "keyed"
    context.rendition!.domRef = oldVNode.domRef

    if (typeof newVNode.props !== 'undefined' && newVNode.props !== null && (newVNode.props as any).forceUpdate
        || !equal(oldVNode.props, newVNode.props)) {

        context.childNodes = newVNode.children

        if (!context.isUpdating) {
            dispatch(
                context,
                render,
                typeof context.spec.onMount !== 'undefined' ?
                    context.spec.onMount :
                    (<TState>(s: TState) => ({ state: s })),
                newVNode.props)
        }

        newVNode.domRef = context.rendition!.domRef

        newVNode.rendition = context.rendition
    }
}

/** 
 * Defines a component from a ComponentSpec returning a factory that creates 
 * ComponentVNode/JSXElement's for the component.
 */
export function defineComponent<TState, TProps>(spec: ComponentSpec<TState, TProps>): ComponentFactory<TProps> {
    if (componentSpecs[spec.name]) {
        throw `A component with name '${spec.name}' is already defined!`
    }

    componentSpecs[spec.name] = spec

    return (props: TProps, childNodes: VNode[] = []) => {
        return {
            __type: 3,
            name: spec.name,
            id: 0,
            children: childNodes,
            rendition: undefined,
            props: props,
            domRef: undefined
        }
    }
}

/** 
 * Mounts the component onto the supplied element by calling the supplied 
 * component factory. 
 */
export function mountComponent(componentFactory: ComponentFactory<any>, element: Element) {
    initComponent(componentFactory({}), element)
}

/** 
 * Traverses the virtual node hierarchy and unmounts any components in the 
 * hierarchy.
 */
export function findAndUnmountComponentsRec(vNode: VNode) {
    if (vNode.__type === 3) {
        const ctx = contexts[vNode.id]
        if (typeof ctx.spec.onUnmount === 'function') {
            dispatch(ctx, render, ctx.spec.onUnmount, undefined)
        }
        delete contexts[vNode.id]
        findAndUnmountComponentsRec(ctx.rendition!)
    }
    else if (vNode.__type === 2) {
        for (const c of vNode.children) {
            findAndUnmountComponentsRec(c)
        }
    }
}