

Myra

Myra is (another) JSX rendering library. It is small, simple and built with and for [Typescript](http://www.typescriptlang.org/).

[![npm](https://img.shields.io/npm/v/myra.svg?maxAge=24000)](https://www.npmjs.com/package/myra)
[![Travis](https://img.shields.io/travis/jhdrn/myra.svg?maxAge=36000)](https://travis-ci.org/jhdrn/myra)
[![codecov](https://codecov.io/gh/jhdrn/myra/branch/master/graph/badge.svg)](https://codecov.io/gh/jhdrn/myra)

## Features
* **Small API:** 
  Myra should be easy to learn as it's API and concepts are limited.
* **Statically typed views:** 
  Myra does not use HTML templates but uses 
  [JSX](https://facebook.github.io/react/docs/jsx-in-depth.html) to build up 
  view hierarchies. Together with Typescript's type checking, this reduces run time errors.
* **No dependencies:** 
  Myra does not depend on any external libraries.
* **Small code base/size:** 
  Hello World example is < 3kb minified and gzipped

## Requirements
Myra requires Typescript 2.2 to function properly. It is also highly advised 
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
mounted to a DOM element and it may contain child components. Components can be
either stateful or stateless. 

### Stateful components
To define a stateful component, use `myra.define` and then mount it to the DOM
with `myra.mount`:
    
```JSX
    import * as myra from 'myra'
    
    type Props = { myProp: string }
    type State = { hello: string }

    const init = { hello: 'Hello!' }

    // define the component passing the initial state and an "init" 
    // function
    const MyComponent = myra.define<State, Props>(
        init, 
        // The "init" function takes 
        (evolve, events) => {

            // The 'events' argument is used to attach event listeners
            // for lifecycle events
            events.didMount = (props, domRef) => console.log('didMount')

            // This function will be triggered when the <p>-tag below is clicked
            // and update the state with a new 'hello' text
            const onClick = (ev: MouseEvent) => 
                evolve({ hello: ev.target.tagName })

            // The view must be returned as a function receiving the current state, 
            // any props and any child nodes.
            return (state, props, children) => 
                <p onclick={onClick}>
                    {state.hello}
                    {props.myProp}
                    {children}
                </p>
        }
    )

    // Mounts the component to a DOM element
    myra.mount(MyComponent, document.body) 
```

#### Lifecycle events
The following lifecycle events are fired:
didMount
willUpdate
willUnmount

### Stateless components
A stateless component is just a function that takes a props object and 
children as arguments:

```JSX
    import * as myra from 'myra'

    type Props = { test: string }
    const StateLessComponent = (props: Props, children: VNode[]) =>
        <div>
            {props.test}
            {...children}
        </div>

    const parentView = () => 
        <StateLessComponent test="foo">
            This is a child.
        </StateLessComponent>
```

## Special attributes/props
Some attributes/props and events has special behavior associated with them.

* The `key` attribute/prop should be used to ensure that the state of child 
components is retained when they are changing position in a list. When used with
elements, it may also prevent unnecessary re-rendering and thus increase performance.
_It's value must be unique amongst the items in the list._
* The `class` attribute value will be set to the `className` property of the element.
* `blur`, `focus` and `click` attributes with a truthy value will result in a call to 
  `element.blur()`, `element.focus()` and `element.click()` respectively.

## Routing
Routing is supplied by the [myra-router](https://github.com/jhdrn/myra-router) 
package (currently a work in progress).

Both the 
[kitchen-sink example](https://github.com/jhdrn/myra/blob/master/examples/kitchen-sink/src/components/routing.tsx) 
and the 
[todomvc example](https://github.com/jhdrn/myra/blob/master/examples/todomvc/src/components/todo-list.tsx) 
contains code examples for `myra-router`.

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2016-2017 Jonathan Hedrén
