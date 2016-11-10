import { Update, Apply, Effect, NodeDescriptor, ComponentContext, Result, ViewContext } from './contract'

export interface Render {
    (parentNode: Element, view: NodeDescriptor, oldView: NodeDescriptor | undefined, oldRootNode: Node | undefined, dispatch: Apply): void
}

export function dispatch<S, A>(context: ComponentContext<S>, render: Render, fn: (state: S, ...args: any[]) => Result<S>, ...args: any[]) {

    if (context.isUpdating) {
        throw `${context.spec.name}: Dispatch error - the dispatch function may not be called during an update. Doing so would most likely corrupt the state.`
    }

    context.dispatchLevel++

    context.isUpdating = true

    const result = fn(context.state!, ...args)

    if (typeof result !== 'object') {
        throw 'Invalid result.'
    }

    context.isUpdating = false

    const apply = (fn: Update<S, A>, ...args: any[]) => dispatch(context, render, fn, ...args)

    context.state = result.state

    if (typeof result.effects !== 'undefined' && result.effects.length) {
        result.effects.forEach(t => t(apply))
    }

    // Update view if the component was already mounted and the dispatchLevel
    // is at "lowest" level (i.e. 1).
    if (context.mounted && context.dispatchLevel === 1) {
        const ctx = {
            state: context.state!,
            apply: apply,
            invoke: (fn: Effect) => fn(apply),
            children: context.childNodes,
            broadcast: () => { }
        } as ViewContext<S>

        const newView = context.spec.view(ctx)

        if (context.spec.onBeforeRender) {
            context.spec.onBeforeRender(newView)
        }

        const oldNode = context.rendition ? context.rendition.node : undefined
        render(context.parentNode, newView, context.rendition, oldNode, apply)
        context.rendition = newView

        if (context.spec.onAfterRender) {
            context.spec.onAfterRender(newView)
        }
    }
    context.dispatchLevel--
}
