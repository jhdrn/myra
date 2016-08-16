/// <reference path="../core/contract-global.d.ts" />

type GlobalAttributes = myra.core.contract.GlobalAttributes
declare namespace JSX {
    
    export interface Element extends myra.core.contract.ElementNodeDescriptor {
    }
    export interface IntrinsicElements {
        mount: { 
            component: myra.core.contract.Component
            args?: any 
        }
        nothing: never

        a: myra.core.contract.AAttributes
        attr: GlobalAttributes
        address: GlobalAttributes
        area: myra.core.contract.AreaAttributes
        article: GlobalAttributes
        aside: GlobalAttributes
        audio: myra.core.contract.AudioAttributes

        b: GlobalAttributes
        bdi: GlobalAttributes
        bdo: GlobalAttributes
        blockquote: GlobalAttributes
        br: GlobalAttributes
        button: myra.core.contract.ButtonAttributes

        canvas: myra.core.contract.CanvasAttributes
        caption: GlobalAttributes
        cite: GlobalAttributes
        code: GlobalAttributes
        col: myra.core.contract.ColAttributes
        colgroup: myra.core.contract.ColGroupAttributes
        
        data: GlobalAttributes
        datalist: GlobalAttributes
        dd: GlobalAttributes
        del: myra.core.contract.DelAttributes
        details: myra.core.contract.DetailsAttributes
        dfn: GlobalAttributes
        div: GlobalAttributes
        dl: GlobalAttributes
        dt: GlobalAttributes

        em: GlobalAttributes
        embed: myra.core.contract.EmbedAttributes

        fieldset: myra.core.contract.FieldsetAttributes
        figcaption: GlobalAttributes
        figure: GlobalAttributes
        footer: GlobalAttributes
        form: myra.core.contract.FormAttributes

        h1: GlobalAttributes
        h2: GlobalAttributes
        h3: GlobalAttributes
        h4: GlobalAttributes
        h5: GlobalAttributes
        h6: GlobalAttributes
        header: GlobalAttributes
        hr: GlobalAttributes

        i: GlobalAttributes
        iframe: myra.core.contract.IframeAttribute
        img: myra.core.contract.ImgAttributes
        input: myra.core.contract.InputAttributes
        ins: myra.core.contract.InsAttributes

        kbd: GlobalAttributes
        
        label: myra.core.contract.LabelAttributes
        legend: GlobalAttributes
        li: myra.core.contract.LiAttributes

        main: GlobalAttributes
        map: myra.core.contract.MapAttributes
        mark: GlobalAttributes
        meter: myra.core.contract.MeterAttributes

        nav: GlobalAttributes

        object: myra.core.contract.ObjectAttributes
        ol: GlobalAttributes
        optgroup: myra.core.contract.OptgroupAttributes
        option: myra.core.contract.OptionAttributes
        output: GlobalAttributes

        p: GlobalAttributes
        param: myra.core.contract.ParamAttributes
        pre: GlobalAttributes
        progress: myra.core.contract.ProgressAttributes

        q: myra.core.contract.QAttributes

        rp: GlobalAttributes
        rt: GlobalAttributes
        ruby: GlobalAttributes

        s: GlobalAttributes
        samp: GlobalAttributes
        section: GlobalAttributes
        select: myra.core.contract.SelectAttributes
        small: GlobalAttributes
        source: myra.core.contract.SourceAttributes
        span: GlobalAttributes
        strong: GlobalAttributes
        sub: GlobalAttributes
        summary: GlobalAttributes
        sup: GlobalAttributes

        table: GlobalAttributes
        tbody: GlobalAttributes
        td: myra.core.contract.TdAttributes
        textarea: myra.core.contract.TextareaAttributes
        tfoot: GlobalAttributes
        th: myra.core.contract.ThAttributes
        thead: GlobalAttributes
        time: myra.core.contract.TimeAttributes
        tr: GlobalAttributes
        track: myra.core.contract.TrackAttributes

        u: GlobalAttributes
        ul: GlobalAttributes

        var: GlobalAttributes
        video: myra.core.contract.VideoAttributes

        wbr: GlobalAttributes

    }
    export interface ElementAttributesProperty { props: {} } 
}
