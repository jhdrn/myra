
declare namespace myra {

    type Map<TValue> = {
        [key: string]: TValue
    }

    /**
     * Component types
     */
    interface ComponentSpec<TState, TProps extends {}> {
        readonly name: string
        readonly init: Result<TState>
        readonly onAfterRender?: (rootVNode: VNode, state: TState) => void
        readonly onBeforeRender?: (rootVNode: VNode, state: TState) => void
        readonly onMount?: Update<TState, TProps>
        readonly onUnmount?: Update<TState, undefined>
        readonly view: View<TState, TProps>
    }

    /** "Component state holder" interface */
    interface ComponentContext<TState, TProps extends {}> {
        readonly spec: ComponentSpec<TState, any>
        readonly parentNode: Element
        initialized: boolean
        dispatchLevel: number
        isUpdating: boolean
        props: TProps | undefined
        state: TState | undefined
        rendition?: VNode
        childNodes?: VNode[]
    }

    /**
     * Creates ComponentVNode's of a specific Component spec.
     */
    interface ComponentFactory<TProps extends {}> {
        (props: TProps, children?: VNode[]): ComponentVNode<TProps>
    }

    type Effect = (apply: Apply) => void

    /**
     * The result of an Update function.
     */
    type Result<TState> = [Partial<TState>] | [Partial<TState>, Effect | undefined]

    /**
     * Function that updates a component's state.
     */
    type Update<TState, TArg> = (state: TState, arg: TArg) => Result<TState>

    /**
     * Function that is used to apply an Update function.
     */
    type Apply = <TState, TArg>(fn: Update<TState, TArg>, arg?: TArg) => void

    /**
     * Holds data and functions used in a View.
     */
    interface ViewContext<TState, TProps> {
        readonly props: TProps
        readonly state: TState
        readonly apply: Apply
        readonly invoke: (effect: Effect) => void
        readonly children?: VNode[]
    }

    /**
     * Function that is responsible of creating a component's view.
     */
    interface View<TState, TProps> {
        (ctx: ViewContext<TState, TProps>): VNode
    }

    interface AttributeMap { [name: string]: string }

    /**
     * A function used as callback for event triggers.
     */
    type EventListener<TEvent extends Event, TElement extends Element> =
        (event: TEvent, element: TElement, descriptor: ElementVNode<TElement>) => void

    /**
     * Base interface for a virtual node.
     */
    interface VNodeBase {
        /**
         * A reference to a DOM node.
         */
        domRef?: Node
    }

    /**
     * A virtual node that represents a text DOM node. 
     */
    interface TextVNode extends VNodeBase {
        readonly __type: 1
        readonly value: string
    }

    /**
     * A virtual node representing a DOM Element. 
     */
    interface ElementVNode<TElement extends Element> extends VNodeBase {
        readonly __type: 2
        readonly tagName: string
        readonly props: GlobalAttributes<TElement>
        readonly children: VNode[]
        domRef?: TElement
    }

    /**
     * A virtual node representing a component.
     */
    interface ComponentVNode<TProps> extends VNodeBase {
        readonly __type: 3
        readonly name: string
        id: number;
        children: VNode[]
        rendition?: VNode
        props: TProps
    }

    /**
     * A virtual node representing nothing. Will be rendered as a comment DOM 
     * node.
     */
    interface NothingVNode extends VNodeBase {
        readonly __type: 0
    }

    /**
     * Union type of the different types of virtual nodes.
     */
    type VNode = TextVNode | ElementVNode<any> | ComponentVNode<any> | NothingVNode

    interface GlobalAttributes<TElement extends Element> {
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

