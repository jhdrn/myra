import { getRenderingContext } from './component'
import { ComponentProps, Context, ContextBinding, ProviderProps, VNode } from './contract'
import { Fragment } from './fragment'
import { useLayoutEffect, useRef } from './hooks'

export function registerContextBinding<T>(context: Context<T>, binding: ContextBinding<T>): void {
    const rc = getRenderingContext()!
    if (rc.renderNode.contextBindings === undefined) {
        rc.renderNode.contextBindings = new Map()
    }
    rc.renderNode.contextBindings.set(context, binding)
}

export function createContext<T>(defaultValue: T): Context<T> {
    const context: { _defaultValue: T, Provider?: (props: ProviderProps<T> & ComponentProps) => VNode } = {
        _defaultValue: defaultValue
    }

    const Provider = (props: ProviderProps<T> & ComponentProps): VNode => {
        const valueRef = useRef<T>(props.value)
        const subscribersRef = useRef(new Set<() => void>())
        const bindingRef = useRef<ContextBinding<T>>({
            getValue: () => valueRef.current,
            subscribe: (cb: () => void) => {
                subscribersRef.current.add(cb)
                return () => subscribersRef.current.delete(cb)
            }
        })

        // Update synchronously so getValue() is never stale when consumers read
        // it during the same render pass (before the layout effect fires).
        valueRef.current = props.value

        useLayoutEffect(() => {
            subscribersRef.current.forEach(cb => cb())
        }, [props.value])

        registerContextBinding(context as Context<T>, bindingRef.current)

        return Fragment({ children: props.children })
    }

    context.Provider = Provider

    return context as Context<T>
}
