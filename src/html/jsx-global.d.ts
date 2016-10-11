/// <reference path="../core/contract-global.d.ts" />

declare namespace myra {
    interface ComponentNodeDescriptor {
        (): ComponentNodeDescriptor
    }
}

type GlobalAttributes = myra.GlobalAttributes
declare namespace JSX {

    export interface Element extends myra.ElementNodeDescriptor {
    }
    interface ElementClass {
        <A>(mountArgs?: A, forceMount?: boolean): myra.ComponentNodeDescriptor
    }
    interface ElementAttributesProperty {
        props: any
    }
    // export interface ElementAttributesProperty { props: {} } 
    export interface IntrinsicElements {
        nothing: never

        a: myra.AAttributes
        attr: GlobalAttributes
        address: GlobalAttributes
        area: myra.AreaAttributes
        article: GlobalAttributes
        aside: GlobalAttributes
        audio: myra.AudioAttributes

        b: GlobalAttributes
        bdi: GlobalAttributes
        bdo: GlobalAttributes
        blockquote: GlobalAttributes
        br: GlobalAttributes
        button: myra.ButtonAttributes

        canvas: myra.CanvasAttributes
        caption: GlobalAttributes
        cite: GlobalAttributes
        code: GlobalAttributes
        col: myra.ColAttributes
        colgroup: myra.ColGroupAttributes

        data: GlobalAttributes
        datalist: GlobalAttributes
        dd: GlobalAttributes
        del: myra.DelAttributes
        details: myra.DetailsAttributes
        dfn: GlobalAttributes
        div: GlobalAttributes
        dl: GlobalAttributes
        dt: GlobalAttributes

        em: GlobalAttributes
        embed: myra.EmbedAttributes

        fieldset: myra.FieldsetAttributes
        figcaption: GlobalAttributes
        figure: GlobalAttributes
        footer: GlobalAttributes
        form: myra.FormAttributes

        h1: GlobalAttributes
        h2: GlobalAttributes
        h3: GlobalAttributes
        h4: GlobalAttributes
        h5: GlobalAttributes
        h6: GlobalAttributes
        header: GlobalAttributes
        hr: GlobalAttributes

        i: GlobalAttributes
        iframe: myra.IframeAttributes
        img: myra.ImgAttributes
        input: myra.InputAttributes
        ins: myra.InsAttributes

        kbd: GlobalAttributes

        label: myra.LabelAttributes
        legend: GlobalAttributes
        li: myra.LiAttributes

        main: GlobalAttributes
        map: myra.MapAttributes
        mark: GlobalAttributes
        meter: myra.MeterAttributes

        nav: GlobalAttributes

        object: myra.ObjectAttributes
        ol: GlobalAttributes
        optgroup: myra.OptgroupAttributes
        option: myra.OptionAttributes
        output: GlobalAttributes

        p: GlobalAttributes
        param: myra.ParamAttributes
        pre: GlobalAttributes
        progress: myra.ProgressAttributes

        q: myra.QAttributes

        rp: GlobalAttributes
        rt: GlobalAttributes
        ruby: GlobalAttributes

        s: GlobalAttributes
        samp: GlobalAttributes
        section: GlobalAttributes
        select: myra.SelectAttributes
        small: GlobalAttributes
        source: myra.SourceAttributes
        span: GlobalAttributes
        strong: GlobalAttributes
        sub: GlobalAttributes
        summary: GlobalAttributes
        sup: GlobalAttributes

        table: GlobalAttributes
        tbody: GlobalAttributes
        td: myra.TdAttributes
        textarea: myra.TextareaAttributes
        tfoot: GlobalAttributes
        th: myra.ThAttributes
        thead: GlobalAttributes
        time: myra.TimeAttributes
        tr: GlobalAttributes
        track: myra.TrackAttributes

        u: GlobalAttributes
        ul: GlobalAttributes

        var: GlobalAttributes
        video: myra.VideoAttributes

        wbr: GlobalAttributes

    }
}
