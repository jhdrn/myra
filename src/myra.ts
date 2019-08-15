import { render } from './component'
import { ComponentFactory, ComponentProps, VNode } from './contract'

export * from './jsxFactory'
export {
    ErrorHandler,
    Evolve,
    Ref,
} from './contract'
export {
    useEffect,
    useErrorHandler,
    useMemo,
    useRef,
    useState,
    useLayoutEffect,
} from './component'

/**
 * Convenience function for type hinting
 * 
 * @param fn 
 */
export function define<TProps>(fn: ComponentFactory<TProps & ComponentProps>) {
    return fn
}

/** 
 * Mounts the component onto the supplied element by calling the supplied 
 * component factory. 
 */
export function mount(vNode: VNode, element: Element) {
    requestAnimationFrame(() => {
        render(element, vNode, undefined, undefined)
    })
}
