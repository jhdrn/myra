import { ComponentFactory, ComponentDescriptor, ComponentSpec, ComponentContext, Update, NodeDescriptor } from './contract'
import { equal } from './helpers'
import { dispatch } from './dispatch'
import { render } from './view'
import { subscriptions } from './subscriptions'

type Subscribe = <S, A>(msg: string, update: Update<S, A>, context: ComponentContext<S>) => void
const subscribe: Subscribe = <S, A>(msg: string, update: Update<S, A>, context: ComponentContext<S>) => {
    if (!subscriptions[msg]) {
        subscriptions[msg] = []
    }
    subscriptions[msg].push([update, context])
}

type ComponentDefinitions = {
    [name: string]: ComponentSpec<any, any>
}

const componentDefinitions = {} as ComponentDefinitions
const contexts: { [key: number]: ComponentContext<any> } = {}
let nextId = 1

/** Internal class that holds component state. */
class ComponentContextImpl<S> implements ComponentContext<S> {
    constructor(readonly parentNode: Element,
        readonly spec: ComponentSpec<S, any>,
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
    state: S | undefined
    rendition: NodeDescriptor | undefined
    rootNode: Node
}

export function initComponent<T>(descriptor: ComponentDescriptor<T>, parentNode: Element) {

    const args = componentDefinitions[descriptor.name]
    const context = new ComponentContextImpl<any>(
        parentNode,
        args,
        descriptor.children
    )

    descriptor.id = nextId++
    contexts[descriptor.id] = context

    if (args.subscriptions) {
        Object.keys(args.subscriptions).forEach(k => {
            subscribe(k, args.subscriptions![k], context)
        })
    }

    // Dispatch once with init. The view won't be rendered.
    dispatch(context, render, () => args.init, undefined)

    context.mounted = true

    // Dispatch again to render the view. 
    dispatch(context, render, args.onMount || (<S>(m: S) => ({ state: m, tasks: [] })), descriptor.props)

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

    const args = componentDefinitions[newDescriptor.name]
    const context = contexts[oldDescriptor.id]

    if (newDescriptor.forceMount || !equal(oldDescriptor.props, newDescriptor.props)) {
        context.childNodes = newDescriptor.children

        if (!context.isUpdating) {
            dispatch(context, render, args.onMount || (<S>(m: S) => ({ state: m, tasks: [] })), newDescriptor.props)
        }

        newDescriptor.node = context.rendition!.node
        newDescriptor.rendition = context.rendition
    }
}

/** Defines a component. */
export function defineComponent<S, T>(args: ComponentSpec<S, T>): ComponentFactory<T> {
    if (componentDefinitions[args.name]) {
        throw `A component with name '${args.name}' is already defined!`
    }

    componentDefinitions[args.name] = args

    return (props: T, forceMount: boolean = false, childNodes: NodeDescriptor[] = []) => {
        return {
            __type: 'component' as 'component',
            name: args.name,
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