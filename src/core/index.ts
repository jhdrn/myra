import { Subscriptions, broadcast as broadcastInternal } from './subscriptions'
import { Task, InitializeComponent, ComponentArgs, ComponentContext, Update } from './contract'
import { defineComponent as defineComponentInternal, Subscribe } from './component'

export { evolve } from './helpers'
export * from './contract'
export * from './task'

const subscriptions: Subscriptions = {}
const subscribe: Subscribe = <M, A>(msg: string, update: Update<M, A>, context: ComponentContext<M, any>) => {
    if (!subscriptions[msg]) {
        subscriptions[msg] = []
    }
    subscriptions[msg].push([update, context])
}

/** Broadcasts a message with the given data. */
export function broadcast(type: string, data: any): Task {
    return broadcastInternal(type, data, subscriptions)
}

/** Defines a component given the args. */
export function defineComponent<M, A>(args: ComponentArgs<M, A>): InitializeComponent {
    return defineComponentInternal(args, subscribe)
}

/** Mounts the component onto the supplied element. */
export function mount(component: InitializeComponent, element: Element) {
    component().initComponent(element, undefined as any)
}