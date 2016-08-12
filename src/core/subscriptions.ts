import { UpdateAny, ComponentContext, Task } from './contract'
import { task } from './task'
import { dispatch } from './dispatch'
import { render } from './view'

export type Subscriptions = { [type: string]: [UpdateAny, ComponentContext<any, any>][] }

export function broadcast(type: string, data: any, subscriptions: Subscriptions): Task {
    return task((_) => {
        if (subscriptions[type]) {
            subscriptions[type].forEach(([fn, context]) => dispatch(fn, data, context, render))
        }
    })
}
