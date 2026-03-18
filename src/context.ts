import { getRenderingContext } from './component'
import { ComponentFactory, ComponentProps, Context, ContextBinding, MyraNode, ProviderProps } from './contract'
import { useLayoutEffect, useRef } from './hooks'

export function registerContextBinding<T>(context: Context<T>, binding: ContextBinding<T>): void {
    const rc = getRenderingContext()!
    if (rc.vNode.contextBindings === undefined) {
        rc.vNode.contextBindings = new Map()
    }
    rc.vNode.contextBindings.set(context, binding)
}

export function createContext<T>(defaultValue: T): Context<T> {
    const context: { _defaultValue: T, Provider?: ComponentFactory<ProviderProps<T>> } = {
        _defaultValue: defaultValue
    }

    const Provider = (props: ProviderProps<T> & ComponentProps): MyraNode => {
        const valueRef = useRef<T>(props.value)
        const subscribersRef = useRef(new Set<() => void>())

        useLayoutEffect(() => {
            valueRef.current = props.value
            subscribersRef.current.forEach(cb => cb())
        }, [props.value])

        registerContextBinding(context as Context<T>, {
            getValue: () => valueRef.current,
            subscribe: (cb: () => void) => {
                subscribersRef.current.add(cb)
                return () => subscribersRef.current.delete(cb)
            }
        })

        return props.children
    }

    context.Provider = Provider

    return context as Context<T>
}
