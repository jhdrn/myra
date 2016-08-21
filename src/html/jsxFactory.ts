/// <reference path="jsx-global.d.ts" />

import { GlobalAttributes, NodeDescriptor, ElementNodeDescriptor, TextNodeDescriptor, ComponentNodeDescriptor, NothingNodeDescriptor } from '../core/contract'
import { component, element, nothing, text } from './index'
import { flatten } from '../core/helpers'

export { ElementNodeDescriptor, TextNodeDescriptor, ComponentNodeDescriptor, NothingNodeDescriptor }

export function createElement(tagNameOrComponent: string, props: GlobalAttributes): NodeDescriptor {

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
                flatten<NodeDescriptor>(arguments[i]).forEach(c => children.push(c))
            }
            else if (typeof arguments[i] === 'object') {
                if ((arguments[i] as NodeDescriptor).__type) {
                    children.push(arguments[i] as NodeDescriptor)
                }
                else {
                    children.push(text(arguments[i]))    
                }
            }
            else {
                children.push(text(arguments[i])) 
            }
        }

        return element(tagNameOrComponent)(props || undefined, ...children as NodeDescriptor[])
    }
    throw 'Does only support strings'    
}