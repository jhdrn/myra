import { FragmentVNode, VNode, VNodeType } from './contract'

export function Fragment(props: { children?: VNode[] }): FragmentVNode {
    return {
        _: VNodeType.Fragment,
        props: {
            children: props.children ?? []
        }
    }
}