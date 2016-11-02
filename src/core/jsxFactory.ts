import { ComponentFactory, NodeDescriptor, TextDescriptor } from './contract'
import { flatten } from './helpers'

function textDescriptor(value: string): TextDescriptor {
    return {
        __type: 'text',
        value
    }
}

function flattenChildren(children: ((NodeDescriptor | string)[] | NodeDescriptor | string)[]) {
    const flattenedChildren = [] as (NodeDescriptor | string)[]

    for (let i = 0; i < children.length; i++) {
        if (Array.isArray(children[i])) {
            flatten(children[i] as (NodeDescriptor | string)[])
                .forEach(c => flattenedChildren.push(c))
        }
        else if (typeof children[i] === 'object') {
            if ((children[i] as NodeDescriptor).__type) {
                flattenedChildren.push(children[i] as NodeDescriptor)
            }
            else {
                flattenedChildren.push(textDescriptor(children[i] as string))
            }
        }
        else {
            flattenedChildren.push(children[i] as NodeDescriptor)
        }
    }

    return flattenedChildren.filter(c => typeof c !== 'undefined').map(c => {
        if (typeof c !== 'object' || Array.isArray(c) || typeof c === 'object' && !(c as NodeDescriptor).__type) {
            return textDescriptor(c as string)
        }
        return c as NodeDescriptor
    })
}

export function createElement<T>(tagNameOrComponent: string | ComponentFactory<T>, props: T): JSX.Element {
    if (tagNameOrComponent === 'nothing') {
        return { __type: 'nothing' }
    }
    else if (typeof tagNameOrComponent === 'string') {
        const children = Array.prototype.slice.call(arguments, 2)
        if (tagNameOrComponent === 'text') {
            return textDescriptor(children[0])
        }
        return {
            __type: 'element',
            tagName: tagNameOrComponent,
            attributes: props || {},
            children: flattenChildren(children)
        }
    }
    return tagNameOrComponent(props || undefined, props ? (props as any)['forceMount'] : undefined, Array.prototype.slice.call(arguments, 2))
}