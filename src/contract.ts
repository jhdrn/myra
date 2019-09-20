declare global {

    namespace JSX {

        type GlobalHtmlAttributes<TElement extends HTMLElement> = GlobalAttributes<TElement>

        export type Element = VNode

        export interface ElementClass<TProps> {
            props: TProps
        }
        export interface ElementAttributesProperty<TProps> {
            props: TProps
        }
        export interface IntrinsicElements {
            nothing: {}

            a: AAttributes
            attr: GlobalHtmlAttributes<HTMLElement>
            address: GlobalHtmlAttributes<HTMLElement>
            area: AreaAttributes
            article: GlobalHtmlAttributes<HTMLElement>
            aside: GlobalHtmlAttributes<HTMLElement>
            audio: AudioAttributes

            b: GlobalHtmlAttributes<HTMLElement>
            bdi: GlobalHtmlAttributes<HTMLElement>
            bdo: GlobalHtmlAttributes<HTMLElement>
            blockquote: GlobalHtmlAttributes<HTMLElement>
            br: GlobalHtmlAttributes<HTMLBRElement>
            button: ButtonAttributes

            canvas: CanvasAttributes
            caption: GlobalHtmlAttributes<HTMLTableCaptionElement>
            cite: GlobalHtmlAttributes<HTMLElement>
            code: GlobalHtmlAttributes<HTMLElement>
            col: ColAttributes
            colgroup: ColGroupAttributes

            data: GlobalHtmlAttributes<HTMLElement>
            datalist: GlobalHtmlAttributes<HTMLDataListElement>
            dd: GlobalHtmlAttributes<HTMLElement>
            del: DelAttributes
            details: DetailsAttributes
            dfn: GlobalHtmlAttributes<HTMLElement>
            div: GlobalHtmlAttributes<HTMLDivElement>
            dl: GlobalHtmlAttributes<HTMLDListElement>
            dt: GlobalHtmlAttributes<HTMLElement>

            em: GlobalHtmlAttributes<HTMLElement>
            embed: EmbedAttributes

            fieldset: FieldsetAttributes
            figcaption: GlobalHtmlAttributes<HTMLElement>
            figure: GlobalHtmlAttributes<HTMLElement>
            footer: GlobalHtmlAttributes<HTMLElement>
            form: FormAttributes

            h1: GlobalHtmlAttributes<HTMLHeadingElement>
            h2: GlobalHtmlAttributes<HTMLHeadingElement>
            h3: GlobalHtmlAttributes<HTMLHeadingElement>
            h4: GlobalHtmlAttributes<HTMLHeadingElement>
            h5: GlobalHtmlAttributes<HTMLHeadingElement>
            h6: GlobalHtmlAttributes<HTMLHeadingElement>
            header: GlobalHtmlAttributes<HTMLElement>
            hr: GlobalHtmlAttributes<HTMLHRElement>

            i: GlobalHtmlAttributes<HTMLElement>
            iframe: IframeAttributes
            img: ImgAttributes
            input: InputAttributes
            ins: InsAttributes

            kbd: GlobalHtmlAttributes<HTMLElement>

            label: LabelAttributes
            legend: GlobalHtmlAttributes<HTMLLegendElement>
            li: LiAttributes

            main: GlobalHtmlAttributes<HTMLElement>
            map: MapAttributes
            mark: GlobalHtmlAttributes<HTMLElement>
            meter: MeterAttributes

            nav: GlobalHtmlAttributes<HTMLElement>

            object: ObjectAttributes
            ol: GlobalHtmlAttributes<HTMLOListElement>
            optgroup: OptgroupAttributes
            option: OptionAttributes
            output: GlobalHtmlAttributes<HTMLElement>

            p: GlobalHtmlAttributes<HTMLParagraphElement>
            param: ParamAttributes
            pre: GlobalHtmlAttributes<HTMLPreElement>
            progress: ProgressAttributes

            q: QAttributes

            rp: GlobalHtmlAttributes<HTMLElement>
            rt: GlobalHtmlAttributes<HTMLElement>
            ruby: GlobalHtmlAttributes<HTMLElement>

            s: GlobalHtmlAttributes<HTMLElement>
            samp: GlobalHtmlAttributes<HTMLElement>
            section: GlobalHtmlAttributes<HTMLElement>
            select: SelectAttributes
            small: GlobalHtmlAttributes<HTMLElement>
            source: SourceAttributes
            span: GlobalHtmlAttributes<HTMLElement>
            strong: GlobalHtmlAttributes<HTMLElement>
            sub: GlobalHtmlAttributes<HTMLElement>
            summary: GlobalHtmlAttributes<HTMLElement>
            sup: GlobalHtmlAttributes<HTMLElement>

            table: GlobalHtmlAttributes<HTMLTableElement>
            tbody: GlobalHtmlAttributes<HTMLTableSectionElement>
            td: TdAttributes
            textarea: TextareaAttributes
            tfoot: GlobalHtmlAttributes<HTMLTableSectionElement>
            th: ThAttributes
            thead: GlobalHtmlAttributes<HTMLTableSectionElement>
            time: TimeAttributes
            tr: GlobalHtmlAttributes<HTMLTableRowElement>
            track: TrackAttributes

            u: GlobalHtmlAttributes<HTMLElement>
            ul: GlobalHtmlAttributes<HTMLUListElement>

            var: GlobalHtmlAttributes<HTMLElement>
            video: VideoAttributes

            wbr: GlobalHtmlAttributes<HTMLElement>

            // SVG
            altGlyph: SvgAttributes
            altGlyphDef: SvgAttributes
            altGlyphItem: SvgAttributes
            animate: SvgAttributes
            animateColor: SvgAttributes
            animateMotion: SvgAttributes
            animateTransform: SvgAttributes

            circle: SvgAttributes
            clipPath: SvgAttributes
            'color-profile': SvgAttributes
            cursor: SvgAttributes

            defs: SvgAttributes
            desc: SvgAttributes
            discard: SvgAttributes

            ellipse: SvgAttributes

            feBlend: SvgAttributes
            feColorMatrix: SvgAttributes
            feComponentTransfer: SvgAttributes
            feComposite: SvgAttributes
            feConvolveMatrix: SvgAttributes
            feDiffuseLighting: SvgAttributes
            feDisplacementMap: SvgAttributes
            feDistantLight: SvgAttributes
            feDropShadow: SvgAttributes
            feFlood: SvgAttributes
            feFuncA: SvgAttributes
            feFuncB: SvgAttributes
            feFuncG: SvgAttributes
            feFuncR: SvgAttributes
            feGaussianBlur: SvgAttributes
            feImage: SvgAttributes
            feMerge: SvgAttributes
            feMergeNode: SvgAttributes
            feMorphology: SvgAttributes
            feOffset: SvgAttributes
            fePointLight: SvgAttributes
            feSpecularLighting: SvgAttributes
            feSpotLight: SvgAttributes
            feTile: SvgAttributes
            feTurbulence: SvgAttributes
            filter: SvgAttributes
            font: SvgAttributes
            'font-face': SvgAttributes
            'font-face-format': SvgAttributes
            'font-face-name': SvgAttributes
            'font-face-src': SvgAttributes
            'font-face-uri': SvgAttributes
            foreignObject: SvgAttributes

            g: SvgAttributes
            glyph: SvgAttributes
            glyphRef: SvgAttributes

            hatch: SvgAttributes
            hatchpath: SvgAttributes
            hkern: SvgAttributes

            image: SvgAttributes

            line: SvgAttributes
            linearGradient: SvgAttributes

            marker: SvgAttributes
            mask: SvgAttributes
            mesh: SvgAttributes
            meshgradient: SvgAttributes
            meshpatch: SvgAttributes
            meshrow: SvgAttributes
            metadata: SvgAttributes
            'missing-glyph': SvgAttributes
            mpath: SvgAttributes

            path: SvgAttributes
            pattern: SvgAttributes
            polygon: SvgAttributes
            polyline: SvgAttributes

            radialGradient: SvgAttributes
            rect: SvgAttributes

            script: SvgAttributes
            set: SvgAttributes
            solidcolor: SvgAttributes
            stop: SvgAttributes
            style: SvgAttributes
            svg: SvgAttributes
            switch: SvgAttributes
            symbol: SvgAttributes

            text: SvgAttributes
            textPath: SvgAttributes
            title: SvgAttributes
            tref: SvgAttributes
            tspan: SvgAttributes

            unknown: SvgAttributes
            use: SvgAttributes

            view: SvgAttributes
            vkern: SvgAttributes
        }
    }

}

