# Myra

Myra is (another) JSX rendering library. It is small, simple and built with and for [TypeScript](http://www.typescriptlang.org/).

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
npm install --save myra
```

Add a `tsconfig.json` to your project:

```json
{
  "compilerOptions": {
    "target": "es2015",
    "module": "es2015",
    "jsx": "react",
    "jsxFactory": "myra.h",
    "jsxFragmentFactory": "myra.Fragment",

    /* Optional, but recommended */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

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

### useEffect / useLayoutEffect

`useEffect` runs asynchronously after render. `useLayoutEffect` runs synchronously after render (equivalent to React's `useLayoutEffect`). Both accept an optional deps array.

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

### useErrorHandler

Catches errors thrown during render and shows a fallback view:

```tsx
myra.useErrorHandler(error => <p>An error occurred: {error}</p>)
```

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

* **`key`** — ensures stable identity for list items during reconciliation. Must be unique among siblings. Also prevents unnecessary re-renders of elements.
* **`class`** — maps to the DOM `className` property.
* **`ref`** — populated with the DOM element after render (use with `useRef`).
* **`nothing`** — a special JSX tag that always renders as an HTML comment node (`<!-- Nothing -->`), useful as a conditional placeholder.

## License

[MIT](http://opensource.org/licenses/MIT)
