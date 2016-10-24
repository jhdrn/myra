import { ComponentFactory, NodeDescriptor, TextDescriptor, GlobalAttributes } from '../core/contract'
import { flatten } from '../core/helpers'

function textDescriptor(value: string): TextDescriptor {
    return {
        __type: 'text',
        value
    }
}

function flattenChildren<A extends GlobalAttributes<any>>(attributesOrNode: A | (NodeDescriptor | string)[] | NodeDescriptor | string) {
    const attributesGiven = !Array.isArray(attributesOrNode) && typeof attributesOrNode === 'object' && !(attributesOrNode as NodeDescriptor).__type

    const flattenedChildren = [] as (NodeDescriptor | string)[]

    for (let i = 0; i < arguments.length; i++) {
        if (attributesGiven && i === 0) {
            continue
        }

        if (Array.isArray(arguments[i])) {
            flatten<NodeDescriptor>(arguments[i])
                .map(c => typeof c === 'object' && !(c as NodeDescriptor).__type ? textDescriptor(c as any) : c)
                .forEach(c => flattenedChildren.push(c))
        }
        else if (typeof arguments[i] === 'object') {
            if ((arguments[i] as NodeDescriptor).__type) {
                flattenedChildren.push(arguments[i] as NodeDescriptor)
            }
            else {
                flattenedChildren.push(textDescriptor(arguments[i]))
            }
        }
        else {
            flattenedChildren.push(arguments[i])
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

    if (typeof tagNameOrComponent === 'undefined') {
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
            children: (flattenChildren(children) || []) as NodeDescriptor[]
        }
    }
    return tagNameOrComponent(props || undefined, props ? (props as any)['forceMount'] : undefined, Array.prototype.slice.call(arguments, 2))
}