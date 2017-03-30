import {
    ComponentFactory,
    ComponentVNode,
    ComponentSpec,
    VNode,
    Update,
    Result,
    Apply,
    Render,
    ViewContext
} from './contract'
import { equal, typeOf } from './helpers'
import { render } from './renderer'


/** "Component state holder" interface */
interface ComponentContext<TState, TProps extends {}> {
    readonly spec: ComponentSpec<TState, any>
    readonly parentElement: Element
    initialized: boolean
    dispatchLevel: number
    isUpdating: boolean
    props: TProps | undefined
    state: TState | undefined
    rendition?: VNode
    childNodes?: VNode[]
}

export type DebugOptions = {
    components?: string[]
}

let debugEnabled = false

const debugOptions: DebugOptions = {}

// TODO: enable custom logger
/**
 * Turns on/off debug mode.
 */
export function debug(debug: boolean = true, options?: DebugOptions) {
    debugEnabled = debug
    if (typeof options !== 'undefined') {
        debugOptions.components = options.components
    }
}

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
 * Initializes a component from a ComponentVNode.
 * 
 * Will create a ComponentContext for for the component instance and call 
 * dispatch with the intial value from the component spec. If spec.onMount is
 * set, it will also be applied.
 */
export function initComponent<TState>(vNode: ComponentVNode<TState>, parentElement: Element) {

    const spec = componentSpecs[vNode.name]

    const context: ComponentContext<TState, any> = {
        spec: spec,
        parentElement: parentElement,
        childNodes: vNode.children,
        props: vNode.props,
        initialized: false,
        dispatchLevel: 0,
        isUpdating: false,
        state: typeOf(spec.init) === 'array' ? spec.init[0] : spec.init
    }

    vNode.id = nextId++
    contexts[vNode.id] = context

    if (typeof spec.init[1] !== 'undefined') {
        // Dispatch once with init. The view won't be rendered.
        dispatch(context, render, function onInit() { return spec.init })
    }

    context.initialized = true


    let onMount: Update<TState> | undefined
    if (typeof context.spec.onMount !== 'undefined') {
        onMount = (s: TState) => context.spec.onMount!(s, vNode.props)
    }

    // Dispatch to render the view. 
    dispatch(context, render, onMount)

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
export function updateComponent<TState>(newVNode: ComponentVNode<TState>, oldVNode: ComponentVNode<TState>) {

    newVNode.id = oldVNode.id

    const context = contexts[oldVNode.id]
    context.props = newVNode.props

    // The node might have changed if the node was "keyed"
    context.rendition!.domRef = oldVNode.domRef

    if (typeof newVNode.props !== 'undefined' && newVNode.props !== null && (newVNode.props as any).forceUpdate
        || !equal(oldVNode.props, newVNode.props)) {

        context.childNodes = newVNode.children

        let onMount: Update<TState> | undefined
        if (typeof context.spec.onMount !== 'undefined') {
            onMount = (s: TState) => context.spec.onMount!(s, newVNode.props)
        }

        if (!context.isUpdating) {
            dispatch(context, render, onMount)
        }

        newVNode.domRef = context.rendition!.domRef

        newVNode.rendition = context.rendition
    }
}

/** 
 * Defines a component from a ComponentSpec returning a factory that creates 
 * ComponentVNode/JSXElement's for the component.
 */
export function define<TState, TProps>(name: string, init: Result<TState>, render: Render<TState, TProps>): ComponentFactory<TProps>
export function define<TState, TProps>(spec: ComponentSpec<TState, TProps>): ComponentFactory<TProps>
export function define<TState, TProps>(): ComponentFactory<TProps> {
    let spec: ComponentSpec<TState, TProps>
    if (typeof arguments[0] === 'object') {
        spec = arguments[0]
    }
    else {
        spec = {
            name: arguments[0],
            init: arguments[1],
            render: arguments[2]
        }
    }

    if (componentSpecs[spec.name]) {
        throw `A component with name '${spec.name}' is already defined!`
    }

    componentSpecs[spec.name] = spec

    return (props: TProps, childNodes: VNode[] = []) => {
        return {
            _: 3,
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
export function mount(componentFactory: ComponentFactory<any>, element: Element) {
    initComponent(componentFactory({}), element)
}

/** 
 * Traverses the virtual node hierarchy and unmounts any components in the 
 * hierarchy.
 */
export function findAndUnmountComponentsRec(vNode: VNode) {
    if (vNode._ === 3) {
        const ctx = contexts[vNode.id]
        if (typeof ctx.spec.onUnmount === 'function') {
            dispatch(ctx, render, ctx.spec.onUnmount)
        }
        delete contexts[vNode.id]
        findAndUnmountComponentsRec(ctx.rendition!)
    }
    else if (vNode._ === 2) {
        for (const c of vNode.children) {
            findAndUnmountComponentsRec(c)
        }
    }
}

function dispatch<TState extends {}>(
    context: ComponentContext<TState, any>,
    render: (parentNode: Element, view: VNode, oldView: VNode | undefined, oldRootNode: Node | undefined, apply: Apply<TState>) => void,
    fn?: Update<TState>) {

    if (context.isUpdating) {
        throw `${context.spec.name}: Dispatch error - the dispatch function may not be called during an update. Doing so would most likely corrupt the state.`
    }

    context.dispatchLevel++

    const apply: Apply<TState> = (update: Update<TState> | Result<TState>) => {
        if (typeof update !== 'function') {
            dispatch(context, render, ((_s: TState) => update) as Update<TState>)
        }
        else {
            dispatch(context, render, update as Update<TState>)
        }
    }


    if (typeof fn !== 'undefined') {

        context.isUpdating = true

        let result = fn(context.state!)

        const resultType = typeOf(result)
        if (resultType === 'object') {
            result = [result] as Result<TState>
        }
        else if (resultType !== 'array') {
            throw `${context.spec.name}: The result of an update function must be an object literal or a tuple`
        }

        const newState = { ...<any>context.state, ...(result as any)[0] }

        if (debugEnabled) {
            if (typeof debugOptions.components === 'undefined' ||
                debugOptions.components!.indexOf(context.spec.name) !== -1) {

                console.groupCollapsed(`${context.spec.name} ${(fn as any).name}`)
                console.debug('State before update: ', context.state)
                console.debug('State after update: ', newState)
                console.groupEnd()
            }
        }

        context.state = newState

        context.isUpdating = false

        if ((result as any).length === 2 && typeof (result as any)[1] === 'function') {
            (result as any)[1](apply)
        }
    }

    // Update view if the component was already initialized and the 
    // dispatchLevel is at "lowest" level (i.e. 1).
    if (context.initialized && context.dispatchLevel === 1) {
        const ctx = {
            props: context.props,
            state: context.state!,
            children: context.childNodes,
            parentElement: context.parentElement,
            apply: apply
        } as ViewContext<TState, any>

        const newView = context.spec.render(ctx)

        const oldNode = context.rendition ? context.rendition.domRef : undefined
        render(context.parentElement, newView, context.rendition, oldNode, apply)
        context.rendition = newView
    }
    context.dispatchLevel--
}
