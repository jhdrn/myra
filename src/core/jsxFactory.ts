import { ComponentFactory, NodeDescriptor, TextDescriptor } from './contract'
import { flatten } from './helpers'

function flattenChildren(children: ((NodeDescriptor | string)[] | NodeDescriptor | string)[]) {
    const flattenedChildren = [] as (NodeDescriptor | string)[]

    for (const child of children) {
        if (Array.isArray(child)) {
            for (const c of flatten(child as (NodeDescriptor | string)[])) {
                flattenedChildren.push(c)
            }
        }
        else if (typeof child === 'object') {
            if (typeof (child as NodeDescriptor).__type !== 'undefined') {
                flattenedChildren.push(child as NodeDescriptor)
            }
            else {
                flattenedChildren.push({
                    __type: 1,
                    value: child as any as string
                } as TextDescriptor)
            }
        }
        else if (typeof child !== 'undefined') {
            flattenedChildren.push({
                __type: 1,
                value: child
            } as TextDescriptor)
        }
    }

    return flattenedChildren as NodeDescriptor[]
}

export function createElement<T>(tagNameOrComponent: string | ComponentFactory<T>, props: T, ...children: (string | NodeDescriptor)[]): JSX.Element {
    if (tagNameOrComponent === 'nothing') {
        return { __type: 0 }
    }
    else if (typeof tagNameOrComponent === 'string') {
        if (tagNameOrComponent === 'text') {
            return {
                __type: 1,
                value: children[0] as string
            } as TextDescriptor
        }
        return {
            __type: 2,
            tagName: tagNameOrComponent,
            attributes: props || {},
            children: flattenChildren(children)
        }
    }
    return tagNameOrComponent(props || undefined, props ? (props as any)['forceMount'] : undefined, children as NodeDescriptor[])
}