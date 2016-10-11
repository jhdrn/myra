import { InitializeComponent, Dispatch, ComponentNodeDescriptor, ComponentArgs, ComponentContext, Update, View, NodeDescriptor } from './contract'
import { equal, typeOf } from './helpers'
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
    [name: string]: ComponentArgs<any, any>
}

const componentDefinitions = {} as ComponentDefinitions
const contexts: { [key: number]: ComponentContext<any> } = {}
let nextId = 1

/** Internal class that holds component state. */
class ComponentContextImpl<S> implements ComponentContext<S> {
    constructor(readonly parentNode: Element,
        readonly name: string,
        readonly view: View<S>,
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

export function initComponent(descriptor: ComponentNodeDescriptor, parentNode: Element, parentDispatch: Dispatch) {

    decorateFnsWithDispatch(descriptor.props, parentDispatch)

    const args = componentDefinitions[descriptor.name]
    const context = new ComponentContextImpl<any>(
        parentNode,
        args.name,
        args.view,
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

export function updateComponent(newDescriptor: ComponentNodeDescriptor, oldDescriptor: ComponentNodeDescriptor) {
    newDescriptor.id = oldDescriptor.id

    const args = componentDefinitions[newDescriptor.name]
    const context = contexts[oldDescriptor.id]

    if (newDescriptor.forceMount || !equal(oldDescriptor.props, newDescriptor.props)) {
        context.childNodes = newDescriptor.children

        dispatch(context, render, args.onMount || (<S>(m: S) => ({ state: m, tasks: [] })), newDescriptor.props)

        newDescriptor.node = context.rendition!.node
        newDescriptor.rendition = context.rendition
    }
    // else {
    // TODO: "debug mode" with logging
    // console.log(`${this.name}: No mount argument changes detected. Skipping mount dispatch.`)
    // }
}

/** 
 * Finds functions and decorates them with a __dispatch property which can be
 * used if the function is to be used as an event listener when passed from a 
 * parent component.
 */
function decorateFnsWithDispatch(props: any, dispatch: Dispatch) {
    const propsType = typeOf(props)
    if (propsType === 'function') {
        props.__dispatch = dispatch
    }
    else if (propsType === 'object') {
        Object.keys(props).forEach(k => decorateFnsWithDispatch(props[k], dispatch))
    }
    else if (propsType === 'array') {
        props.forEach((p: any) => decorateFnsWithDispatch(p, dispatch))
    }
}

/** Defines a component. */
export function defineComponent<S, A>(args: ComponentArgs<S, A>): InitializeComponent {
    if (componentDefinitions[args.name]) {
        throw `A component with name '${args.name}' is already defined!`
    }

    componentDefinitions[args.name] = args

    return (props?: A, forceMount: boolean = false, childNodes: NodeDescriptor[] = []) => ({
        __type: 'component',
        id: 0,
        node: undefined,
        props: props,
        forceMount: forceMount,
        children: childNodes,
        name: args.name
    } as any)
}

/** Mounts the component onto the supplied element. */
export function mountComponent(component: InitializeComponent, element: Element) {
    initComponent(component(), element, undefined as any)
}