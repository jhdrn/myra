import { render } from './component'
import { VNode, ComponentFactoryWithContext, ComponentProps } from './contract'

export * from './jsxFactory'
export * from './contract'

export function withContext<TProps>(componentFactory: ComponentFactoryWithContext<TProps & ComponentProps>): ComponentFactoryWithContext<TProps & { forceUpdate?: boolean }> {
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
