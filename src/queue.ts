import { ComponentProps, ComponentVNode } from './contract'
import { RenderNode } from './internal'
import { renderComponent } from './component'

interface RenderQueueEntry {
    parentElement: Element
    renderNode: RenderNode
    isSvg: boolean
}

const renderQueue: RenderQueueEntry[] = []
let flushScheduled = false

export function enqueueRender(
    parentElement: Element,
    renderNode: RenderNode,
    isSvg: boolean
): void {
    if (!renderNode.debounceRender) {
        renderQueue.push({ parentElement, renderNode, isSvg })
        renderNode.debounceRender = true
    }
    if (!flushScheduled) {
        flushScheduled = true
        setTimeout(flushRenderQueue)
    }
}

function flushRenderQueue(): void {
    flushScheduled = false
    // Snapshot and clear before flushing so renders triggered during the flush
    // (e.g. cascading setState) go into the next batch rather than this one.
    const batch = renderQueue.splice(0)
    for (const entry of batch) {
        // Reset before rendering so any setState called during render can re-enqueue
        // for the next batch (see splice(0) above).
        entry.renderNode.debounceRender = false
        const vNode = entry.renderNode.vNode
        if (vNode !== undefined) {
            renderComponent(
                entry.parentElement,
                vNode as ComponentVNode<ComponentProps>,
                entry.renderNode,
                entry.renderNode.rendition,
                entry.isSvg,
                // allowMemo is always false for state-change re-renders
                false
            )
        }
    }
}
