/**
 * Component types
 */

export interface ComponentArgs<M, A> {
    name: string
    init: M | [M, Task | Task[]]
    mount?: Update<M, A>
    subscriptions?: { [type: string]: Update<M, any> }
    view: View<M>
}

export interface Component {
    readonly name: string
    mount<A>(parentNode: Element, arg?: A): ComponentInstance<A>
}

export interface ComponentInstance<T> {
    readonly name: string
    readonly id: number
    readonly rootNode: Node
    remount(arg?: T, forceMount?: boolean): void
}

/** "Component state holder" interface */
export interface ComponentContext<M, T> {
    readonly name: string
    readonly view: View<M>
    readonly parentNode: Element
    mounted: boolean
    mountArg: T | undefined
    dispatchLevel: number
    isUpdating: boolean
    model: M | undefined
    oldView: NodeDescriptor | undefined
    rootNode: Node
}

/**
 * Update/Dispatch types
 */
export interface Update<M, A> {
    (model: M, arg?: A): M | [M, Task | Task[]]
}
export interface UpdateAny extends Update<any, any> { }

export type Dispatch = <M, A>(fn: Update<M, A>, ...args: any[]) => void

export interface Task {
    execute(dispatch: Dispatch): void
}

/**
 * View types
 */
export interface View<M> {
    (model: M): NodeDescriptor
}

export interface AttributeMap { [name: string]: string }
export interface ListenerWithEventOptions {
    listener: Task | Update<any, any>
    preventDefault?: boolean
    stopPropagation?: boolean 
}
export type ElementEventAttributeArguments = Update<any, any> | Task | ListenerWithEventOptions
export interface ElementAttributeMap {
    'class'?: string
    id?: string
    title?: string
    focus?: boolean
    onblur?: ElementEventAttributeArguments
    onchange?: ElementEventAttributeArguments // input, select, textarea
    onclick?: ElementEventAttributeArguments
    oncontextmenu?: ElementEventAttributeArguments
    ondblclick?: ElementEventAttributeArguments
    onfocus?: ElementEventAttributeArguments
    oninput?: ElementEventAttributeArguments // input, textarea
    onkeydown?: ElementEventAttributeArguments
    onkeypress?: ElementEventAttributeArguments
    onkeyup?: ElementEventAttributeArguments
    onmousedown?: ElementEventAttributeArguments
    onmouseenter?: ElementEventAttributeArguments
    onmouseleave?: ElementEventAttributeArguments
    onmousemove?: ElementEventAttributeArguments
    onmouseout?: ElementEventAttributeArguments
    onmouseover?: ElementEventAttributeArguments
    onmouseup?: ElementEventAttributeArguments
    onreset?: ElementEventAttributeArguments // form
    onshow?: ElementEventAttributeArguments
    onsubmit?: ElementEventAttributeArguments // form
    [name: string]: any
}
export interface NodeDescriptorBase {
    node?: Node
}
export interface TextNodeDescriptor extends NodeDescriptorBase {
    __type: 'text'
    value: string
}
export interface CommentNodeDescriptor extends NodeDescriptorBase {
    __type: 'comment'
    comment: string
}
export interface ElementNodeDescriptor extends NodeDescriptorBase {
    __type: 'element'
    tagName: string
    attributes: ElementAttributeMap
    children: NodeDescriptor[]
}
export interface ComponentNodeDescriptor extends NodeDescriptorBase {
    __type: 'component'
    component: Component
    componentInstance?: ComponentInstance<any>
    forceMount?: boolean
    args: any
}
export interface NothingNodeDescriptor extends NodeDescriptorBase {
    __type: 'nothing'
}
export type NodeDescriptor = TextNodeDescriptor | CommentNodeDescriptor | ElementNodeDescriptor | ComponentNodeDescriptor | NothingNodeDescriptor