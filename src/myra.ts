import { initComponent } from './component'
import { ComponentSetup, ComponentVNode, ComponentFactory, VNode } from './contract'
import { getObj, getArray } from './objectPool';

export * from './jsxFactory'
export * from './contract'

/** 
 * Defines a component from a ComponentSpec returning a factory that creates 
 * ComponentVNode/JSXElement's for the component.
 */
export function define<TState, TProps>(state: TState, spec: ComponentSetup<TState, TProps>) {
    return function (props: TProps, children: VNode[] = []) {
        const obj = getObj<any>()
        obj._ = 3
        obj.children = children
        obj.props = props
        obj.state = state
        obj.spec = spec
        return obj as ComponentVNode<TState, TProps>
    }
}

/** 
 * Mounts the component onto the supplied element by calling the supplied 
 * component factory. 
 */
export function mount(componentFactory: ComponentFactory<any, any>, element: Element) {
    initComponent(componentFactory(getObj<any>(), getArray<any>()), element)
}
