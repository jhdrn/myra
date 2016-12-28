import { ComponentFactory, VNode, TextVNode } from './contract'
import { flatten } from './helpers'

function flattenChildren(children: ((VNode | string)[] | VNode | string)[]) {
    const flattenedChildren = [] as (VNode | string)[]

    for (const child of children) {
        if (child === null) {
            continue
        }
        else if (Array.isArray(child)) {
            for (const c of flatten(child as (VNode | string)[])) {
                if (typeof c === 'string') {

                    flattenedChildren.push({
                        __type: 1,
                        value: child as any as string
                    } as TextVNode)
                }
                else {
                    flattenedChildren.push(c)
                }
            }
        }
        else if (typeof child === 'object') {
            if (typeof (child as VNode).__type !== 'undefined') {
                flattenedChildren.push(child as VNode)
            }
            else {
                flattenedChildren.push({
                    __type: 1,
                    value: child as any as string
                } as TextVNode)
            }
        }
        else if (typeof child !== 'undefined') {
            flattenedChildren.push({
                __type: 1,
                value: child
            } as TextVNode)
        }
    }

    return flattenedChildren as VNode[]
}

/**
 * Creates a JSX.Element/VNode from a JSX tag.
 */
export function createElement<T>(tagNameOrComponent: string | ComponentFactory<T>, props: T, ...children: (string | VNode)[]): JSX.Element {

    if (tagNameOrComponent === 'nothing') {
        return { __type: 0 }
    }
    else if (typeof tagNameOrComponent === 'string') {

        if (tagNameOrComponent === 'text') {
            return {
                __type: 1,
                value: children[0] as string
            } as TextVNode
        }

        if (props === null) {
            props = {} as T
        }

        return {
            __type: 2,
            tagName: tagNameOrComponent,
            props: props,
            children: flattenChildren(children)
        }
    }

    if (props === null) {
        props = {} as T
    }

    return tagNameOrComponent(props, children as VNode[])
}
