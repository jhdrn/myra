
declare namespace myra {

    type Map<T> = {
        [key: string]: T
    }

    /**
     * Component types
     */
    interface ComponentSpec<S, A> {
        name: string
        init: Result<S>
        onAfterRender?: (rootNodeDescriptor: NodeDescriptor) => void
        onBeforeRender?: (rootNodeDescriptor: NodeDescriptor) => void
        onMount?: Update<S, A>
        subscriptions?: { [type: string]: Update<S, any> }
        view: View<S>
    }

    /** "Component state holder" interface */
    interface ComponentContext<S> {
        readonly args: ComponentSpec<S, any>
        readonly parentNode: Element
        mounted: boolean
        dispatchLevel: number
        isUpdating: boolean
        state: S | undefined
        rendition?: NodeDescriptor
        childNodes?: NodeDescriptor[]
    }

    interface ComponentFactory<T> {
        (props: T, forceMount?: boolean, children?: NodeDescriptor[]): ComponentDescriptor<T>
    }

    /**
     * Update/Dispatch types
     */
    interface Result<S> {
        readonly state: S
        readonly tasks?: Task[]
    }

    interface Update<S, A> {
        (state: S, arg?: A): Result<S>
    }
    interface UpdateAny extends Update<any, any> { }

    type Dispatch = <S, A>(fn: Update<S, A>, arg: A) => void

    interface Task {
        execute(dispatch: Dispatch): void
    }

    /**
     * View types
     */
    interface View<S> {
        (state: S, children?: NodeDescriptor[]): NodeDescriptor
    }

    interface AttributeMap { [name: string]: string }

    type EventListener<T, E> = <S, A>(event: T, element: E) => Update<S, A> | Task

    interface DescriptorBase {
        node?: Node
    }
    interface TextDescriptor extends DescriptorBase {
        readonly __type: 'text'
        readonly value: string
    }
    interface ElementDescriptor<E> extends DescriptorBase {
        readonly __type: 'element'
        readonly tagName: string
        readonly attributes: GlobalAttributes<E>
        readonly children: NodeDescriptor[]
    }
    interface ComponentDescriptor<T> extends DescriptorBase {
        readonly __type: 'component'
        readonly name: string
        id: number;
        forceMount: boolean
        children: NodeDescriptor[]
        rendition?: NodeDescriptor
        props: T
    }
    interface NothingDescriptor extends DescriptorBase {
        readonly __type: 'nothing'
    }
    type NodeDescriptor = TextDescriptor | ElementDescriptor<any> | ComponentDescriptor<any> | NothingDescriptor

    interface GlobalAttributes<E> {
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

        onblur?: EventListener<Event, E>
        onclick?: EventListener<MouseEvent, E>
        oncontextmenu?: EventListener<Event, E>
        ondblclick?: EventListener<MouseEvent, E>
        onfocus?: EventListener<FocusEvent, E>
        onkeydown?: EventListener<KeyboardEvent, E>
        onkeypress?: EventListener<KeyboardEvent, E>
        onkeyup?: EventListener<KeyboardEvent, E>
        onmousedown?: EventListener<MouseEvent, E>
        onmouseenter?: EventListener<MouseEvent, E>
        onmouseleave?: EventListener<MouseEvent, E>
        onmousemove?: EventListener<MouseEvent, E>
        onmouseout?: EventListener<MouseEvent, E>
        onmouseover?: EventListener<MouseEvent, E>
        onmouseup?: EventListener<MouseEvent, E>
        onshow?: EventListener<Event, E>

        [name: string]: any
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

    type GlobalAttributes<T> = myra.GlobalAttributes<T>

    export type Element = myra.NodeDescriptor
    // export interface Element extends myra.aElement {
    // }

    export interface ElementClass<T> {
        props: T
    }
    export interface ElementAttributesProperty<T> {
        props: T
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
