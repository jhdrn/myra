import { getRenderingContext } from "./component"
import { ComponentFactory, ComponentProps, JSXElementFactory, VNode, VNodeType } from "./contract"
import { useRef } from "./hooks"

type CompareFn<TProps> = (newProps: TProps, oldProps: TProps) => boolean

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
export function memo<TProps>(factory: ComponentFactory<TProps & ComponentProps>, compare?: CompareFn<TProps>): JSXElementFactory<TProps & ComponentProps> {

    compare = compare ?? shallowCompareProps as CompareFn<TProps>

    return (props: TProps) => {

        const ref = useRef<TProps>({} as TProps)
        const oldProps = ref.current

        ref.current = props

        const renderingContext = getRenderingContext()!

        if (renderingContext.oldVNode === undefined || !compare!(props, oldProps)) {
            return factory(props as TProps & ComponentProps) as VNode
        }

        renderingContext!.memo = true

        return {
            _: VNodeType.Nothing
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
function shallowCompareProps<TProps extends ComponentProps & Record<string, unknown>>(newProps: TProps, oldProps: TProps): boolean {
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
