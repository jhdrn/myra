import { ComponentFactory, Key, MyraNode } from './contract'
import { Fragment } from './fragment'
import { h } from './jsxFactory'

export { Fragment }

type JSXTag = string | ComponentFactory<object> | undefined | null

interface RuntimeProps {
    children?: MyraNode
    key?: Key
    [name: string]: unknown
}

/** Creates a VNode for TypeScript's automatic JSX runtime. */
export function jsx(tag: JSXTag, props: RuntimeProps | null, key?: Key): JSX.Element {
    const runtimeProps = props === null ? {} : { ...props }
    const hasChildren = Object.prototype.hasOwnProperty.call(runtimeProps, 'children')
    const children = runtimeProps.children
    delete runtimeProps.children

    if (key !== undefined) {
        runtimeProps.key = key
    }

    return hasChildren ? h(tag, runtimeProps, children) : h(tag, runtimeProps)
}

/** The static-children variant has the same behavior in Myra. */
export const jsxs = jsx

/** Development builds may emit jsxDEV instead of jsx. */
export function jsxDEV(
    tag: JSXTag,
    props: RuntimeProps | null,
    key?: Key,
    _isStaticChildren?: boolean,
    _source?: unknown,
    _self?: unknown
): JSX.Element {
    return jsx(tag, props, key)
}
