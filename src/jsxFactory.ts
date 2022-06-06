import {
    ComponentFactory,
    ComponentVNode,
    MyraNode,
    TextNode,
    TextVNode,
    VNode,
    VNodeType
} from './contract'
import { Fragment } from './fragment'

/**
 * Creates a JSX.Element/VNode from a JSX tag.
 */
export function h<TProps>(
    tagNameOrComponent: string | ComponentFactory<object> | undefined | null,
    props: TProps,
    ...children: Array<MyraNode>): JSX.Element {

    if (tagNameOrComponent === 'nothing' ||
        tagNameOrComponent === undefined ||
        tagNameOrComponent === null ||
        typeof tagNameOrComponent === 'boolean') {

        return { _: VNodeType.Nothing }
    }

    if (props === null) {
        props = {} as TProps
    }

    (props as any as { children: VNode[] }).children = flattenChildren(children)

    if (typeof tagNameOrComponent === 'string') {

        return {
            _: VNodeType.Element,
            tagName: tagNameOrComponent,
            props: props as any as { children: Array<VNode> }
        }
    } else if (tagNameOrComponent === Fragment) {
        return tagNameOrComponent(props as any) as VNode
    }

    const vNode = {
        _: VNodeType.Component,
        debounceRender: false,
        props,
        view: tagNameOrComponent
    } as any as ComponentVNode<any>

    vNode.link = {
        vNode
    }
    return vNode
}

function flattenChildren(children: MyraNode[]) {
    if (children.length === 0) {
        return children as VNode[]
    }

    const flattenedChildren = Array(children.length) as Array<VNode | TextNode>
    let childIndex = 0
    let targetIndex = 0
    while (true) {

        const child = children[childIndex++]
        if (child === null || child === undefined || typeof child === 'boolean') {
            flattenedChildren[targetIndex++] = { _: VNodeType.Nothing }
        }
        else if (Array.isArray(child)) {
            const subChildren = flattenChildren(child)
            if (subChildren.length === 0) {
                flattenedChildren.length--
            }
            else if (subChildren.length > 1) {
                flattenedChildren.length += subChildren.length - 1
                for (let j = 0; j < subChildren.length; j++) {
                    flattenedChildren[targetIndex++] = subChildren[j]
                }
            } else {
                flattenedChildren[targetIndex++] = subChildren[0]
            }
        }
        else if ((child as VNode)._ === undefined) {
            // Any node which is not a vNode will be converted to a TextVNode
            flattenedChildren[targetIndex++] = {
                _: VNodeType.Text,
                text: child as any as string
            } as TextVNode
        }
        else {
            flattenedChildren[targetIndex++] = child
        }

        if (childIndex == children.length) {
            return flattenedChildren as VNode[]
        }
    }
}
