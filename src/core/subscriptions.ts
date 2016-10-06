import { UpdateAny, ComponentContext, Task } from './contract'
import { task } from './task'
import { dispatch } from './dispatch'
import { render } from './view'

export type Subscriptions = { [type: string]: [UpdateAny, ComponentContext<any, any>][] }

export const subscriptions: Subscriptions = {}

/** Broadcasts a message with the given data. */
export function broadcast(type: string, data: any): Task {
    return task((_) => {
        if (subscriptions[type]) {
            subscriptions[type].forEach(([fn, context]) => dispatch(context, render, fn, data))
        }
    })
}
