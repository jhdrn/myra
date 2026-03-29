import { ComponentProps, ComponentVNode } from './contract'
import { RenderNode } from './internal'
import { renderComponent } from './component'

const renderQueue: RenderNode[] = []
let flushScheduled = false

export function enqueueRender(
    renderNode: RenderNode
): void {
    if (!renderNode.renderPending) {
        renderQueue.push(renderNode)
        renderNode.renderPending = true
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
        entry.renderPending = false
        const vNode = entry.vNode
        if (vNode !== undefined) {
            renderComponent(
                entry.parentElement!,
                vNode as ComponentVNode<ComponentProps>,
                entry,
                entry.rendition,
                entry.isSvg ?? false,
                // allowMemo is always false for state-change re-renders
                false
            )
        }
    }
}
