/// <reference path="jsx-global.d.ts" />

import { GlobalAttributes, NodeDescriptor, ElementNodeDescriptor, TextNodeDescriptor, ComponentNodeDescriptor, NothingNodeDescriptor } from '../core/contract'
import { component, element, nothing } from './index'

export { ElementNodeDescriptor, TextNodeDescriptor, ComponentNodeDescriptor, NothingNodeDescriptor }

export function createElement(tagNameOrComponent: string, props: GlobalAttributes): NodeDescriptor {

    if (typeof tagNameOrComponent === 'string') {
        if (tagNameOrComponent === 'nothing') {
            return nothing()
        }
        else if (tagNameOrComponent === 'mount') {
            return component(props['component'], props['args'])
        }

        return element(tagNameOrComponent)(props || undefined, ...Array.prototype.slice.call(arguments, 2) as NodeDescriptor[])
    }
    throw 'Does only support strings'    
}