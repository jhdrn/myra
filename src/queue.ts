import { ComponentProps, ComponentVNode } from './contract'
import { RenderNode } from './internal'
import { renderComponent, tryHandleComponentError } from './component'

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
    const unhandledErrors: Error[] = []

    for (const entry of batch) {
        try {
            // Reset before rendering so any setState called during render can
            // re-enqueue for the next batch (see splice(0) above).
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
        } catch (err) {
            if (!tryHandleErrorInAncestor(entry, err as Error)) {
                unhandledErrors.push(err as Error)
            }
        } finally {
            // Preserve a render scheduled during this render, but never leave
            // an entry pending when it is no longer present in the queue.
            entry.renderPending = renderQueue.indexOf(entry) !== -1
        }
    }

    // Do not interrupt the batch: report additional errors and rethrow the
    // first only after every entry and pending flag is consistent.
    if (unhandledErrors.length > 0) {
        for (let i = 1; i < unhandledErrors.length; i++) {
            console.error('An additional error occurred while flushing the render queue: ' + unhandledErrors[i])
        }
        throw unhandledErrors[0]
    }
}

/**
 * State-driven renders start at the queued component rather than at the root,
 * so errors cannot naturally bubble through ancestor component calls. Resume
 * that lookup here, beginning at the parent because renderComponent has already
 * offered the error to the queued component's own handler.
 */
function tryHandleErrorInAncestor(renderNode: RenderNode, err: Error): boolean {
    let ancestor = renderNode.parent

    while (ancestor !== undefined) {
        if (ancestor.errorHandler !== undefined && ancestor.parentElement !== undefined) {
            try {
                tryHandleComponentError(
                    ancestor.parentElement,
                    ancestor,
                    ancestor.isSvg ?? false,
                    err
                )
                return true
            } catch {
                // A failing boundary behaves like a synchronous render error:
                // give the next boundary up the component tree a chance.
            }
        }
        ancestor = ancestor.parent
    }

    return false
}