export type UpdateState<TState> = Partial<TState> | ((s: Readonly<TState>) => Partial<TState>)
export type Evolve<TState> = (update: UpdateState<TState>) => void

export interface View<TState, TProps> {
    (state: TState, props: TProps, children: JSX.Element[]): JSX.Element
}
export interface Context<TState, TProps> {
    readonly evolve: Evolve<TState>
    readonly props: TProps
    readonly state: TState
    readonly domRef: Element | undefined
}
export interface SetupContext<TState, TProps> extends Context<TState, TProps> {
    defaultProps?: Partial<TProps>
    willMount?: (ctx: Context<TState, TProps>) => void
    didMount?: (ctx: Context<TState, TProps>) => void
    shouldRender?: (oldProps: TProps, newProps: TProps) => boolean
    willRender?: (ctx: Context<TState, TProps>) => void
    didRender?: (ctx: Context<TState, TProps>) => void
    willUnmount?: (ctx: Context<TState, TProps>) => void
}

export type ComponentSetup<TState, TProps> = (ctx: SetupContext<TState, TProps>) => View<TState, TProps>

export interface ComponentFactory<TProps> {
    (props: TProps, children: VNode[]): VNode
}

export interface AttributeMap { [name: string]: string }

export interface GenericEvent<T extends EventTarget> extends Event {
    currentTarget: T
}
export interface GenericMouseEvent<T extends EventTarget> extends MouseEvent {
    currentTarget: T
}
export interface GenericKeyboardEvent<T extends EventTarget> extends KeyboardEvent {
    currentTarget: T
}
export interface GenericFocusEvent<T extends EventTarget> extends FocusEvent {
    currentTarget: T
}
export interface GenericDragEvent<T extends EventTarget> extends DragEvent {
    currentTarget: T
}

