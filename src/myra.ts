import { render } from './component'
import { ComponentSetup, ComponentVNode, VNode } from './contract'
import { STATEFUL, VNODE_COMPONENT } from './constants'

export * from './jsxFactory'
export * from './contract'

/** 
 * Defines a component from a ComponentSpec returning a factory that creates 
 * ComponentVNode/JSXElement's for the component.
 */
export function define<TState, TProps>(state: TState, spec: ComponentSetup<TState, TProps>): (props: TProps, children: VNode[]) => ComponentVNode<TState, TProps> {
    const factory: any = function (props: TProps, children: VNode[] = []) {
        return {
            _: VNODE_COMPONENT,
            children,
            props,
            state,
            spec
        } as any as ComponentVNode<TState, TProps>
    }

    factory._ = STATEFUL

    return factory
}

/** 
 * Mounts the component onto the supplied element by calling the supplied 
 * component factory. 
 */
export function mount(vNode: VNode, element: Element) {
    render(element, vNode, undefined, undefined)
}
