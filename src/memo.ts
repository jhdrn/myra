import { ComponentFactory, ComponentProps, JSXElementFactory, VNodeType } from "./contract"

/**
 * Memoizes a component view, preventing unnecessary renders.
 * 
 * If no custom compare function is supplied, a shallow comparison of the props' 
 * properties will decide whether the component will be rerendered or not.
 * 
 * @param factory A component factory function
 * @param compare An optional props equality comparer function. If true is 
 *                returned the memoized view will be kept, otherwise the view 
 *                will be rerendered.
 */
export function memo<TProps>(factory: ComponentFactory<TProps & ComponentProps>, compare?: (newProps: TProps, oldProps: TProps) => boolean): JSXElementFactory<TProps & ComponentProps> {
    return (props: TProps) => {
        return {
            _: VNodeType.Memo,
            compare: compare || shallowCompareProps,
            view: factory,
            props
        }
    }
}

/**
 * Default compare implementation that performs a shallow comparison of props.
 * 
 * @param newProps 
 * @param oldProps 
 * @returns true if no changes are found
 */
function shallowCompareProps<TProps extends ComponentProps & Record<string, any>>(newProps: TProps, oldProps: TProps): boolean {
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