/**
 * A function used as callback for event triggers.
 */
export type EventListener<TEvent extends Event> = (event: TEvent) => void

/**
 * Base interface for a virtual node.
 */
export interface VNodeBase {
    /**
     * A reference to a DOM node.
     */
    domRef?: Node
}

/**
 * A virtual node that represents a text DOM node. 
 */
export interface TextVNode extends VNodeBase {
    readonly _: 1
    readonly value: string
}

/**
 * A virtual node representing a DOM Element. 
 */
export interface ElementVNode<TElement extends Element> extends VNodeBase {
    readonly _: 2
    readonly tagName: string
    readonly props: GlobalAttributes<TElement>
    readonly children: VNode[]
    domRef?: TElement
}

/**
 * A virtual node representing a component.
 */

export interface ComponentVNode<TState extends {}, TProps extends {}> extends VNodeBase {
    readonly _: 3
    children: VNode[]
    rendition?: VNode
    props: TProps
    state: Readonly<TState>
    spec: ComponentSetup<TState, TProps>
    ctx: SetupContext<TState, TProps>
    view: View<TState, TProps>
    dispatchLevel: number
    link: { vNode: ComponentVNode<TState, TProps> }
}

export interface StatelessComponentVNode<TProps extends {}> extends VNodeBase {
    readonly _: 4
    children: VNode[]
    props: TProps
    view: (props: TProps, children: JSX.Element[]) => JSX.Element
    rendition?: VNode
}
/**
 * A virtual node representing nothing. Will be rendered as a comment DOM 
 * node.
 */
export interface NothingVNode extends VNodeBase {
    readonly _: 0
}

/**
 * Union type of the different types of virtual nodes.
 */
export type VNode = TextVNode | ElementVNode<any> | ComponentVNode<any, any> | StatelessComponentVNode<any> | NothingVNode

export interface GlobalAttributes<TElement extends Element> {
    key?: any
    accesskey?: string
    'class'?: string
    contenteditable?: boolean | '' | 'true' | 'false'
    contextmenu?: string
    dir?: 'ltr' | 'rtl' | 'auto'
    draggable?: boolean | 'true' | 'false'
    hidden?: boolean | 'true' | 'false'
    id?: string
    lang?: string
    spellcheck?: boolean | 'default' | 'true' | 'false'
    style?: string
    tabindex?: number | string
    title?: string
    translate?: '' | 'yes' | 'no'

