/// <reference path="jsx-global.d.ts" />

import { GlobalAttributes, InitializeComponent, NodeDescriptor, ElementNodeDescriptor, TextNodeDescriptor, ComponentNodeDescriptor, NothingNodeDescriptor } from '../core/contract'
import { element, nothing } from './index'

export { ElementNodeDescriptor, TextNodeDescriptor, ComponentNodeDescriptor, NothingNodeDescriptor }

export function createElement(tagNameOrComponent: string | InitializeComponent, props: GlobalAttributes): NodeDescriptor {

    if (typeof tagNameOrComponent === 'string') {
        if (tagNameOrComponent === 'nothing') {
            return nothing()
        }

        return element(tagNameOrComponent)(props || undefined, ...Array.prototype.slice.call(arguments, 2) as NodeDescriptor[])
    }
    return tagNameOrComponent(props || undefined, props ? props['forceMount'] : undefined, Array.prototype.slice.call(arguments, 2))
}