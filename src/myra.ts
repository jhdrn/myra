import { render } from './component'
import { ComponentFactory, ComponentProps, VNode } from './contract'
import { equalProps } from './helpers'

export {
    ErrorHandler,
    Evolve,
    Ref
} from './contract'
export * from './jsxFactory'
export * from './hooks'

/**
 * Convenience function for type hinting
 * 
 * @param fn 
 */
export function define<TProps>(fn: ComponentFactory<TProps & ComponentProps>) {
    return fn
}


const memoized: [any, VNode][] = []
let memoizedIndex = 0

export function memo<TProps>(fn: ComponentFactory<TProps & ComponentProps>): ComponentFactory<TProps & ComponentProps> {
    const n = memoizedIndex++
    return (props: TProps) => {
        if (memoized[n] === undefined || !equalProps(memoized[n][0], props)) {
            const result = fn(props)
            memoized[n] = [props, result]
            return result
        }
        return memoized[n][1]
    }
}

/** 
 * Mounts a virtual DOM node onto the supplied element.
 */
export function mount(vNode: VNode, element: Element) {
    requestAnimationFrame(() => {
        render(element, vNode, undefined, undefined)
    })
}
