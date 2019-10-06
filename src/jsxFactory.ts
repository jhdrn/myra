import {
    ComponentFactory,
    ComponentVNode,
    MyraNode,
    TextNode,
    TextVNode,
    VNode,
    VNodeType,
    VNODE
} from './contract'

function flattenChildren(children: MyraNode[]) {
    const flattenedChildren = [] as Array<VNode | TextNode>

    for (const child of children) {
        if (child === null || child === undefined || typeof child === 'boolean') {
            flattenedChildren.push({ $: VNODE, _: VNodeType.Nothing })
        }
        else if (Array.isArray(child)) {
            for (const c of flattenChildren(child)) {
                flattenedChildren.push(c)
            }
        }
        else if ((child as VNode)._ === undefined) {
            // Any node which is not a vNode will be converted to a TextVNode
            flattenedChildren.push({
                $: VNODE,
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

        return { $: VNODE, _: VNodeType.Nothing }
    }

    if (props === null) {
        props = {} as TProps
    }

    (props as any as { children: VNode[] }).children = flattenChildren(children)

    if (typeof tagNameOrComponent === 'string') {

        return {
            $: VNODE,
            _: VNodeType.Element,
            tagName: tagNameOrComponent,
            props: props as any as { children: Array<VNode> }
        }
    }
    const vNode = {
        $: VNODE,
        _: VNodeType.Component,
        props,
        dispatchLevel: 0,
        view: tagNameOrComponent
    } as any as ComponentVNode<any>

    vNode.link = {
        vNode
    }
    return vNode
}
