import { InitializeComponent, Dispatch, ComponentNodeDescriptor, ComponentArgs, ComponentContext, Update, View, NodeDescriptor } from './contract'
import { equal, typeOf } from './helpers'
import { dispatch } from './dispatch'
import { render } from './view'

export type Subscribe = <M, A>(msg: string, update: Update<M, A>, context: ComponentContext<M, any>) => void

const contexts: { [key: number]: ComponentContext<any, any> } = {}

let nextId = 1

/** Internal class that holds component state. */
class ComponentContextImpl<M, T> implements ComponentContext<M, T> {
    constructor(readonly parentNode: Element,
                readonly name: string,
                readonly view: View<M>,
                readonly childNodes?: NodeDescriptor[]) {
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
    model: M | undefined
    oldView: NodeDescriptor | undefined
    rootNode: Node
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
        props.foreach((p: any) => decorateFnsWithDispatch(p, dispatch))
    }
}

class ComponentNodeDescriptorImpl<M, A> /*implements ComponentNodeDescriptor*/ {
    readonly __type = 'component'
    node: Node | undefined

    private _context: ComponentContext<M, A>;

    constructor(
        private readonly _args: ComponentArgs<M, A>,
        readonly props: any,
        readonly forceMount: boolean,
        readonly children: NodeDescriptor[],
        private readonly _subscribe: Subscribe) {
    }

    private _id: number
    get id() {
        return this._id
    }

    get name() {
        return this._args.name
    }

    initComponent(parentNode: Element, parentDispatch: Dispatch) {
        if (this._context) {
            throw 'initComponent has already been called.'
        }

        decorateFnsWithDispatch(this.props, parentDispatch)

        this._context = new ComponentContextImpl<M, A>(parentNode, this.name, this._args.view, this.children)
        this._id = nextId++
        contexts[this.id] = this._context

        if (this._args.subscriptions) {
            Object.keys(this._args.subscriptions).forEach(k => {
                this._subscribe(k, this._args.subscriptions![k], this._context)
            })
        }

        // Dispatch once with init. The view won't be rendered.
        dispatch(this._context, render, (_) => this._args.init, undefined)
    
        this._context.mounted = true
        
        // Dispatch again to render the view. 
        dispatch(this._context, render, this._args.mount || ((m: M) => m), this.props)

        this.node = this._context.oldView ? this._context.oldView.node : undefined;
    }   

    updateComponent(oldDescriptor: ComponentNodeDescriptor) {
        this._id = oldDescriptor.id
        this._context = contexts[oldDescriptor.id]

        if (this.forceMount || !equal(oldDescriptor.props, this.props)) {
            dispatch(this._context, render, this._args.mount || ((m: M) => m), this.props)
        }
        // else {
            // TODO: "debug mode" with logging
            // console.log(`${this.name}: No mount argument changes detected. Skipping mount dispatch.`)
        // }
    }

}

/** Defines a component. */
export function defineComponent<M, A>(args: ComponentArgs<M, A>, subscribe: Subscribe): InitializeComponent {        
    return (props?: A, forceMount: boolean = false, childNodes: NodeDescriptor[] = []) => {
        return new ComponentNodeDescriptorImpl(
            args,
            props,
            forceMount,
            childNodes,
            subscribe
        ) as any
    }
}
