import { Update, Effect, NodeDescriptor, ComponentContext, Result, ViewContext } from './contract'

export interface Render {
    (parentNode: Element, view: NodeDescriptor, oldView: NodeDescriptor | undefined, oldRootNode: Node | undefined): void
}

export type DebugOptions = {
    components?: string[]
}

let debugEnabled = false
const debugOptions: DebugOptions = {}

// TODO: enable custom logger
export function debug(debug: boolean = true, options?: DebugOptions) {
    debugEnabled = debug
    if (typeof options !== 'undefined') {
        debugOptions.components = options.components
    }
}

export function dispatch<TState, TArg>(context: ComponentContext<TState, any>, render: Render, fn: (state: TState, arg: TArg) => Result<TState>, arg: TArg) {

    if (context.isUpdating) {
        throw `${context.spec.name}: Dispatch error - the dispatch function may not be called during an update. Doing so would most likely corrupt the state.`
    }

    context.dispatchLevel++

    context.isUpdating = true

    const result = fn(context.state!, arg)

    if (typeof result !== 'object') {
        throw 'Invalid result.'
    }

    context.isUpdating = false

    const apply = <T>(fn: Update<TState, T>, arg: T) => dispatch(context, render, fn, arg)

    if (debugEnabled) {
        if (typeof debugOptions.components === 'undefined' ||
            debugOptions.components!.indexOf(context.spec.name) !== -1) {

            console.group(context.spec.name)
            console.debug('State before update: ', context.state)
            console.debug(`Update '${(fn as any).name}' arguments: `, arg)
            console.debug('State after update: ', result.state)
            console.groupEnd()
        }
    }

    context.state = result.state

    if (typeof result.effects !== 'undefined' && result.effects.length) {
        for (let i = 0; i < result.effects.length; i++) {
            result.effects[i](apply)
        }
    }

    // Update view if the component was already mounted and the dispatchLevel
    // is at "lowest" level (i.e. 1).
    if (context.mounted && context.dispatchLevel === 1) {
        const ctx = {
            props: context.props,
            state: context.state!,
            apply: apply,
            invoke: (fn: Effect) => fn(apply),
            children: context.childNodes
        } as ViewContext<TState, any>

        const newView = context.spec.view(ctx)

        if (typeof context.spec.onBeforeRender !== 'undefined') {
            context.spec.onBeforeRender(newView, ctx.state)
        }

        const oldNode = context.rendition ? context.rendition.node : undefined
        render(context.parentNode, newView, context.rendition, oldNode)
        context.rendition = newView

        if (typeof context.spec.onAfterRender !== 'undefined') {
            context.spec.onAfterRender(newView, ctx.state)
        }
    }
    context.dispatchLevel--
}
