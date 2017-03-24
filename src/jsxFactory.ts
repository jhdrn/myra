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
                        _: 1,
                        value: child as any as string
                    } as TextVNode)
                }
                else {
                    flattenedChildren.push(c)
                }
            }
        }
        else if (typeof child !== 'undefined') {
            if (typeof (child as VNode)._ !== 'undefined') {
                flattenedChildren.push(child as VNode)
            }
            else {
                flattenedChildren.push({
                    _: 1,
                    value: child as any as string
                } as TextVNode)
            }
        }
    }

    return flattenedChildren as VNode[]
}

/**
 * Creates a JSX.Element/VNode from a JSX tag.
 */
export function createElement<T>(
    tagNameOrComponent: string | ComponentFactory<T>,
    props: T,
    ...children: (string | VNode)[]): JSX.Element {

    if (tagNameOrComponent === 'nothing') {
        return { _: 0 }
    }

    if (props === null) {
        props = {} as T
    }

    if (typeof tagNameOrComponent === 'string') {

        return {
            _: 2,
            tagName: tagNameOrComponent,
            props: props,
            children: flattenChildren(children)
        }
    }

    return tagNameOrComponent(props, children as VNode[])
}
