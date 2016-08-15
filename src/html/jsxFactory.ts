/// <reference path="jsx-global.d.ts" />

import { ElementAttributeMap, NodeDescriptor, ElementNodeDescriptor, TextNodeDescriptor, ComponentNodeDescriptor, NothingNodeDescriptor } from '../core/contract'
import { component, element, nothing, text } from './index'

export { ElementNodeDescriptor, TextNodeDescriptor, ComponentNodeDescriptor, NothingNodeDescriptor }

export function createElement(tagNameOrComponent: string, props: ElementAttributeMap): NodeDescriptor {

    if (typeof tagNameOrComponent === 'string') {
        if (tagNameOrComponent === 'nothing') {
            return nothing()
        }
        else if (tagNameOrComponent === 'mount') {
            return component(props['component'], props['args'])
        }

        const children: NodeDescriptor[] = []

        for (let i = 2; i < arguments.length; i++) {
            if (Array.isArray(arguments[i])) {
                (arguments[i] as NodeDescriptor[]).forEach(c => children.push(c))
            }
            else if (typeof arguments[i] === 'object') {
                children.push(arguments[i] as NodeDescriptor)
            }
            else {
                children.push(text(arguments[i])) 
            }
        }

        return element(tagNameOrComponent)(props || undefined, ...children as NodeDescriptor[])
    }
    throw 'Does only support strings'    
}