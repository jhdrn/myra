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
    const flattenedChildren = [] as Array<VNode | TextNode>

    for (const child of children) {
        if (child === null || child === undefined || typeof child === 'boolean') {
            flattenedChildren.push({ _: VNodeType.Nothing })
        }
        else if (Array.isArray(child)) {
            for (const c of flattenChildren(child)) {
                flattenedChildren.push(c)
            }
        }
        else if ((child as VNode)._ === undefined) {
            // Any node which is not a vNode will be converted to a TextVNode
            flattenedChildren.push({
                _: VNodeType.Text,
                value: child as any as string
            } as TextVNode)
        }
        else {
            flattenedChildren.push(child)
        }
    }

    return flattenedChildren as VNode[]
}