        onblur?: EventListener<Event, TElement>
        onclick?: EventListener<MouseEvent, TElement>
        oncontextmenu?: EventListener<Event, TElement>
        ondblclick?: EventListener<MouseEvent, TElement>
        onfocus?: EventListener<FocusEvent, TElement>
        onkeydown?: EventListener<KeyboardEvent, TElement>
        onkeypress?: EventListener<KeyboardEvent, TElement>
        onkeyup?: EventListener<KeyboardEvent, TElement>
        onmousedown?: EventListener<MouseEvent, TElement>
        onmouseenter?: EventListener<MouseEvent, TElement>
        onmouseleave?: EventListener<MouseEvent, TElement>
        onmousemove?: EventListener<MouseEvent, TElement>
        onmouseout?: EventListener<MouseEvent, TElement>
        onmouseover?: EventListener<MouseEvent, TElement>
        onmouseup?: EventListener<MouseEvent, TElement>
        onshow?: EventListener<Event, TElement>

        // [name: string]: any
    }

    interface AAttributes extends GlobalAttributes<HTMLAnchorElement> {
        download?: string
        href?: string
        hreflang?: string
        rel?: string
        target?: string
        type?: string
    }

    interface AreaAttributes extends GlobalAttributes<HTMLAreaElement> {
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
    interface AudioAttributes extends GlobalAttributes<HTMLAudioElement> {
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
    interface ButtonAttributes extends GlobalAttributes<HTMLButtonElement> {
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
    interface CanvasAttributes extends GlobalAttributes<HTMLCanvasElement> {
        height?: number | string
        width?: number | string
    }
    interface ColAttributes extends GlobalAttributes<HTMLTableColElement> {
        span?: number | string
    }
    interface ColGroupAttributes extends GlobalAttributes<HTMLTableColElement> {
        span?: number | string
    }
    interface DelAttributes extends GlobalAttributes<HTMLElement> {
        cite?: string
        datetime?: string
    }
    interface DetailsAttributes extends GlobalAttributes<HTMLElement> {
        open?: boolean | 'true' | 'false'
    }
    interface EmbedAttributes extends GlobalAttributes<HTMLEmbedElement> {
        height?: number | string
        src?: string
        type?: string
        width?: number | string
    }
    interface FieldsetAttributes extends GlobalAttributes<HTMLFieldSetElement> {
        disabled?: boolean | 'true' | 'false'
        form?: string
        name?: string
    }
    interface FormAttributes extends GlobalAttributes<HTMLFormElement> {
        accept?: string
        'accept-charset'?: string
        action?: string
        autocomplete?: 'on' | 'off'
        enctype?: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain'
        method?: 'post' | 'get'
        name?: string
        novalidate?: boolean | 'true' | 'false'
        target?: string

        onreset?: EventListener<Event, HTMLFormElement>
        onsubmit?: EventListener<Event, HTMLFormElement>// FormElementEventAttributeArguments
        onchange?: EventListener<Event, HTMLFormElement>//FormElementEventAttributeArguments
    }
    interface IframeAttributes extends GlobalAttributes<HTMLIFrameElement> {
        allowfullscreen?: boolean | 'true' | 'false'
        height?: number | string
        name?: string
        sandbox?: string
        src?: string
        srcdoc?: string
        width?: number | string
    }
    interface ImgAttributes extends GlobalAttributes<HTMLImageElement> {
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
    interface InputAttributes extends GlobalAttributes<HTMLInputElement> {
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
        muliple?: boolean | 'true' | 'false'
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

