import { ComponentFactory, ComponentProps, JSXElementFactory, VNodeType } from "./contract"

function shallowCompareProps<TProps extends ComponentProps>(newProps: TProps, oldProps: TProps): boolean {
    const newPropsKeys = Object.keys(newProps)
    if (newPropsKeys.length !== Object.keys(oldProps).length) {
        return false
    }
    for (const k of newPropsKeys) {
        if (k === 'children') {
            continue
        }
        if (newProps[k] !== oldProps[k]) {
            return false
        }
    }
    return true
}

export function memo<TProps>(factory: ComponentFactory<TProps & ComponentProps>, compare?: (newProps: TProps, oldProps: TProps) => boolean): JSXElementFactory<TProps> {
    return (props: TProps) => {
        return {
            _: VNodeType.Memo,
            compare: compare || shallowCompareProps,
            view: factory,
            props
        }
    }
}