    blur?: boolean
    click?: boolean
    focus?: boolean

    onblur?: EventListener<GenericEvent<TElement>>
    onclick?: EventListener<GenericMouseEvent<TElement>>
    oncontextmenu?: EventListener<GenericEvent<TElement>>
    ondblclick?: EventListener<GenericMouseEvent<TElement>>
    onfocus?: EventListener<GenericFocusEvent<TElement>>
    onkeydown?: EventListener<GenericKeyboardEvent<TElement>>
    onkeypress?: EventListener<GenericKeyboardEvent<TElement>>
    onkeyup?: EventListener<GenericKeyboardEvent<TElement>>
    onmousedown?: EventListener<GenericMouseEvent<TElement>>
    onmouseenter?: EventListener<GenericMouseEvent<TElement>>
    onmouseleave?: EventListener<GenericMouseEvent<TElement>>
    onmousemove?: EventListener<GenericMouseEvent<TElement>>
    onmouseout?: EventListener<GenericMouseEvent<TElement>>
    onmouseover?: EventListener<GenericMouseEvent<TElement>>
    onmouseup?: EventListener<GenericMouseEvent<TElement>>
    onshow?: EventListener<GenericEvent<TElement>>

    ondrag?: EventListener<GenericDragEvent<TElement>>
    ondragend?: EventListener<GenericDragEvent<TElement>>
    ondragenter?: EventListener<GenericDragEvent<TElement>>
    ondragexit?: EventListener<GenericDragEvent<TElement>>
    ondragleave?: EventListener<GenericDragEvent<TElement>>
    ondragover?: EventListener<GenericDragEvent<TElement>>
    ondragstart?: EventListener<GenericDragEvent<TElement>>
    ondrop?: EventListener<GenericDragEvent<TElement>>

    role?: string

    // Widget attributes

    'aria-autocomplete'?: any
    'aria-checked'?: any
    'aria-disabled'?: any
    'aria-expanded'?: any
    'aria-haspopup'?: any
    'aria-hidden'?: any
    'aria-invalid'?: any
    'aria-label'?: any
    'aria-level'?: any
    'aria-multiline'?: any
    'aria-multiselectable'?: any
    'aria-orientation'?: any
    'aria-pressed'?: any
    'aria-readonly'?: any
    'aria-required'?: any
    'aria-selected'?: any
    'aria-sort'?: any
    'aria-valuemax'?: any
    'aria-valuemin'?: any
    'aria-valuenow'?: any
    'aria-valuetext'?: any

    // Live region attributes

    'aria-live'?: any
    'aria-relevant'?: any
    'aria-atomic'?: any
    'aria-busy'?: any

    // Drag & drop attributes

    'aria-dropeffect'?: any
    'aria-dragged'?: any

    // Relationship attributes

    'aria-activedescendant'?: any
    'aria-controls'?: any
    'aria-describedby'?: any
    'aria-flowto'?: any
    'aria-labelledby'?: any
    'aria-owns'?: any
    'aria-posinset'?: any
    'aria-setsize'?: any

    // [name: string]: any
}

export interface AAttributes extends GlobalAttributes<HTMLAnchorElement> {
    download?: string
    href?: string
    hreflang?: string
    rel?: string
    target?: string
    type?: string
}

