import { ComponentFactory, NodeDescriptor, TextDescriptor } from './contract'
import { flatten } from './helpers'

function notUndefined(x: any) {
    return typeof x !== 'undefined'
}

function toDescriptor(c: string | NodeDescriptor) {
    if (typeof c !== 'object' || Array.isArray(c) || typeof c === 'object' && typeof (c as NodeDescriptor).__type === 'undefined') {
        return {
            __type: 'text',
            value: c
        } as TextDescriptor
    }
    return c as NodeDescriptor
}

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
                    __type: 'text',
                    value: child as any as string
                } as TextDescriptor)
            }
        }
        else {
            flattenedChildren.push(child as any as NodeDescriptor)
        }
    }

    return flattenedChildren.filter(notUndefined).map(toDescriptor)
}

export function createElement<T>(tagNameOrComponent: string | ComponentFactory<T>, props: T, ...children: (string | NodeDescriptor)[]): JSX.Element {
    if (tagNameOrComponent === 'nothing') {
        return { __type: 'nothing' }
    }
    else if (typeof tagNameOrComponent === 'string') {
        if (tagNameOrComponent === 'text') {
            return {
                __type: 'text',
                value: children[0] as string
            } as TextDescriptor
        }
        return {
            __type: 'element',
            tagName: tagNameOrComponent,
            attributes: props || {},
            children: flattenChildren(children)
        }
    }
    return tagNameOrComponent(props || undefined, props ? (props as any)['forceMount'] : undefined, children as NodeDescriptor[])
}