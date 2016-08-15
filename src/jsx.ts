import { typeOf } from './core/helpers'
import { Component, ElementAttributeMap, NodeDescriptor, ElementNodeDescriptor, TextNodeDescriptor, ComponentNodeDescriptor, NothingNodeDescriptor } from './core/index'
import { component, el, nothing, text } from './html'

export { ElementNodeDescriptor, TextNodeDescriptor, ComponentNodeDescriptor, NothingNodeDescriptor }

export declare module JSX {
    export interface Element {
        
    }
    export interface IntrinsicElements extends ElementAttributeMap {
    }
    export interface ElementAttributesProperty { props: {}; } 
}

export module jsxFactory {
    export const createElement = (tagNameOrComponent: string | Component | NothingNodeDescriptor, props: ElementAttributeMap, children: string | NodeDescriptor[]): NodeDescriptor => {
        const type = typeOf(children)

        if (typeof tagNameOrComponent === 'string') {
            if (type === 'string') {
                children = [text(children)] 
            }
            else if (type === 'object') {
                children = [children] as any as NodeDescriptor[]
            }

            return el(tagNameOrComponent, props || undefined, ...children as NodeDescriptor[])
        }
        else if ((tagNameOrComponent as NothingNodeDescriptor).__type === 'nothing') {
            return nothing()
        }
        else {
            return component(tagNameOrComponent as Component)
        }
    }
}