export interface AreaAttributes extends GlobalAttributes<HTMLAreaElement> {
    alt?: string
    coords?: string
    download?: string
    href?: string
    hreflang?: string
    media?: string
    rel?: string
    shape?: string
    target?: string
    type?: string
}
export interface AudioAttributes extends GlobalAttributes<HTMLAudioElement> {
    autoplay?: boolean | 'true' | 'false'
    buffered?: any
    controls?: any
    loop?: boolean | 'true' | 'false'
    muted?: boolean | 'true' | 'false'
    played?: any
    preload?: '' | 'none' | 'metadata' | 'auto'
    src?: string
    volume?: number | string
}
export interface ButtonAttributes extends GlobalAttributes<HTMLButtonElement> {
    autofocus?: boolean | 'true' | 'false'
    disabled?: boolean | 'true' | 'false'
    form?: string
    formaction?: string
    formenctype?: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain'
    formmethod?: 'post' | 'get'
    formnovalidate?: boolean | 'true' | 'false'
    formtarget?: string
    name?: string
    type?: 'submit' | 'reset' | 'button'
    value?: string | number
}
export interface CanvasAttributes extends GlobalAttributes<HTMLCanvasElement> {
    height?: number | string
    width?: number | string
}
export interface ColAttributes extends GlobalAttributes<HTMLTableColElement> {
    span?: number | string
}
export interface ColGroupAttributes extends GlobalAttributes<HTMLTableColElement> {
    span?: number | string
}
export interface DelAttributes extends GlobalAttributes<HTMLElement> {
    cite?: string
    datetime?: string
}
export interface DetailsAttributes extends GlobalAttributes<HTMLElement> {
    open?: boolean | 'true' | 'false'
}
export interface EmbedAttributes extends GlobalAttributes<HTMLEmbedElement> {
    height?: number | string
    src?: string
    type?: string
    width?: number | string
}
export interface FieldsetAttributes extends GlobalAttributes<HTMLFieldSetElement> {
    disabled?: boolean | 'true' | 'false'
    form?: string
    name?: string
}
export interface FormAttributes extends GlobalAttributes<HTMLFormElement> {
    accept?: string
    'accept-charset'?: string
    action?: string
    autocomplete?: 'on' | 'off'
    enctype?: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain'
    method?: 'post' | 'get'
    name?: string
    novalidate?: boolean | 'true' | 'false'
    target?: string

    onreset?: EventListener<GenericEvent<HTMLFormElement>>
    onsubmit?: EventListener<GenericEvent<HTMLFormElement>> // FormElementEventAttributeArguments
    onchange?: EventListener<GenericEvent<HTMLFormElement>> // FormElementEventAttributeArguments
}
export interface IframeAttributes extends GlobalAttributes<HTMLIFrameElement> {
    allowfullscreen?: boolean | 'true' | 'false'
    height?: number | string
    name?: string
    sandbox?: string
    src?: string
    srcdoc?: string
    width?: number | string
}
export interface ImgAttributes extends GlobalAttributes<HTMLImageElement> {
    alt?: string
    crossorigin?: 'anonymous' | 'use-credentials'
    height?: number | string
    ismap?: boolean | 'true' | 'false'
    longdesc?: string
    sizes?: string
    src: string
    srcset?: string
    width?: number | string
    usemap?: string
}
export interface InputAttributes extends GlobalAttributes<HTMLInputElement> {
    type?: 'button' | 'checkbox' | 'color' | 'date' | 'datetime' | 'datetime-local' | 'email' | 'file' | 'hidden' | 'image' | 'month' | 'number' | 'password' | 'radio' | 'range' | 'reset' | 'search' | 'submit' | 'tel' | 'text' | 'time' | 'url' | 'week'
    accept?: string
    autocomplete?: string
    autofocus?: boolean | 'true' | 'false'
    capture?: boolean | 'true' | 'false'
    checked?: boolean | 'true' | 'false'
    disabled?: boolean | 'true' | 'false'
    form?: string
    formaction?: string
    formenctype?: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain'
    formmethod?: 'post' | 'get'
    formnovalidate?: boolean | 'true' | 'false'
    formtarget?: string
    height?: number | string
    inputmode?: string
    list?: string
    max?: number | string
    maxlength?: number | string
    min?: number | string
    minlength?: number | string
    multiple?: boolean | 'true' | 'false'
    name?: string
    pattern?: string
    placeholder?: string
    readonly?: boolean | 'true' | 'false'
    required?: boolean | 'true' | 'false'
    selectionDirection?: string
    size?: number | string
    spellcheck?: boolean | 'true' | 'false'
    src?: string
    step?: number | string
    value?: string | number
    width?: number | string

