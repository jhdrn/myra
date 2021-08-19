import { FragmentVNode, Key, MyraNode, NothingVNode, VNode, VNodeType } from './contract'

interface IProps {
    children?: MyraNode
    key?: Key
}

export function Fragment(props: IProps): FragmentVNode | NothingVNode {
    const children = props.children as VNode[] ?? []
    if (!children.length) {
        return {
            _: VNodeType.Nothing
        }
    }
    return {
        _: VNodeType.Fragment,
        props: {
            children,
            key: props.key
        }
    }
}