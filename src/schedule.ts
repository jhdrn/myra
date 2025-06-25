import { renderComponent } from './component'
import { ComponentProps, ComponentVNode } from './contract'

const renderQueue: Set<ComponentVNode<ComponentProps>> = new Set()

let isFlushScheduled = false
let parentElementMap: WeakMap<ComponentVNode<ComponentProps>, Element> = new WeakMap()
let isSvgMap: WeakMap<ComponentVNode<ComponentProps>, boolean> = new WeakMap()

export function scheduleRender(vNode: ComponentVNode<ComponentProps>, parentElement: Element, isSvg: boolean) {

    renderQueue.add(vNode)

    parentElementMap.set(vNode, parentElement)
    isSvgMap.set(vNode, isSvg)

    if (!isFlushScheduled) {

        isFlushScheduled = true

        queueMicrotask(() => {

            isFlushScheduled = false

            renderQueue.forEach((vNode) => {
                const parent = parentElementMap.get(vNode)!
                const svg = isSvgMap.get(vNode)!

                renderComponent(
                    parent,
                    vNode,
                    undefined,
                    vNode.rendition,
                    svg
                )
            })

            renderQueue.clear()

            parentElementMap = new WeakMap()
            isSvgMap = new WeakMap()
        })
    }
}
