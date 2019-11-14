import { getRenderingContext, renderComponent, tryHandleComponentError } from "./component"
import { ComponentVNode, Effect, ErrorHandler, Evolve, Ref, UpdateState } from "./contract"
import { equal, typeOf } from "./helpers"

/**
 * 
 * @param initialState the initial state 
 */
export function useState<TState>(initialState: TState): [TState, Evolve<TState>] {

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

                const updateType = typeOf(update)
                // Shallow merge the old state with the updated state if it is an
                // object, else just replace it.
                if (updateType === 'object') {
                    currentVNode.data![hookIndex] = [{
                        ...(currentVNode.data![hookIndex][0] as any),
                        ...(update as object)
                    }, evolve]
                }
                else {
                    currentVNode.data![hookIndex] = [update, evolve]
                }

                if (!currentVNode.rendering) {
                    requestAnimationFrame(() => {
                        renderComponent(parentElement, link.vNode, undefined, isSvg)
                    })
                }
            } catch (err) {
                requestAnimationFrame(() => {
                    tryHandleComponentError(parentElement, currentVNode, isSvg, err)
                })
            }
            return currentVNode.data![hookIndex][0]
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
        const link = vNode.link
        vNode.data[hookIndex] = {
            current,
            get node() {
                return link.vNode.domRef
            }
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
export function useLayoutEffect<TArg>(effect: Effect<TArg>, arg?: TArg) {
    useEffectInternal(true, effect, arg)
}

/**
 * 
 * @param effect 
 * @param arg 
 */
export function useEffect<TArg>(effect: Effect<TArg>, arg?: TArg) {
    useEffectInternal(false, effect, arg)
}

function useEffectInternal<TArg>(sync: boolean, effect: Effect<TArg>, arg?: TArg) {

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
        if (t.cleanup !== undefined) {
            t.cleanup()
            t.cleanup = undefined
        }
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
