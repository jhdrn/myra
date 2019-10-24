import { render } from './component'
import {
    ComponentFactory,
    ComponentProps,
    VNode
} from './contract'

export {
    ErrorHandler,
    Evolve,
    Ref
} from './contract'
export * from './jsxFactory'
export * from './hooks'
export * from './memo'

/**
 * Convenience function for type hinting
 * 
 * @param fn 
 */
export function define<TProps>(fn: ComponentFactory<TProps & ComponentProps>) {
    return fn
}

/** 
 * Mounts a virtual DOM node onto the supplied element.
 */
export function mount(vNode: VNode, element: Element) {
    requestAnimationFrame(() => {
        render(element, vNode, undefined, undefined)
    })
}
