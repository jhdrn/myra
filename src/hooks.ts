import { getRenderingContext, renderComponent, tryHandleComponentError } from "./component"
import { ComponentVNode, Effect, ErrorHandler, Evolve, Ref, UpdateState } from "./contract"
import { equal } from "./helpers"


type LazyStateInitialization<TState> = () => TState

/**
 * 
 * @param initialState the initial state 
 */
export function useState<TState>(initialState: TState | LazyStateInitialization<TState>): [TState, Evolve<TState>] {

    const renderingContext = getRenderingContext()
    const { hookIndex, isSvg, parentElement, vNode } = renderingContext!
    if (vNode.data === undefined) {
        vNode.data = []
    }

    if (vNode.data[hookIndex] === undefined) {

        const link = vNode.link

        const evolve = (update: UpdateState<any>) => {
            const currentVNode = link.vNode
            try {
                if (typeof update === 'function') {
                    update = update(currentVNode.data![hookIndex][0])
                }

                currentVNode.data![hookIndex] = [update, evolve]

                if (!currentVNode.debounceRender) {
                    requestAnimationFrame(() => {
                        link.vNode.debounceRender = false

                        renderComponent(
                            parentElement,
                            link.vNode,
                            undefined,
                            link.vNode.rendition,
                            isSvg
                        )
                    })
                }
                currentVNode.debounceRender = true
            } catch (err) {
                requestAnimationFrame(() => {
                    tryHandleComponentError(parentElement, currentVNode, isSvg, err as Error)
                })
            }
            return currentVNode.data![hookIndex][0]
        }

        if (typeof initialState === 'function') {
            initialState = (initialState as LazyStateInitialization<TState>)()
        }
        vNode.data[hookIndex] = [initialState, evolve]
    }

    const state = vNode.data[hookIndex]
    renderingContext!.hookIndex++

    return state
}

/**
 * 
 * @param current an optional value 
 */
export function useRef<T>(current?: T): Ref<T> {
    const renderingContext = getRenderingContext()
    const { hookIndex, vNode } = renderingContext!
    if (vNode.data === undefined) {
        vNode.data = []
    }

    if (vNode.data[hookIndex] === undefined) {
        vNode.data[hookIndex] = {
            current
        }
    }
    renderingContext!.hookIndex++
    return vNode.data[hookIndex]
}

/**
 * 
 * @param handler 
 */
export function useErrorHandler(handler: ErrorHandler) {
    const renderingContext = getRenderingContext()
    const vNode = renderingContext!.vNode as ComponentVNode<any>
    vNode.errorHandler = handler
}

/**
 * 
 * @param effect 
 * @param arg 
 */
export function useLayoutEffect<TArg extends unknown[]>(effect: Effect, arg?: TArg) {
    useEffectInternal(true, effect, arg)
}

/**
 * 
 * @param effect 
 * @param arg 
 */
export function useEffect<TArg extends unknown[]>(effect: Effect, arg?: TArg) {
    useEffectInternal(false, effect, arg)
}

function useEffectInternal<TArg>(sync: boolean, effect: Effect, arg?: TArg) {

    const renderingContext = getRenderingContext()
    const { hookIndex, vNode } = renderingContext!

    if (vNode.effects === undefined) {
        vNode.effects = []
    }

    const t = vNode.effects[hookIndex]

    if (t === undefined) {
        vNode.effects[hookIndex] = {
            arg,
            sync,
            invoke: true,
            effect,
        }
    } else if (arg === undefined || !equal(t.arg, arg)) {
        t.arg = arg
        t.effect = effect
        t.invoke = true
    }

    renderingContext!.hookIndex++
}

/**
 * 
 * @param fn 
 * @param inputs 
 */
export function useMemo<TMemoization, TArgs>(fn: (args: TArgs) => TMemoization, inputs: TArgs): TMemoization {

    const renderingContext = getRenderingContext()
    const { hookIndex, vNode } = renderingContext!

    if (vNode.data === undefined) {
        vNode.data = []
    }

    let res: TMemoization
    if (vNode.data[hookIndex] === undefined) {
        res = fn(inputs)
        vNode.data[hookIndex] = [res, inputs]
    }
    else {
        let [prevRes, prevInputs] = vNode.data[hookIndex]
        if (equal(prevInputs, inputs)) {
            res = prevRes
        }
        else {
            res = fn(inputs)
            vNode.data[hookIndex] = [res, inputs]
        }
    }

    renderingContext!.hookIndex++
    return res
}
