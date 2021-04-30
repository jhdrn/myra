import { render } from './component'
import {
    ComponentProps,
    JSXElementFactory,
    VNode
} from './contract'

export {
    ErrorHandler,
    Evolve,
    Ref
} from './contract'
export * from './fragment'
export * from './jsxFactory'
export * from './hooks'
export * from './memo'
export * from './helpers'

/**
 * Convenience function for type hinting
 * 
 * @param fn 
 */
export function define<TProps>(fn: JSXElementFactory<TProps & ComponentProps>) {
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