    onchange?: EventListener<GenericEvent<HTMLInputElement>>
    oninput?: EventListener<GenericEvent<HTMLInputElement>>
}
export interface InsAttributes extends GlobalAttributes<HTMLElement> {
    cite?: string
    datetime?: string
}
export interface LabelAttributes extends GlobalAttributes<HTMLLabelElement> {
    for?: string
    form?: string
}
export interface LiAttributes extends GlobalAttributes<HTMLLIElement> {
    value?: number | string
}
export interface MapAttributes extends GlobalAttributes<HTMLMapElement> {
    name?: string
}
export interface MeterAttributes extends GlobalAttributes<HTMLMeterElement> {
    value?: number | string
    min?: number | string
    max?: number | string
    low?: number | string
    high?: number | string
    optimum?: number | string
    form?: string
}
export interface ObjectAttributes extends GlobalAttributes<HTMLObjectElement> {
    data?: string
    height?: number | string
    name?: string
    type?: string
    usemap?: string
    width?: number | string
}
export interface OptgroupAttributes extends GlobalAttributes<HTMLOptGroupElement> {
    disabled?: boolean | 'true' | 'false'
    label?: string
}
export interface OptionAttributes extends GlobalAttributes<HTMLOptionElement> {
    disabled?: boolean | 'true' | 'false'
    label?: string
    selected?: boolean | 'true' | 'false'
    value?: string | number
}
export interface ParamAttributes extends GlobalAttributes<HTMLParamElement> {
    name?: string
    value?: string
}
export interface ProgressAttributes extends GlobalAttributes<HTMLProgressElement> {
    max?: number | string
    value?: number | string
}
export interface QAttributes extends GlobalAttributes<HTMLQuoteElement> {
    cite?: string
}
export interface SelectAttributes extends GlobalAttributes<HTMLSelectElement> {
    autofocus?: boolean | 'true' | 'false'
    disabled?: boolean | 'true' | 'false'
    form?: string
    multiple?: boolean | 'true' | 'false'
    name?: string
    required?: boolean | 'true' | 'false'
    size?: number | string

    onchange?: EventListener<GenericEvent<HTMLSelectElement>>
}
export interface SourceAttributes extends GlobalAttributes<HTMLSourceElement> {
    src?: string
    type?: string
}
export interface TdAttributes extends GlobalAttributes<HTMLTableCellElement> {
    colspan?: number | string
    headers?: string
    rowspan?: number | string
}
export interface TextareaAttributes extends GlobalAttributes<HTMLTextAreaElement> {
    autocomplete?: 'on' | 'off'
    autofocus?: boolean | 'true' | 'false'
    cols?: number | string
    disabled?: boolean | 'true' | 'false'
    form?: string
    maxlength?: number | string
    minlength?: number | string
    name?: string
    placeholder?: string
    required?: boolean | 'true' | 'false'
    rows?: number | string
    selectionDirection?: string
    selectionEnd?: number | string
    selectionStart?: number | string
    value?: string
    wrap?: 'soft' | 'hard'

    onchange?: EventListener<GenericEvent<HTMLTextAreaElement>>
    oninput?: EventListener<GenericEvent<HTMLTextAreaElement>>
}
export interface ThAttributes extends GlobalAttributes<HTMLTableHeaderCellElement> {
    colspan?: number | string
    headers?: string
    rowspan?: number | string
    scope?: 'row' | 'col' | 'rowgroup' | 'colgroup' | 'auto'
}
export interface TimeAttributes extends GlobalAttributes<HTMLElement> {
    datetime?: string
}
export interface TrackAttributes extends GlobalAttributes<HTMLTrackElement> {
    default?: boolean | 'true' | 'false'
    kind?: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata'
    label?: string
    src?: string
    srclang?: string
}
export interface VideoAttributes extends GlobalAttributes<HTMLVideoElement> {
    autoplay?: boolean | 'true' | 'false'
    buffered?: any
    controls?: boolean | 'true' | 'false'
    crossorigin?: 'anonymous' | 'use-credentials'
    height?: number | string
    loop?: boolean | 'true' | 'false'
    muted?: boolean | 'true' | 'false'
    played?: any
    preload?: 'none' | 'metadata' | 'auto' | ''
    poster?: string
    src?: string
    width?: number | string
}

// TODO: explicit attributes
export interface SvgAttributes {
    [name: string]: any
}
