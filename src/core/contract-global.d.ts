
declare namespace myra.core.contract {

    type Map<T> = {
        [key: string]: T
    }

    /**
     * Component types
     */
    interface ComponentArgs<M, A> {
        name: string
        init: M | [M, Task | Task[]]
        mount?: Update<M, A>
        subscriptions?: { [type: string]: Update<M, any> }
        view: View<M>
    }

    interface Component {
        readonly name: string
        mount<A>(parentNode: Element, arg?: A): ComponentInstance<A>
    }

    interface ComponentInstance<T> {
        readonly name: string
        readonly id: number
        readonly rootNode: Node
        remount(arg?: T, forceMount?: boolean): void
    }

    /** "Component state holder" interface */
    interface ComponentContext<M, T> {
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
    interface Update<M, A> {
        (model: M, arg?: A): M | [M, Task | Task[]]
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
        (model: M): NodeDescriptor
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
    type FormElementEventAttributeArguments =  UpdateWithFormValidation | Task | FormElementListenerWithEventOptions
    
    interface FieldElementListenerWithEventOptions {
        listener: Task | UpdateWithFieldValidation
        preventDefault?: boolean
        stopPropagation?: boolean 
    }
    type UpdateWithFieldValidation = <M>(model: M, value: string, validationResult: FieldValidationResult) => M | [M, Task | Task[]]
    type FieldElementEventAttributeArguments =  UpdateWithFieldValidation | Task | FieldElementListenerWithEventOptions

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
        readonly component: Component
        componentInstance?: ComponentInstance<any>
        forceMount?: boolean
        args: any
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
        contenteditable?: boolean | ''
        contextmenu?: string
        dir?: 'ltr' | 'rtl' | 'auto'
        draggable?: boolean
        hidden?: boolean
        id?: string
        lang?: string
        spellcheck?: boolean | 'default'
        style?: string
        tabindex?: number
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
        autoplay?: boolean
        buffered?: any
        controls?: any
        loop?: boolean
        muted?: boolean
        played?: any
        preload?: '' | 'none' | 'metadata' | 'auto'
        src?: string
        volume?: number
    }
    interface ButtonAttributes extends GlobalAttributes {
        autofocus?: boolean
        disabled?: boolean
        form?: string
        formaction?: string
        formenctype?: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain'
        formmethod?: 'post' | 'get'
        formnovalidate?: boolean
        formtarget?: string
        name?: string
        type?: 'submit' | 'reset' | 'button'
        value?: string | number 
    }
    interface CanvasAttributes extends GlobalAttributes {
        height?: number
        width?: number
    }
    interface ColAttributes extends GlobalAttributes {
        span?: number
    }
    interface ColGroupAttributes extends GlobalAttributes {
        span?: number
    }
    interface DelAttributes extends GlobalAttributes {
        cite?: string
        datetime?: string
    }
    interface DetailsAttributes extends GlobalAttributes {
        open?: boolean
    }
    interface EmbedAttributes extends GlobalAttributes {
        height?: number
        src?: string
        type?: string
        width?: number
    }
    interface FieldsetAttributes extends GlobalAttributes {
        disabled?: boolean
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
        novalidate?: boolean
        target?: string
        
        onreset?: ElementEventAttributeArguments
        onsubmit?: FormElementEventAttributeArguments
        onchange?: FormElementEventAttributeArguments
        
