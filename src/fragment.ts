import { FragmentVNode, Key, MyraNode, NothingVNode, VNode, VNodeType } from './contract'

interface IProps {
    children?: MyraNode
    key?: Key
}

export function Fragment(props: IProps): FragmentVNode | NothingVNode {
    // Normalize children to always be an array
    let children: VNode[] = []
    if (props.children === undefined || props.children === null) {
        children = []
    } else if (Array.isArray(props.children)) {
        children = props.children as VNode[]
    } else {
        children = [props.children as VNode]
    }
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