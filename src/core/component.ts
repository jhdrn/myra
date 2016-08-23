import { Component, ComponentArgs, ComponentInstance, ComponentContext, Update, View, NodeDescriptor } from './contract'
import { equal } from './helpers'
import { dispatch } from './dispatch'
import { render } from './view'

export type Subscribe = <M, A>(msg: string, update: Update<M, A>, context: ComponentContext<M, any>) => void


/** Public API for a component instance. */
class ComponentInstanceImpl<M, A> implements ComponentInstance<A> {
    
    private static nextId = 1
    
    readonly id: number

    constructor(
        private readonly _args: ComponentArgs<M, A>,
        private readonly _context: ComponentContext<M, A>) {

        this.id = ComponentInstanceImpl.nextId
        ComponentInstanceImpl.nextId++
    }

    get name() {
        return this._args.name
    }

    get rootNode() {
        return this._context.rootNode
    }

    initialize() {
        
        dispatch((_) => this._args.init, undefined, this._context, render)

        this.remount(this._context.mountArg)
    }

    remount(arg?: A, forceMount?: boolean) {

        if (!this._context.mounted || forceMount || !equal(arg, this._context.mountArg)) {
            
            this._context.mountArg = arg
            this._context.mounted = true
            
            if (this._args.mount) {
                dispatch(this._args.mount, arg, this._context, render)
            }
            else {
                dispatch((m: M) => m, undefined, this._context, render)
            }
        }
        else {
            // TODO: "debug mode" with logging
            // console.log(`${this.name}: No mount argument changes detected. Skipping mount dispatch.`)
        }
    }
}


/** Internal class that holds component state. */
class ComponentContextImpl<M, T> implements ComponentContext<M, T> {
    constructor(readonly parentNode: Element,
                readonly name: string,
                readonly view: View<M>,
                public mountArg: T | undefined) {
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


/** Defines a component. */
export function defineComponent<M, A>(args: ComponentArgs<M, A>, subscribe: Subscribe): Component {        
    
    return {
        name: args.name,
        mount: (parentNode: Element, mountArgs?: A): ComponentInstance<A> => {

            const context = new ComponentContextImpl<M, A>(parentNode, args.name, args.view, mountArgs)
            
            if (args.subscriptions) {
                Object.keys(args.subscriptions).forEach(k => {
                    subscribe(k, args.subscriptions![k], context)
                })
            }

            const componentInstance = new ComponentInstanceImpl<M, A>(args, context)
            componentInstance.initialize()
            return componentInstance
        }
    }
}
