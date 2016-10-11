
declare namespace myra {

    type Map<T> = {
        [key: string]: T
    }

    /**
     * Component types
     */
    interface ComponentArgs<M, A> {
        name: string
        init: UpdateResult<M>
        mount?: Update<M, A>
        subscriptions?: { [type: string]: Update<M, any> }
        view: View<M>
    }

    /** "Component state holder" interface */
    interface ComponentContext<M, T> {
        readonly name: string
        readonly view: View<M>
        readonly parentNode: Element
        mounted: boolean
        dispatchLevel: number
        isUpdating: boolean
        model: M | undefined
        rendition?: NodeDescriptor
        childNodes?: NodeDescriptor[]
    }

    type InitializeComponent = <A>(mountArgs?: A, forceMount?: boolean, children?: NodeDescriptor[]) => ComponentNodeDescriptor

    /**
     * Update/Dispatch types
     */
    interface UpdateResult<M> {
        readonly model: M
        readonly tasks: Task[]
    }

    interface Update<M, A> {
        (model: M, arg?: A): UpdateResult<M>
    }
    interface UpdateAny extends Update<any, any> { }

    type Dispatch = <M, A>(fn: Update<M, A>, arg: A) => void

    interface Task {
        execute(dispatch: Dispatch): void
    }

    /**
     * View types
     */
    interface View<M> {
        (model: M, children?: NodeDescriptor[]): NodeDescriptor
    }

    interface AttributeMap { [name: string]: string }
    interface ListenerWithEventOptions {
        listener: Task | UpdateAny
        preventDefault?: boolean
        stopPropagation?: boolean
    }
    type ElementEventAttributeArguments = UpdateAny | Task | ListenerWithEventOptions

    interface FormElementListenerWithEventOptions {
        listener: Task | UpdateWithFormValidation
        preventDefault?: boolean
        stopPropagation?: boolean
    }
    type UpdateWithFormValidation = <M>(model: M, formData: Map<string>, formValidationResult: FormValidationResult) => M | [M, Task | Task[]]
    type FormElementEventAttributeArguments = UpdateWithFormValidation | Task | FormElementListenerWithEventOptions

    interface FieldElementListenerWithEventOptions {
        listener: Task | UpdateWithFieldValidation
        preventDefault?: boolean
        stopPropagation?: boolean
    }
    type UpdateWithFieldValidation = <M>(model: M, value: string, validationResult: FieldValidationResult) => M | [M, Task | Task[]]
    type FieldElementEventAttributeArguments = UpdateWithFieldValidation | Task | FieldElementListenerWithEventOptions

    interface NodeDescriptorBase {
        node?: Node
    }
    interface TextNodeDescriptor extends NodeDescriptorBase {
        readonly __type: 'text'
        readonly value: string
    }
    interface ElementNodeDescriptor extends NodeDescriptorBase {
        readonly __type: 'element'
        readonly tagName: string
        readonly attributes: GlobalAttributes
        readonly children: NodeDescriptor[]
    }
    interface ComponentNodeDescriptor extends NodeDescriptorBase {
        readonly __type: 'component'
        readonly name: string
        id: number;
        forceMount: boolean
        children: NodeDescriptor[]
        rendition?: NodeDescriptor
        props?: any
    }
    interface NothingNodeDescriptor extends NodeDescriptorBase {
        readonly __type: 'nothing'
    }
    type NodeDescriptor = TextNodeDescriptor | ElementNodeDescriptor | ComponentNodeDescriptor | NothingNodeDescriptor

    type FieldValidationResult = {
        readonly valid: boolean
        readonly errors: string[]
    }
    type FormValidationResult = {
        readonly valid: boolean
        readonly errors: string[]
        readonly fields: { [name: string]: FieldValidationResult }
    }
    type FieldValidator = (value: string) => FieldValidationResult
    type FormValidator = (value: Map<string>) => FormValidationResult

    interface GlobalAttributes {
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

        onblur?: ElementEventAttributeArguments
        onclick?: ElementEventAttributeArguments
        oncontextmenu?: ElementEventAttributeArguments
        ondblclick?: ElementEventAttributeArguments
        onfocus?: ElementEventAttributeArguments
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
        onshow?: ElementEventAttributeArguments

        [name: string]: any
    }

    interface AAttributes extends GlobalAttributes {
        download?: string
        href?: string
        hreflang?: string
        rel?: string
        target?: string
        type?: string
    }

