import { getRenderingContext, renderComponent, tryHandleComponentError } from './component'
import { ComponentProps, ComponentVNode, Context, ContextBinding, Effect, ErrorHandler, Evolve, Ref, UpdateState } from './contract'
import { equal } from './helpers'
import { ComponentLink, RenderNode } from './internal'


type LazyStateInitialization<TState> = () => TState

/**
 *
 * @param initialState the initial state
 */
export function useState<TState>(initialState: TState | LazyStateInitialization<TState>): [TState, Evolve<TState>] {

    const renderingContext = getRenderingContext()
    const { hookIndex, isSvg, parentElement, renderNode } = renderingContext!
    if (renderNode.data === undefined) {
        renderNode.data = []
    }

    if (renderNode.data[hookIndex] === undefined) {

        const link = renderNode.link!

        const evolve = (update: UpdateState<unknown>) => {
            const currentRenderNode = link.renderNode
            try {
                if (typeof update === 'function') {
                    update = update(currentRenderNode.data![hookIndex][0])
                }

                currentRenderNode.data![hookIndex] = [update, evolve]

                if (!currentRenderNode.debounceRender) {
                    setTimeout(() => {
                        link.renderNode.debounceRender = false

                        const vNode = link.renderNode.vNode
                        if (vNode !== undefined) {
                            renderComponent(
                                parentElement,
                                link.renderNode.vNode as ComponentVNode<ComponentProps>,
                                link.renderNode,
                                link.renderNode.rendition,
                                isSvg,
                                false  // state-change re-render: never allow memo skip
                            )
                        }
                    })
                }
                currentRenderNode.debounceRender = true
            } catch (err) {
                setTimeout(() => {
                    tryHandleComponentError(parentElement, currentRenderNode, isSvg, err as Error)
                })
            }
            return currentRenderNode.data![hookIndex][0]
        }

        if (typeof initialState === 'function') {
            initialState = (initialState as LazyStateInitialization<TState>)()
        }
        renderNode.data[hookIndex] = [initialState, evolve]
    }

    const state = renderNode.data[hookIndex]
    renderingContext!.hookIndex++

    return state
}

/**
 *
 * @param current an optional value
 */
export function useRef<T>(current?: T): Ref<T> {
    const renderingContext = getRenderingContext()
    const { hookIndex, renderNode } = renderingContext!
    if (renderNode.data === undefined) {
        renderNode.data = []
    }

    if (renderNode.data[hookIndex] === undefined) {
        renderNode.data[hookIndex] = {
            current
        }
    }
    renderingContext!.hookIndex++
    return renderNode.data[hookIndex]
}

/**
 *
 * @param handler
 */
export function useErrorHandler(handler: ErrorHandler) {
    const renderingContext = getRenderingContext()
    const renderNode = renderingContext!.renderNode as RenderNode
    renderNode.errorHandler = handler
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
    const { hookIndex, renderNode } = renderingContext!

    if (renderNode.effects === undefined) {
        renderNode.effects = []
    }

    const t = renderNode.effects[hookIndex]

    if (t === undefined) {
        renderNode.effects[hookIndex] = {
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
 * @param deps
 */
export function useMemo<TMemoization>(fn: () => TMemoization, deps: unknown[]): TMemoization {

    const renderingContext = getRenderingContext()
    const { hookIndex, renderNode } = renderingContext!

    if (renderNode.data === undefined) {
        renderNode.data = []
    }

    let res: TMemoization
    if (renderNode.data[hookIndex] === undefined) {
        res = fn()
        renderNode.data[hookIndex] = [res, deps]
    }
    else {
        const [prevRes, prevDeps] = renderNode.data[hookIndex]
        if (equal(prevDeps, deps)) {
            res = prevRes
        }
        else {
            res = fn()
            renderNode.data[hookIndex] = [res, deps]
        }
    }

    renderingContext!.hookIndex++
    return res
}

/**
 *
 * @param callback
 * @param deps
 */
// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function useCallback<TCallback extends Function>(callback: TCallback, deps: unknown[]): TCallback {
    return useMemo(() => callback, deps)
}

/**
 *
 * @param context
 */
export function useContext<T>(context: Context<T>): T {
    const rc = getRenderingContext()!
    const { hookIndex, isSvg, parentElement, renderNode } = rc

    if (renderNode.data === undefined) {
        renderNode.data = []
    }
    if (renderNode.effects === undefined) {
        renderNode.effects = []
    }

    const binding = findContextBinding(renderNode, context)

    type Stored = { binding: ContextBinding<T> | undefined, unsubscribe: (() => void) | undefined }
    let stored: Stored = renderNode.data[hookIndex]

    if (stored === undefined) {
        let unsubscribe: (() => void) | undefined
        if (binding !== undefined) {
            unsubscribe = binding.subscribe(makeReRenderCallback(renderNode.link!, parentElement, isSvg))
        }
        stored = { binding, unsubscribe }
        renderNode.data[hookIndex] = stored
    } else if (stored.binding !== binding) {
        if (stored.unsubscribe !== undefined) {
            stored.unsubscribe()
        }
        let unsubscribe: (() => void) | undefined
        if (binding !== undefined) {
            unsubscribe = binding.subscribe(makeReRenderCallback(renderNode.link!, parentElement, isSvg))
        }
        stored.binding = binding
        stored.unsubscribe = unsubscribe
    }
    rc.hookIndex++

    // Cleanup-only effects slot: invoke is always false, cleanup fires on unmount
    if (renderNode.effects[rc.hookIndex] === undefined) {
        renderNode.effects[rc.hookIndex] = {
            arg: undefined,
            sync: false,
            invoke: false,
            effect: () => { /* never called */ },
        }
    }
    renderNode.effects[rc.hookIndex].cleanup = stored.unsubscribe
    rc.hookIndex++

    return binding !== undefined ? binding.getValue() : context._defaultValue
}

function findContextBinding<T>(renderNode: RenderNode, context: Context<T>): ContextBinding<T> | undefined {
    let current = renderNode.parent
    while (current !== undefined) {
        const b = current.contextBindings?.get(context)
        if (b !== undefined) return b as ContextBinding<T>
        current = current.parent
    }
    return undefined
}

function makeReRenderCallback(
    link: ComponentLink,
    parentElement: Element,
    isSvg: boolean
): () => void {
    return () => {
        const currentRenderNode = link.renderNode
        if (currentRenderNode.stale) return
        if (!currentRenderNode.debounceRender) {
            setTimeout(() => {
                link.renderNode.debounceRender = false
                const vNode = link.renderNode.vNode
                if (vNode !== undefined) {
                    renderComponent(parentElement, link.renderNode.vNode as ComponentVNode<ComponentProps>, link.renderNode, link.renderNode.rendition, isSvg, false)
                }
            })
        }
        currentRenderNode.debounceRender = true
    }
}

/**
 *
 * @param reducer
 * @param initialState
 */
export function useReducer<TState, TAction>(
    reducer: (state: TState, action: TAction) => TState,
    initialState: TState
): [TState, (action: TAction) => void] {
    const [state, setState] = useState(initialState)
    const reducerRef = useRef(reducer)
    reducerRef.current = reducer
    const dispatch = useCallback((action: TAction) => setState(s => reducerRef.current(s, action)), [])
    return [state, dispatch]
}
