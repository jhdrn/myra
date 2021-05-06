import { ComponentProps } from "./contract"
import { memo } from "./memo"

interface IContextProviderProps<TValue> {
    value: TValue
}

export function createContext<T>() {
    return {
        Provider: memo((props: IContextProviderProps<T> & ComponentProps) => {
            return props.children
        })
    }
}