# Myra

Myra is (another) JSX rendering library. It is small, simple and built with and for [TypeScript](https://www.typescriptlang.org/).

[![npm](https://img.shields.io/npm/v/myra.svg?maxAge=24000)](https://www.npmjs.com/package/myra)
[![CircleCI](https://dl.circleci.com/status-badge/img/circleci/D4GwQGdQNVPkQc73YZ9WfS/3SYtbN9QW7kqgT75UE6sjS/tree/master.svg?style=svg)](https://dl.circleci.com/status-badge/redirect/circleci/D4GwQGdQNVPkQc73YZ9WfS/3SYtbN9QW7kqgT75UE6sjS/tree/master)
[![codecov](https://codecov.io/gh/jhdrn/myra/branch/master/graph/badge.svg)](https://codecov.io/gh/jhdrn/myra)
[![Downloads](https://img.shields.io/npm/dm/myra.svg)](https://www.npmjs.com/package/myra)
[![gzip size](http://img.badgesize.io/https://unpkg.com/myra@latest/myra.min.js?compression=gzip)](https://unpkg.com/myra@latest/myra.min.js)
[![install size](https://badgen.net/packagephobia/install/myra)](https://packagephobia.now.sh/result?p=myra)

[![NPM](https://nodei.co/npm/myra.png)](https://nodei.co/npm/myra/)

Myra implements a React-like API (hooks, memo, fragments) on top of a custom virtual DOM diffing engine. It has no runtime dependencies.

## Setup

Install with npm:

```sh
npm install myra
```

Add a `tsconfig.json` to your project:

```json
{
  "compilerOptions": {
    "target": "es2015",
    "module": "es2015",
    "jsx": "react-jsx",
    "jsxImportSource": "myra",

    /* Optional, but recommended */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

This uses TypeScript's automatic JSX runtime, which imports the JSX helpers from
`myra/jsx-runtime`. You do not need to import `h` or `Fragment` in files that
contain JSX. To emit development-mode JSX through `myra/jsx-dev-runtime`, set
`"jsx"` to `"react-jsxdev"` instead.

The classic JSX transform remains supported. To use it, replace the JSX options
above with:

```json
{
  "compilerOptions": {
    "jsx": "react",
    "jsxFactory": "myra.h",
    "jsxFragmentFactory": "myra.Fragment"
  }
}
```

With the classic transform, `myra` must be in scope wherever JSX is used.

## Quick start

```tsx
import * as myra from 'myra'

const Counter = myra.define(() => {
    const [count, setCount] = myra.useState(0)

    return (
        <div>
            <p>Count: {count}</p>
            <button onclick={() => setCount(count + 1)}>Increment</button>
        </div>
    )
})

myra.mount(<Counter />, document.body)
```

## Mounting a component

Use `myra.mount` to mount a component to the DOM:

```tsx
myra.mount(<MyComponent />, document.body)
```

## Defining components

Use `myra.define` to wrap a component function. This is purely a convenience for TypeScript type inference and has no runtime effect:

```tsx
interface Props {
    name: string
}

const MyComponent = myra.define<Props>(({ name }) => <p>Hello, {name}!</p>)
```

## Hooks

### useState

Manages local component state. Supports lazy initialization:

```tsx
const [count, setCount] = myra.useState(0)
const [data, setData] = myra.useState(() => expensiveInitialValue())

// Functional update
setCount(prev => prev + 1)
```

State updates are queued asynchronously. Multiple updates to the same component
before the queue flushes are batched into one re-render, so the DOM is not
updated immediately after calling a setter.

### useEffect / useLayoutEffect

`useEffect` runs asynchronously after render. `useLayoutEffect` runs synchronously after render. Both accept an optional dependency array and may return a cleanup function. Dependency arrays are compared using Myra's deep `equal()` comparison.

```tsx
myra.useEffect(() => {
    const sub = subscribe()
    return () => sub.unsubscribe() // optional cleanup
}, [dep])
```

### useRef

```tsx
const inputRef = myra.useRef<HTMLInputElement>()

return <input ref={inputRef} />
// inputRef.current is the DOM element after render
```

### useMemo

Memoizes a computed value. Re-computes when deps change:

```tsx
const sorted = myra.useMemo(() => items.slice().sort(), [items])
```

### useCallback

Memoizes a callback. Re-creates when deps change:

```tsx
const handleClick = myra.useCallback(() => setCount(c => c + 1), [])
```

### useReducer

An alternative to `useState` for state transitions described by a reducer. Pass
the reducer and its initial state, then dispatch actions to update the state:

```tsx
type Action = { type: 'increment' } | { type: 'decrement' }

function reducer(state: number, action: Action): number {
    switch (action.type) {
        case 'increment': return state + 1
        case 'decrement': return state - 1
    }
}

const Counter = myra.define(() => {
    const [count, dispatch] = myra.useReducer(reducer, 0)

    return (
        <div>
            <p>{count}</p>
            <button onclick={() => dispatch({ type: 'increment' })}>+</button>
            <button onclick={() => dispatch({ type: 'decrement' })}>-</button>
        </div>
    )
})
```

### useContext

Subscribes to a context value provided by a `Context.Provider` ancestor. Re-renders the component whenever the context value changes. Falls back to the default value if no matching provider is found in the tree:

```tsx
const ThemeContext = myra.createContext('light')

const ThemedButton = myra.define(() => {
    const theme = myra.useContext(ThemeContext)
    return <button class={theme}>Click me</button>
})
```

### useErrorHandler

Catches errors thrown during render and shows a fallback view:

```tsx
myra.useErrorHandler(error => <p>An error occurred: {String(error)}</p>)
```

## Context

Context lets you pass values down the component tree without threading props through every level.

Use `myra.createContext` to create a context object with a default value, then wrap the subtree with its `Provider` to supply a value:

```tsx
const ThemeContext = myra.createContext('light')

const App = myra.define(() => (
    <ThemeContext.Provider value="dark">
        <ThemedButton />
    </ThemeContext.Provider>
))
```

Any descendant can read the nearest provider's value with `useContext` (see above). When the provider's `value` prop changes, all subscribed consumers re-render automatically. If no provider is found, the default value passed to `createContext` is used.

## Memoized components

Use `myra.memo` to skip re-renders when props have not changed. By default a shallow comparison is used. Pass a custom comparator as the second argument to override:

```tsx
const MyMemoComponent = myra.memo<Props>(props => <p>{props.name}</p>)

// Custom comparator — return true to keep the existing render, false to re-render
const MyMemoComponent = myra.memo<Props>(
    props => <p>{props.name}</p>,
    (newProps, oldProps) => newProps.name === oldProps.name
)
```

## Fragments

Use `<></>` (or `<myra.Fragment>`) to return multiple elements without a wrapper:

```tsx
const MyComponent = myra.define(() => (
    <>
        <h1>Title</h1>
        <p>Body</p>
    </>
))
```

## Special props

* **`key`** — ensures stable identity for list items during reconciliation. Must be unique among siblings.
* **`class`** — maps to the DOM `className` property.
* **`ref`** — populated with the DOM element after render (use with `useRef`).
* **`nothing`** — a special JSX tag that always renders as an HTML comment node (`<!-- Nothing -->`), useful as a conditional placeholder.

## Utilities

Myra also exports two general-purpose helpers:

* **`equal(a, b)`** — deeply compares arrays, plain objects, dates, and regular expressions.
* **`typeOf(value)`** — returns a more specific type name than JavaScript's `typeof`, distinguishing arrays, dates, regular expressions, `null`, and `undefined`.

## License

[MIT](http://opensource.org/licenses/MIT)
