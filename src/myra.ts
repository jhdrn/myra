import { initComponent } from './component'
import { ComponentSetup, ComponentVNode, ComponentFactory, VNode } from './contract'

export * from './jsxFactory'
export * from './contract'

/** 
 * Defines a component from a ComponentSpec returning a factory that creates 
 * ComponentVNode/JSXElement's for the component.
 */
export function define<TState, TProps>(state: TState, spec: ComponentSetup<TState, TProps>) {
    return function (props: TProps, children: VNode[] = []) {
        return {
            _: 3,
            children,
            props,
            state,
            spec
        } as any as ComponentVNode<TState, TProps>
    }
}

/** 
 * Mounts the component onto the supplied element by calling the supplied 
 * component factory. 
 */
export function mount(componentFactory: ComponentFactory<any>, element: Element) {
    initComponent(componentFactory({}, []), element)
}
