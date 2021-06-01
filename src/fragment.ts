import { FragmentVNode, Key, MyraNode, VNode, VNodeType } from './contract'

interface IProps {
    children?: MyraNode
    key?: Key
}

export function Fragment(props: IProps): FragmentVNode {
    return {
        _: VNodeType.Fragment,
        props: {
            children: props.children as VNode[] ?? [],
            key: props.key
        }
    }
}