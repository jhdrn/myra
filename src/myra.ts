import { render } from './component'
import {
    ComponentProps,
    JSXElementFactory,
    VNode
} from './contract'

export type {
    AAttributes,
    AreaAttributes,
    AudioAttributes,
    ButtonAttributes,
    CanvasAttributes,
    ColAttributes,
    ColGroupAttributes,
    ComponentFactory,
    ComponentProps,
    DelAttributes,
    DetailsAttributes,
    EmbedAttributes,
    ErrorHandler,
    Evolve,
    EventListener,
    FieldsetAttributes,
    FormAttributes,
    GenericClipboardEvent,
    GenericCompositionEvent,
    GenericDragEvent,
    GenericEvent,
    GenericFocusEvent,
    GenericInputEvent,
    GenericKeyboardEvent,
    GenericMouseEvent,
    GenericTouchEvent,
    GenericWheelEvent,
    GlobalAttributes,
    IframeAttributes,
    ImgAttributes,
    InputAttributes,
    InsAttributes,
    JSXElementFactory,
    LabelAttributes,
    LiAttributes,
    MapAttributes,
    MeterAttributes,
    MyraNode,
    ObjectAttributes,
    OptgroupAttributes,
    OptionAttributes,
    ParamAttributes,
    ProgressAttributes,
    QAttributes,
    Ref,
    SelectAttributes,
    SourceAttributes,
    SvgAttributes,
    TdAttributes,
    TextareaAttributes,
    ThAttributes,
    TimeAttributes,
    TrackAttributes,
    VideoAttributes,
    VNode
} from './contract'
export * from './fragment'
export * from './jsxFactory'
export * from './hooks'
export * from './memo'
export * from './helpers'

/**
 * Convenience function for type hinting
 * 
 * @param fn 
 */
export function define<TProps>(fn: JSXElementFactory<TProps & ComponentProps>) {
    return fn
}

/** 
 * Mounts a virtual DOM node onto the supplied element.
 */
export function mount(vNode: VNode, element: Element) {
    render(element, [vNode], [])
}
