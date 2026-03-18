import type { Effect, ErrorHandler, VNode } from './contract'

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
    data?: any[]
    debounceRender?: boolean
    effects?: EffectWrapper[]
    errorHandler?: ErrorHandler
    link?: ComponentLink
    memo?: boolean
    stale?: boolean
    rendition?: RenderNode
}
