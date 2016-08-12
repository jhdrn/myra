// import { Component } from './contract'
import { Subscriptions, broadcast as broadcastInternal } from './subscriptions'
import { Task, Component, ComponentArgs, ComponentContext, Update } from './contract'
import { defineComponent as defineComponentInternal, Subscribe } from './component'

export * from './evolve'
export * from './contract'
export * from './task'

// const components: { [name: string]: Component } = {}
const subscriptions: Subscriptions = {}
const subscribe: Subscribe = <M, A>(msg: string, update: Update<M, A>, context: ComponentContext<M, any>) => {
    if (!subscriptions[msg]) {
        subscriptions[msg] = []
    }
    subscriptions[msg].push([update, context])
}

/** Broadcasts a message with the given data */
export function broadcast(type: string, data: any): Task {
    return broadcastInternal(type, data, subscriptions)
}

export function defineComponent<M, A>(args: ComponentArgs<M, A>): Component {
    return defineComponentInternal(args, subscribe)
}