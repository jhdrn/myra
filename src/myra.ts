import { render } from './component'
import { ComponentFactory, VNode } from './contract'

export * from './jsxFactory'
export * from './contract'

/**
 * Convenience function for type hinting
 * 
 * @param componentFactory 
 */
export function useContext<TProps>(
    componentFactory: ComponentFactory<TProps & { children: VNode[] }>
): ComponentFactory<TProps & { forceUpdate?: boolean }> {
    return componentFactory as any
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
