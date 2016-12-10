import { ComponentFactory, ComponentDescriptor, ComponentSpec, ComponentContext, Update, NodeDescriptor } from './contract'
import { equal } from './helpers'
import { dispatch } from './dispatch'
import { render } from './view'
import { subscriptions } from './subscriptions'

type Subscribe = <TState, TArg>(msg: string, update: Update<TState, TArg>, context: ComponentContext<TState, any>) => void
const subscribe: Subscribe = <TState, TArg>(msg: string, update: Update<TState, TArg>, context: ComponentContext<TState, any>) => {
    if (!subscriptions[msg]) {
        subscriptions[msg] = []
    }
    subscriptions[msg].push([update, context])
}

type ComponentDefinitions = {
    [name: string]: ComponentSpec<any, any>
}

const componentSpecs = {} as ComponentDefinitions
const contexts: { [key: number]: ComponentContext<any, any> } = {}
let nextId = 1

/** Internal class that holds component state. */
class ComponentContextImpl<TState, TProps> implements ComponentContext<TState, TProps> {
    constructor(readonly parentNode: Element,
        readonly spec: ComponentSpec<TState, any>,
        public childNodes?: NodeDescriptor[]) {
    }

    private _mounted = false
    get mounted() {
        return this._mounted
    }
    set mounted(_) {
        if (!this._mounted) {
            this._mounted = true
        }
    }

    dispatchLevel = 0
    isUpdating = false
    props: TProps | undefined
    state: TState | undefined
    rendition: NodeDescriptor | undefined
    rootNode: Node
}

export function initComponent<T>(descriptor: ComponentDescriptor<T>, parentNode: Element) {

    const spec = componentSpecs[descriptor.name]
    const context = new ComponentContextImpl<any, any>(
        parentNode,
        spec,
        descriptor.children
    )

    context.props = descriptor.props

    descriptor.id = nextId++
    contexts[descriptor.id] = context

    if (spec.subscriptions) {
        Object.keys(spec.subscriptions).forEach(k => {
            subscribe(k, spec.subscriptions![k], context)
        })
    }

    // Dispatch once with init. The view won't be rendered.
    dispatch(context, render, () => spec.init, undefined)

    context.mounted = true

    // Dispatch again to render the view. 
    dispatch(context, render, spec.onMount || (<S>(m: S) => ({ state: m })), descriptor.props)

    if (context.rendition) {
        descriptor.node = context.rendition.node
        descriptor.rendition = context.rendition
    }
    else {
        descriptor.node = undefined
    }
}

export function updateComponent<T>(newDescriptor: ComponentDescriptor<T>,
    oldDescriptor: ComponentDescriptor<T>) {

    newDescriptor.id = oldDescriptor.id

    const context = contexts[oldDescriptor.id]
    context.props = newDescriptor.props

    if (newDescriptor.forceMount || !equal(oldDescriptor.props, newDescriptor.props)) {
        context.childNodes = newDescriptor.children

        if (!context.isUpdating) {
            dispatch(context, render, context.spec.onMount || (<TState>(s: TState) => ({ state: s })), newDescriptor.props)
        }

        newDescriptor.node = context.rendition!.node
        newDescriptor.rendition = context.rendition
    }
}

/** Defines a component. */
export function defineComponent<TState, TProps>(spec: ComponentSpec<TState, TProps>): ComponentFactory<TProps> {
    if (componentSpecs[spec.name]) {
        throw `A component with name '${spec.name}' is already defined!`
    }

    componentSpecs[spec.name] = spec

    return (props: TProps, forceMount: boolean = false, childNodes: NodeDescriptor[] = []) => {
        return {
            __type: 3,
            name: spec.name,
            id: 0,
            forceMount: forceMount,
            children: childNodes,
            rendition: undefined,
            props: props,
            node: undefined
        }
    }
}

/** Mounts the component onto the supplied element. */
export function mountComponent(component: ComponentFactory<any>, element: Element) {
    initComponent(component({}), element)
}