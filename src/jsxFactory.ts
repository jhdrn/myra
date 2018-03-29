import { ComponentFactory, VNode, TextVNode } from './contract'
import { getArray, getObj, releaseArray } from './objectPool'

function flattenChildren(children: ((VNode | string)[] | VNode | string)[]) {
    const flattenedChildren = getArray<VNode | string>()

    for (const child of children) {
        if (child === null || child === undefined || typeof child === 'boolean') {

            const obj = getObj<any>()
            obj._ = 0
            flattenedChildren.push(obj)
        }
        else if (Array.isArray(child)) {
            for (const c of flattenChildren(child)) {
                flattenedChildren.push(c)
            }
        }
        else if ((child as VNode)._ === undefined) {

            // Any node which is not a vNode will be converted to a TextVNode

            const obj = getObj<any>()
            obj._ = 1
            obj.value = child
            flattenedChildren.push(obj as TextVNode)
        }
        else {
            flattenedChildren.push(child)
        }
    }

    releaseArray(children)

    return flattenedChildren as VNode[]
}

/**
 * Creates a JSX.Element/VNode from a JSX tag.
 */
export function h<TState, TProps>(
    tagNameOrComponent: string | ComponentFactory<TState, TProps>,
    props: TProps,
    ...children: (string | VNode)[]): JSX.Element {

    if (tagNameOrComponent === 'nothing') {
        const obj = getObj<any>()
        obj._ = 0
        return obj
    }

    if (props === null) {
        props = getObj<TProps>()
    }

    if (typeof tagNameOrComponent === 'string') {

        const obj = getObj<any>()
        obj._ = 2
        obj.tagName = tagNameOrComponent
        obj.props = props
        obj.children = flattenChildren(children)

        return obj
    }

    return tagNameOrComponent(props, children as VNode[])
}
