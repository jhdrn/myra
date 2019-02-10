import { render, withContext } from './component'
import { VNode } from './contract'

export * from './jsxFactory'
export * from './contract'

export { withContext }

/** 
 * Mounts the component onto the supplied element by calling the supplied 
 * component factory. 
 */
export function mount(vNode: VNode, element: Element) {
    requestAnimationFrame(() => {
        render(element, vNode, undefined, undefined)
    })
}