        validators?: FormValidator | FormValidator[]
    }
    interface IframeAttributes extends GlobalAttributes {
        allowfullscreen?: boolean
        height?: number
        name?: string
        sandbox?: string
        src?: string
        srcdoc?: string
        width?: number
    }
    interface ImgAttributes extends GlobalAttributes {
        alt?: string
        crossorigin?: 'anonymous' | 'use-credentials'
        height?: number
        ismap?: boolean
        longdesc?: string
        sizes?: string
        src: string
        srcset?: string
        width?: number
        usemap?: string
    }
    interface InputAttributes extends GlobalAttributes {
        type?: 'button' | 'checkbox' | 'color' | 'date' | 'datetime' | 'datetime-local' | 'email' | 'file' | 'hidden' | 'image' | 'month' | 'number' | 'password' | 'radio' | 'range' | 'reset' | 'search' | 'submit' | 'tel' | 'text' | 'time' | 'url' | 'week'
        accept?: string
        autocomplete?: string
        autofocus?: boolean
        capture?: boolean
        checked?: boolean
        disabled?: boolean
        form?: string
        formaction?: string
        formenctype?: 'application/x-www-form-urlencoded' | 'multipart/form-data' | 'text/plain'
        formmethod?: 'post' | 'get'
        formnovalidate?: boolean
        formtarget?: string
        height?: number
        inputmode?: string
        list?: string
        max?: number | string
        maxlength?: number
        min?: number | string
        minlength?: number
        muliple?: boolean
        name?: string
        pattern?: string
        placeholder?: string
        readonly?: boolean
        required?: boolean
        selectionDirection?: string
        size?: number
        spellcheck?: boolean
        src?: string
        step?: number | string
        value?: string | number
        width?: number
        
        onchange?: FieldElementEventAttributeArguments
        oninput?: FieldElementEventAttributeArguments
        
        validators?: FieldValidator | FieldValidator[]
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
        value?: number
    }
    interface MapAttributes extends GlobalAttributes {
        name?: string
    }
    interface MeterAttributes extends GlobalAttributes {
        value?: number
        min?: number
        max?: number
        low?: number
        high?: number
        optimum?: number
        form?: string
    }
    interface ObjectAttributes extends GlobalAttributes {
        data?: string
        height?: number
        name?: string
        type?: string
        usemap?: string
        width?: number
    }
    interface OptgroupAttributes extends GlobalAttributes {
        disabled?: boolean
        label?: string
    }
    interface OptionAttributes extends GlobalAttributes {
        disabled?: boolean
        label?: string
        selected?: boolean
        value?: string | number
    }
    interface ParamAttributes extends GlobalAttributes {
        name?: string
        value?: string
    }
    interface ProgressAttributes extends GlobalAttributes {
        max?: number
        value?: number
    }
    interface QAttributes extends GlobalAttributes {
        cite?: string
    }
    interface SelectAttributes extends GlobalAttributes {
        autofocus?: boolean
        disabled?: boolean
        form?: string
        multiple?: boolean
        name?: string
        required?: boolean
        size?: number

        onchange?: FieldElementEventAttributeArguments
        
        validators?: FieldValidator | FieldValidator[]
    }
    interface SourceAttributes extends GlobalAttributes {
        src?: string
        type?: string
    }
    interface TdAttributes extends GlobalAttributes {
        colspan?: number
        headers?: string
        rowspan?: number
    }
    interface TextareaAttributes extends GlobalAttributes {
        autocomplete?: 'on' | 'off'
        autofocus?: boolean
        cols?: number
        disabled?: boolean
        form?: string
        maxlength?: number
        minlength?: number
        name?: string
        placeholder?: string
        required?: boolean
        selectionDirection?: string
        selectionEnd?: number
        selectionStart?: number
        wrap?: 'soft' | 'hard'

        onchange?: FieldElementEventAttributeArguments
        oninput?: FieldElementEventAttributeArguments

        validators?: FieldValidator | FieldValidator[]
    }
    interface ThAttributes extends GlobalAttributes {
        colspan?: number
        headers?: string
        rowspan?: number
        scope?: 'row' | 'col' | 'rowgroup' | 'colgroup' | 'auto'
    }
    interface TimeAttributes extends GlobalAttributes {
        datetime?: string
    }
    interface TrackAttributes extends GlobalAttributes {
        default?: boolean
        kind?: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata'
        label?: string
        src?: string
        srclang?: string
    }
    interface VideoAttributes extends GlobalAttributes {
        autoplay?: boolean
        buffered?: any
        controls?: boolean
        crossorigin?: 'anonymous' | 'use-credentials'
        height?: number
        loop?: boolean
        muted?: boolean
        played?: any
        preload?: 'none' | 'metadata' | 'auto' | ''
        poster?: string
        src?: string
        width?: number
    }
}
