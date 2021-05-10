import { FragmentVNode, Key, VNode, VNodeType } from './contract'

interface IProps {
    children?: VNode[]
    key?: Key
}

export function Fragment(props: IProps): FragmentVNode {
    return {
        _: VNodeType.Fragment,
        props: {
            children: props.children ?? [],
            key: props.key
        }
    }
}