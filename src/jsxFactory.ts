import { ComponentFactory, VNode, TextVNode, ComponentVNode } from './contract'
import { VNODE_NOTHING, VNODE_TEXT, VNODE_ELEMENT, VNODE_FUNCTION } from './constants'

function flattenChildren(children: ((VNode | string)[] | VNode | string)[]) {
    const flattenedChildren = [] as (VNode | string)[]

    for (const child of children) {
        if (child === null || child === undefined || typeof child === 'boolean') {
            flattenedChildren.push({ _: VNODE_NOTHING })
        }
        else if (Array.isArray(child)) {
            for (const c of flattenChildren(child)) {
                flattenedChildren.push(c)
            }
        }
        else if ((child as VNode)._ === undefined) {
            // Any node which is not a vNode will be converted to a TextVNode
            flattenedChildren.push({
                _: VNODE_TEXT,
                value: child as any as string
            } as TextVNode)
        }
        else {
            flattenedChildren.push(child)
        }
    }

    return flattenedChildren as VNode[]
}

/**
 * Creates a JSX.Element/VNode from a JSX tag.
 */
export function h<TProps extends object>(
    tagNameOrComponent: string | ComponentFactory<object> | undefined | null,
    props: TProps,
    ...children: (string | VNode)[]): JSX.Element {

    if (tagNameOrComponent === 'nothing' ||
        tagNameOrComponent === undefined ||
        tagNameOrComponent === null ||
        typeof tagNameOrComponent === 'boolean') {

        return { _: VNODE_NOTHING }
    }

    if (props === null) {
        props = {} as TProps
    }

    if (typeof tagNameOrComponent === 'string') {

        return {
            _: VNODE_ELEMENT,
            tagName: tagNameOrComponent,
            props: props,
            children: flattenChildren(children)
        }
    }
    return {
        _: VNODE_FUNCTION,
        props,
        children: flattenChildren(children),
        dispatchLevel: 0,
        tagNameOrComponent
    } as any as ComponentVNode<object>
}
