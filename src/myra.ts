import { initComponent } from './component'
import { ComponentSetup, ComponentVNode, VNode } from './contract'
import { render } from './renderer'

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
export function mount(vNode: VNode, element: Element) {
    if (vNode._ === 3) {
        initComponent(vNode, element)
    }
    else {
        render(element, vNode, undefined, undefined)
    }
}
