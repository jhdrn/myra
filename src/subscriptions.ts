import { Update, ComponentContext, Apply } from './contract'
import { dispatch } from './dispatch'
import { render } from './view'

export type Subscriptions = { [type: string]: [Update<any, any>, ComponentContext<any, any>][] }

export const subscriptions: Subscriptions = {}

/** Broadcasts a message with the given data. */
export function broadcast(type: string, data: any) {
    return (_: Apply) => {
        if (subscriptions[type]) {
            subscriptions[type].forEach(([fn, context]) => dispatch(context, render, fn, data))
        }
    }
}