        onchange?: EventListener<Event, HTMLInputElement>
        oninput?: EventListener<Event, HTMLInputElement>
    }
    interface InsAttributes extends GlobalAttributes<HTMLElement> {
        cite?: string
        datetime?: string
    }
    interface LabelAttributes extends GlobalAttributes<HTMLLabelElement> {
        for?: string
        form?: string
    }
    interface LiAttributes extends GlobalAttributes<HTMLLIElement> {
        value?: number | string
    }
    interface MapAttributes extends GlobalAttributes<HTMLMapElement> {
        name?: string
    }
    interface MeterAttributes extends GlobalAttributes<HTMLMeterElement> {
        value?: number | string
        min?: number | string
        max?: number | string
        low?: number | string
        high?: number | string
        optimum?: number | string
        form?: string
    }
    interface ObjectAttributes extends GlobalAttributes<HTMLObjectElement> {
        data?: string
        height?: number | string
        name?: string
        type?: string
        usemap?: string
        width?: number | string
    }
    interface OptgroupAttributes extends GlobalAttributes<HTMLOptGroupElement> {
        disabled?: boolean | 'true' | 'false'
        label?: string
    }
    interface OptionAttributes extends GlobalAttributes<HTMLOptionElement> {
        disabled?: boolean | 'true' | 'false'
        label?: string
        selected?: boolean | 'true' | 'false'
        value?: string | number
    }
    interface ParamAttributes extends GlobalAttributes<HTMLParamElement> {
        name?: string
        value?: string
    }
    interface ProgressAttributes extends GlobalAttributes<HTMLProgressElement> {
        max?: number | string
        value?: number | string
    }
    interface QAttributes extends GlobalAttributes<HTMLQuoteElement> {
        cite?: string
    }
    interface SelectAttributes extends GlobalAttributes<HTMLSelectElement> {
        autofocus?: boolean | 'true' | 'false'
        disabled?: boolean | 'true' | 'false'
        form?: string
        multiple?: boolean | 'true' | 'false'
        name?: string
        required?: boolean | 'true' | 'false'
        size?: number | string

        onchange?: EventListener<Event, HTMLSelectElement>
    }
    interface SourceAttributes extends GlobalAttributes<HTMLSourceElement> {
        src?: string
        type?: string
    }
    interface TdAttributes extends GlobalAttributes<HTMLTableCellElement> {
        colspan?: number | string
        headers?: string
        rowspan?: number | string
    }
    interface TextareaAttributes extends GlobalAttributes<HTMLTextAreaElement> {
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
        wrap?: 'soft' | 'hard'

        onchange?: EventListener<Event, HTMLTextAreaElement>
        oninput?: EventListener<Event, HTMLTextAreaElement>
    }
    interface ThAttributes extends GlobalAttributes<HTMLTableHeaderCellElement> {
        colspan?: number | string
        headers?: string
        rowspan?: number | string
        scope?: 'row' | 'col' | 'rowgroup' | 'colgroup' | 'auto'
    }
    interface TimeAttributes extends GlobalAttributes<HTMLElement> {
        datetime?: string
    }
    interface TrackAttributes extends GlobalAttributes<HTMLTrackElement> {
        default?: boolean | 'true' | 'false'
        kind?: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata'
        label?: string
        src?: string
        srclang?: string
    }
    interface VideoAttributes extends GlobalAttributes<HTMLVideoElement> {
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
}

declare namespace JSX {

    type GlobalAttributes<TElement extends HTMLElement> = myra.GlobalAttributes<TElement>

    export type Element = myra.VNode

    export interface ElementClass<TProps> {
        props: TProps
    }
    export interface ElementAttributesProperty<TProps> {
        props: TProps
    }
    export interface IntrinsicElements {
        nothing: never
        text: never

        a: myra.AAttributes
        attr: GlobalAttributes<HTMLElement>
        address: GlobalAttributes<HTMLElement>
        area: myra.AreaAttributes
        article: GlobalAttributes<HTMLElement>
        aside: GlobalAttributes<HTMLElement>
        audio: myra.AudioAttributes

        b: GlobalAttributes<HTMLElement>
        bdi: GlobalAttributes<HTMLElement>
        bdo: GlobalAttributes<HTMLElement>
        blockquote: GlobalAttributes<HTMLElement>
        br: GlobalAttributes<HTMLBRElement>
        button: myra.ButtonAttributes

        canvas: myra.CanvasAttributes
        caption: GlobalAttributes<HTMLTableCaptionElement>
        cite: GlobalAttributes<HTMLElement>
        code: GlobalAttributes<HTMLElement>
        col: myra.ColAttributes
        colgroup: myra.ColGroupAttributes

