import type { Context, ContextBinding, Effect, ErrorHandler, VNode } from './contract'

export interface EffectWrapper {
    arg: unknown
    cleanup?: (() => void) | void
    effect: Effect
    invoke: boolean
    sync: boolean
}

export interface ComponentLink {
    renderNode: RenderNode
}

export interface RenderNode {
    domRef?: Node
    children: RenderNode[]
    vNode?: VNode
    // component-specific
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data?: any[]
    debounceRender?: boolean
    effects?: EffectWrapper[]
    errorHandler?: ErrorHandler
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    contextBindings?: Map<Context<any>, ContextBinding<any>>
    isSvg?: boolean
    link?: ComponentLink
    memo?: boolean
    parent?: RenderNode
    parentElement?: Element
    stale?: boolean
    rendition?: RenderNode
}
