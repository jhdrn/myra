import { Update, Dispatch, NodeDescriptor, ComponentContext, Task } from './contract'

export interface Render {
    (parentNode: Element, view: NodeDescriptor, oldView: NodeDescriptor | undefined, oldRootNode: Node | undefined, dispatch: Dispatch): void
}

export function dispatch<M, A>(context: ComponentContext<M, A>, render: Render, fn: (model: M, ...args: any[]) => M | [M, Task | Task[]], ...args: any[]) {

    if (context.isUpdating) {
        throw `${context.name}: Dispatch error - the dispatch function may not be called during an update. Doing so would most likely corrupt the model state.`
    }

    context.dispatchLevel++

    context.isUpdating = true

    const result = fn(context.model!, ...args)

    context.isUpdating = false

    const dispatchFn = (fn: Update<M, A>, ...args: any[]) => dispatch(context, render, fn, ...args)

    if (Array.isArray(result)) {
        const [newModel, task] = result

        context.model = newModel

        if (Array.isArray(task)) {
            task.forEach(t => t.execute(dispatchFn))
        }
        else {
            task.execute(dispatchFn)
        }
    }
    else {
        context.model = result
    }

    // Update view if the component was already mounted and the dispatchLevel
    // is at "lowest" level (i.e. 1).
    if (context.mounted && context.dispatchLevel === 1) {

        const newView = context.view(context.model!, context.childNodes)
        const oldNode = context.oldView ? context.oldView.node : undefined
        render(context.parentNode, newView, context.oldView, oldNode, dispatchFn)
        context.oldView = newView
    }

    context.dispatchLevel--
}