        data: GlobalAttributes<HTMLElement>
        datalist: GlobalAttributes<HTMLDataListElement>
        dd: GlobalAttributes<HTMLElement>
        del: myra.DelAttributes
        details: myra.DetailsAttributes
        dfn: GlobalAttributes<HTMLElement>
        div: GlobalAttributes<HTMLDivElement>
        dl: GlobalAttributes<HTMLDListElement>
        dt: GlobalAttributes<HTMLElement>

        em: GlobalAttributes<HTMLElement>
        embed: myra.EmbedAttributes

        fieldset: myra.FieldsetAttributes
        figcaption: GlobalAttributes<HTMLElement>
        figure: GlobalAttributes<HTMLElement>
        footer: GlobalAttributes<HTMLElement>
        form: myra.FormAttributes

        h1: GlobalAttributes<HTMLHeadingElement>
        h2: GlobalAttributes<HTMLHeadingElement>
        h3: GlobalAttributes<HTMLHeadingElement>
        h4: GlobalAttributes<HTMLHeadingElement>
        h5: GlobalAttributes<HTMLHeadingElement>
        h6: GlobalAttributes<HTMLHeadingElement>
        header: GlobalAttributes<HTMLElement>
        hr: GlobalAttributes<HTMLHRElement>

        i: GlobalAttributes<HTMLElement>
        iframe: myra.IframeAttributes
        img: myra.ImgAttributes
        input: myra.InputAttributes
        ins: myra.InsAttributes

        kbd: GlobalAttributes<HTMLElement>

        label: myra.LabelAttributes
        legend: GlobalAttributes<HTMLLegendElement>
        li: myra.LiAttributes

        main: GlobalAttributes<HTMLElement>
        map: myra.MapAttributes
        mark: GlobalAttributes<HTMLElement>
        meter: myra.MeterAttributes

        nav: GlobalAttributes<HTMLElement>

        object: myra.ObjectAttributes
        ol: GlobalAttributes<HTMLOListElement>
        optgroup: myra.OptgroupAttributes
        option: myra.OptionAttributes
        output: GlobalAttributes<HTMLElement>

        p: GlobalAttributes<HTMLParagraphElement>
        param: myra.ParamAttributes
        pre: GlobalAttributes<HTMLPreElement>
        progress: myra.ProgressAttributes

        q: myra.QAttributes

        rp: GlobalAttributes<HTMLElement>
        rt: GlobalAttributes<HTMLElement>
        ruby: GlobalAttributes<HTMLElement>

        s: GlobalAttributes<HTMLElement>
        samp: GlobalAttributes<HTMLElement>
        section: GlobalAttributes<HTMLElement>
        select: myra.SelectAttributes
        small: GlobalAttributes<HTMLElement>
        source: myra.SourceAttributes
        span: GlobalAttributes<HTMLElement>
        strong: GlobalAttributes<HTMLElement>
        sub: GlobalAttributes<HTMLElement>
        summary: GlobalAttributes<HTMLElement>
        sup: GlobalAttributes<HTMLElement>

        table: GlobalAttributes<HTMLTableElement>
        tbody: GlobalAttributes<HTMLTableSectionElement>
        td: myra.TdAttributes
        textarea: myra.TextareaAttributes
        tfoot: GlobalAttributes<HTMLTableSectionElement>
        th: myra.ThAttributes
        thead: GlobalAttributes<HTMLTableSectionElement>
        time: myra.TimeAttributes
        tr: GlobalAttributes<HTMLTableRowElement>
        track: myra.TrackAttributes

        u: GlobalAttributes<HTMLElement>
        ul: GlobalAttributes<HTMLUListElement>

        var: GlobalAttributes<HTMLElement>
        video: myra.VideoAttributes

        wbr: GlobalAttributes<HTMLElement>

    }
}
