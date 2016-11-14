import { UpdateAny, ComponentContext, Apply } from './contract'
import { dispatch } from './dispatch'
import { render } from './view'

export type Subscriptions = { [type: string]: [UpdateAny, ComponentContext<any>][] }

export const subscriptions: Subscriptions = {}

/** Broadcasts a message with the given data. */
export function broadcast(type: string, data: any) {
    return (_: Apply) => {
        if (subscriptions[type]) {
            subscriptions[type].forEach(([fn, context]) => dispatch(context, render, fn, data))
        }
    }
}