    interface AreaAttributes extends GlobalAttributes {
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
    interface AudioAttributes extends GlobalAttributes {
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
    interface ButtonAttributes extends GlobalAttributes {
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
    interface CanvasAttributes extends GlobalAttributes {
        height?: number | string
        width?: number | string
    }
    interface ColAttributes extends GlobalAttributes {
        span?: number | string
    }
    interface ColGroupAttributes extends GlobalAttributes {
        span?: number | string
    }
    interface DelAttributes extends GlobalAttributes {
        cite?: string
        datetime?: string
    }
    interface DetailsAttributes extends GlobalAttributes {
        open?: boolean | 'true' | 'false'
    }
    interface EmbedAttributes extends GlobalAttributes {
        height?: number | string
        src?: string
        type?: string
        width?: number | string
    }
    interface FieldsetAttributes extends GlobalAttributes {
        disabled?: boolean | 'true' | 'false'
        form?: string
        name?: string
    }
    interface FormAttributes extends GlobalAttributes {
        accept?: string
        'accept-charset'?: string
        action?: string
        autocomplete?: 'on' | 'off'
        enctype?: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain'
        method?: 'post' | 'get'
        name?: string
        novalidate?: boolean | 'true' | 'false'
        target?: string

        onreset?: ElementEventAttributeArguments
        onsubmit?: FormElementEventAttributeArguments
        onchange?: FormElementEventAttributeArguments

        validate?: FormValidator | FormValidator[]
    }
    interface IframeAttributes extends GlobalAttributes {
        allowfullscreen?: boolean | 'true' | 'false'
        height?: number | string
        name?: string
        sandbox?: string
        src?: string
        srcdoc?: string
        width?: number | string
    }
    interface ImgAttributes extends GlobalAttributes {
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
    interface InputAttributes extends GlobalAttributes {
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

        onchange?: FieldElementEventAttributeArguments
        oninput?: FieldElementEventAttributeArguments

        validate?: FieldValidator | FieldValidator[]
    }
    interface InsAttributes extends GlobalAttributes {
        cite?: string
        datetime?: string
    }
    interface LabelAttributes extends GlobalAttributes {
        for?: string
        form?: string
    }
    interface LiAttributes extends GlobalAttributes {
        value?: number | string
    }
    interface MapAttributes extends GlobalAttributes {
        name?: string
    }
    interface MeterAttributes extends GlobalAttributes {
        value?: number | string
        min?: number | string
        max?: number | string
        low?: number | string
        high?: number | string
        optimum?: number | string
        form?: string
    }
    interface ObjectAttributes extends GlobalAttributes {
        data?: string
        height?: number | string
        name?: string
        type?: string
        usemap?: string
        width?: number | string
    }
    interface OptgroupAttributes extends GlobalAttributes {
        disabled?: boolean | 'true' | 'false'
        label?: string
    }
    interface OptionAttributes extends GlobalAttributes {
        disabled?: boolean | 'true' | 'false'
        label?: string
        selected?: boolean | 'true' | 'false'
        value?: string | number
    }
    interface ParamAttributes extends GlobalAttributes {
        name?: string
        value?: string
    }
    interface ProgressAttributes extends GlobalAttributes {
        max?: number | string
        value?: number | string
    }
    interface QAttributes extends GlobalAttributes {
        cite?: string
    }
    interface SelectAttributes extends GlobalAttributes {
        autofocus?: boolean | 'true' | 'false'
        disabled?: boolean | 'true' | 'false'
        form?: string
        multiple?: boolean | 'true' | 'false'
        name?: string
        required?: boolean | 'true' | 'false'
        size?: number | string

        onchange?: FieldElementEventAttributeArguments

        validate?: FieldValidator | FieldValidator[]
    }
    interface SourceAttributes extends GlobalAttributes {
        src?: string
        type?: string
    }
    interface TdAttributes extends GlobalAttributes {
        colspan?: number | string
        headers?: string
        rowspan?: number | string
    }
    interface TextareaAttributes extends GlobalAttributes {
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

        onchange?: FieldElementEventAttributeArguments
        oninput?: FieldElementEventAttributeArguments

        validate?: FieldValidator | FieldValidator[]
    }
    interface ThAttributes extends GlobalAttributes {
        colspan?: number | string
        headers?: string
        rowspan?: number | string
        scope?: 'row' | 'col' | 'rowgroup' | 'colgroup' | 'auto'
    }
    interface TimeAttributes extends GlobalAttributes {
        datetime?: string
    }
    interface TrackAttributes extends GlobalAttributes {
        default?: boolean | 'true' | 'false'
        kind?: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata'
        label?: string
        src?: string
        srclang?: string
    }
    interface VideoAttributes extends GlobalAttributes {
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
