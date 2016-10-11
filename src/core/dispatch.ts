import { Update, Dispatch, NodeDescriptor, ComponentContext, Result } from './contract'

export interface Render {
    (parentNode: Element, view: NodeDescriptor, oldView: NodeDescriptor | undefined, oldRootNode: Node | undefined, dispatch: Dispatch): void
}

export function dispatch<S, A>(context: ComponentContext<S>, render: Render, fn: (state: S, ...args: any[]) => Result<S>, ...args: any[]) {

    if (context.isUpdating) {
        throw `${context.name}: Dispatch error - the dispatch function may not be called during an update. Doing so would most likely corrupt the state.`
    }

    context.dispatchLevel++

    context.isUpdating = true

    const result = fn(context.state!, ...args)

    if (typeof result !== 'object') {
        throw 'Invalid result.'
    }

    context.isUpdating = false

    const dispatchFn = (fn: Update<S, A>, ...args: any[]) => dispatch(context, render, fn, ...args)

    if (result.tasks && result.tasks.length) {

        context.state = result.state

        result.tasks.forEach(t => t.execute(dispatchFn))
    }
    else {
        context.state = result.state
    }

    // Update view if the component was already mounted and the dispatchLevel
    // is at "lowest" level (i.e. 1).
    if (context.mounted && context.dispatchLevel === 1) {

        const newView = context.view(context.state!, context.childNodes)
        const oldNode = context.rendition ? context.rendition.node : undefined
        render(context.parentNode, newView, context.rendition, oldNode, dispatchFn)
        context.rendition = newView
    }

    context.dispatchLevel--
}
