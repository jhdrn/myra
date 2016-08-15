/// <reference path="../core/contract-global.d.ts" />

declare namespace JSX {
    export interface Element extends myra.core.contract.ElementNodeDescriptor {
    }
    export interface IntrinsicElements {
        mount: { 
            component: myra.core.contract.Component
            args?: any 
        }
        [element: string]: myra.core.contract.ElementAttributeMap
    }
    export interface ElementAttributesProperty { props: {} } 
}
