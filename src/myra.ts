import { render, useContext } from './component'
import { VNode } from './contract'

export * from './jsxFactory'
export * from './contract'

export { useContext }

/** 
 * Mounts the component onto the supplied element by calling the supplied 
 * component factory. 
 */
export function mount(vNode: VNode, element: Element) {
    render(element, vNode, undefined, undefined)
}
