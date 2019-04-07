

Myra

Myra is (another) JSX rendering library. It is small, simple and built with and for [Typescript](http://www.typescriptlang.org/).

[![npm](https://img.shields.io/npm/v/myra.svg?maxAge=24000)](https://www.npmjs.com/package/myra)
[![Travis](https://img.shields.io/travis/jhdrn/myra.svg?maxAge=36000)](https://travis-ci.org/jhdrn/myra)
[![codecov](https://codecov.io/gh/jhdrn/myra/branch/master/graph/badge.svg)](https://codecov.io/gh/jhdrn/myra)
[![Language grade: JavaScript](https://img.shields.io/lgtm/grade/javascript/g/jhdrn/myra.svg?logo=lgtm&logoWidth=18)](https://lgtm.com/projects/g/jhdrn/myra/context:javascript)
[![Downloads](https://img.shields.io/npm/dm/myra.svg)](https://www.npmjs.com/package/myra)
[![gzip size](http://img.badgesize.io/https://cdn.jsdelivr.net/npm/myra/myra.min.js?compression=gzip)](https://cdn.jsdelivr.net/npm/myra/myra.min.js)
[![install size](https://badgen.net/packagephobia/install/myra)](https://packagephobia.now.sh/result?p=myra)

[![NPM](https://nodei.co/npm/myra.png)](https://nodei.co/npm/myra/)

## Requirements
Myra requires Typescript 2.8 to function properly. It is also highly advised 
that the compiler options `strictNullChecks`, `noImplicitReturns` and 
`noImplicitAny` are set to true.

## Getting started
Clone the repository and check the 
[examples](https://github.com/jhdrn/myra/tree/master/examples) 
folder. Open any example's folder in your terminal and execute 
`npm install && npm start`, then open your favorite browser and point it to 
`localhost:8080`.

The examples can be used as bootstrapping templates as they are set up with
build and "watch" scripts using npm and Webpack.

## Components
A Myra app is built from a hierarchy of components. The root component is 
mounted to a DOM element and it may contain child components. 

A component is just a function that takes a `props` object and a `context` as arguments:

```JSX
    import * as myra from 'myra'

    type Props = { test: string } & myra.ComponentProps
    const StateLessComponent = (props: Props, context: myra.Context<Props>) =>
        <div>
            {props.test}
            {...props.children}
        </div>

    const parentView = () => 
        <StateLessComponent test="foo">
            This is a child.
        </StateLessComponent>
```

### Mounting a component
Use `myra.mount` to mount a component to the DOM:

```JSX
    // Mount the component to a DOM element
    myra.mount(<MyComponent />, document.body) 
```

### Using the context
The `context` object contains functions to enhance the component functionality
(this is similar to React hooks):

#### useRef: <T>(current?: T)  => { current: T; node: Node | undefined }
Creates a "ref" object which holds a reference to the component DOM node (when
it has been rendered) and a "current" property which is a mutable property that
will persist between renders.

```JSX
    const MyComponent = myra.useContext((_, ctx) => {
        const ref = ctx.useRef('the initial mutable value')
        ref.node // holds the DOM node of the component (when it has been rendered)
        ref.current // the current value
        return <div>...</div>
    })
```

#### useErrorHandler: (handler: (error: any) => VNode) => void
Makes the component "catch" errors. If no error handler is used, thrown errors
will we propagated upwards in the component tree. The error handler function
must return a VNode which will be rendered in case of an error.

```JSX
    const MyComponent = myra.useContext((_, ctx) => {
        // An error handler that will render the error
        ctx.useErrorHandler(err => <div>{err}</div>)
        return <div>...</div>
    })
```

#### useLifecycle: (callback: (event: LifecycleEvent): void) => void
Attach a "life cycle event listener" that will be called whenever one of the
following events occur:

- willMount
- willRender
- didMount
- didRender
- willUnmount

```JSX
    const MyComponent = myra.useContext((_, ctx) => {
        
        ctx.useLifecycle(ev => {
            switch (ev) {
                case 'didMount':
                    // after the component was attached to the DOM
                case 'didRender':
                    // after the component was rendered
                case 'willMount':
                    // before the component will attach to the DOM
                case 'willRender':
                    // before the component will be rendered
                case 'willUnmount':
                    // before the component will be detached from the DOM.
            }
        })
        return <div>...</div>
    })
```

#### useMemo: <TMemoized, TArgs>(fn: (args: TArgs) => TMemoized, inputs: TArgs) => TMemoized
Memoizes a value that will not change until the input arguments changes. Use
cases includes memoizing callback functions that will be used as props and 
caching computational heavy tasks.

```JSX
    const MyComponent = myra.useContext((_, ctx) => {
        const memoizedValue = ctx.useMemo(arg => { 
            // arg === 'an argument'
            // computational expensive operation goes here
         }, 'an argument')
        return <div>...</div>
    })
```

#### useState: <TState>(init: TState) => [TState, Evolve<TState>]
Returns a tuple consisting of the current state and a function to update the 
state ("Evolve"). The "Evolve" function has two overloads, one that sets the new 
state and one that takes a function receiving the current state that should 
return the new state. If the new state is an object, it will be shallowly merged
with the old state. The "Evolve" function will also return the new state. 

When a state is updated, the component will be re-rendered.

Multiple states may be used for the same component.

```JSX
    const MyComponent = myra.useContext((_, ctx) => {
        const [state1, updateState1] = ctx.useState('initial state')
        // state1 = 'initial state'
        const newState1 = updateState1('new state')
        // newState1 = 'new state'

        const [state2, updateState2] = ctx.useState({ foo: 'bar', baz: 0 })
        // state2 = { foo: 'bar', baz: 0 }
        const newState2 = updateState2({ foo: 'baz' })
        // newState2 = { foo: 'baz', baz: 0 }
        return <div>...</div>
    })
```

#### useRenderDecision: (desicion: (oldProps: TProps, newProps: TProps) => boolean) => void
Takes a function that will be called prior to rendering. If the function returns
false, the component will not render.

```JSX
    const MyComponent = myra.useContext((_, ctx) => {
        ctx.useRenderDecision((oldProps, newProps) => { 
            return false // prevent render
         })
        return <div>...</div>
    })
```

## Special props
Some props and events has special behavior associated with them.

* The `key` prop should be used to ensure that the state of child 
components is retained when they are changing position in a list. When used with
elements, it may also prevent unnecessary re-rendering and thus increase performance.
_It's value must be unique amongst the items in the list._
* The `forceUpdate` prop will force a child component to update if set to true 
(even if it's props didn't change).
* The `class` prop value will be set to the `className` property of the element.
* `blur`, `focus` and `click` props with a truthy value will result in a call to 
  `element.blur()`, `element.focus()` and `element.click()` respectively.

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2016-2019 Jonathan Hedrén
