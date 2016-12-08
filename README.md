# Myra
Myra is a simple and small [Typescript](http://www.typescriptlang.org/) 
framework for building web interfaces. It targets the "middle ground" between
[Elm](http://elm-lang.org/) and [React](https://facebook.github.io/react/) + 
[Redux](http://redux.js.org/).

[![npm](https://img.shields.io/npm/v/myra.svg?maxAge=36000)](https://www.npmjs.com/package/myra)
[![Travis](https://img.shields.io/travis/jhdrn/myra.svg?maxAge=36000)](https://travis-ci.org/jhdrn/myra)
[![codecov](https://codecov.io/gh/jhdrn/myra/branch/master/graph/badge.svg)](https://codecov.io/gh/jhdrn/myra)

## Disclaimer
This project is currently in beta stage. It is quite stable but there might be
some bugs here and there. Use at your own risk!

## Features
* **Functional:** 
  Myra encourages functional programming and immutability for predictable 
  behavior.
* **Small API:** 
  Myra should be easy to learn as it's API and concepts are limited.
* **Statically typed views:** 
  Myra does not use HTML templates but uses 
  [JSX](https://facebook.github.io/react/docs/jsx-in-depth.html) to build up 
  view hierarchies. Together with Typescript's type checking, this reduces run 
  time errors.
* **No dependencies:** 
  Myra does not depend on any external libraries.
* **Small code base/size:** 
  Hello World example is ~9kb minified/~4kb minified and gzipped

## Requirements
Myra requires Typescript 2.0 to function properly. It is also highly advised 
that the compiler options `strictNullChecks`, `noImplicitReturns` and 
`noImplicitAny` are set to true.

## Getting started
Clone the repository and check the [examples](https://github.com/jhdrn/myra/tree/master/examples) folder. Open any example's folder
in your terminal and execute `npm install` followed by `npm start`, then open 
your favorite browser and point it to `localhost:8080`. 

The examples can be used as bootstrapping templates as they are set up with
build and "watch" scripts using npm and Webpack.

## Components
A Myra app is built from a hierarchy of components. The root component is 
mounted to a DOM element and it may contain child components.

Every component has a name (that must be unique), a state of any type and a 
view. Many times a component also has associated `Update` functions that updates 
it's state.

To define a component, use `defineComponent` and then mount it to the DOM
with `mountComponent`:
    
```JSX
    import * as myra from 'myra/core'

    type State = string

    const MyComponent = myra.defineComponent({
        // The name of the component
        name: 'MyComponent', 
        
        // The initial state and effects (optional) (see 'Effects' below)
        init: {
            state: 'Hello world',
            effects: ... // optional 
        }, 

        // An optional Update function to call when the component is mounted.
        // See 'Update' below.
        onMount: ..., 
        
        // Any subscriptions (see 'Subscriptions' below)
        subscriptions: ...,
        
        // The view of the component (see 'View' below)
        view: ctx => <p>{ctx.state}</p>
    })

    // Mounts the component to a DOM element
    myra.mountComponent(MyComponent, document.body) 
```

### Updating the state
State is updated with `Update` functions. `Update` functions should 
always be [pure](https://en.wikipedia.org/wiki/Pure_function) and 
should also always copy the state if any changes are made to it.

The `evolve` function helps with modifying and copying the state. In the 
following example, the `updateFoo` function updates the value of the `foo`
property of the state:

```typescript
    import { evolve } from 'myra/core'

    type State = {
        foo: string
    }

    const updateFoo = (state: State, newFoo: string) => 
        evolve(state, x => x.foo = newFoo)
```

Update functions must return a `Result<T>` which is an object with the
following definition (the `evolve` function does this for you):

``` typescript
    {
        state: T
        effects?: Effect[]
    }
```

### Effects
An `Effect` represents some kind of side effect. It receives an `Apply` function
that may be used to apply an `Update` function with any given arguments.

Effects can be returned in a `Result<T>` from an `Update` function or from
an event listener (see 'Event listeners' below).

```typescript
    import { Update, Apply } from 'myra/core'
    type State = ...

    const myEffect = (update: Update<State, any>) => (apply: Apply) => {
        ...some side effect...
        const arg = ...
        apply(update, arg)
    }
```

### Views
Myra does not use HTML templates but creates it's views with JSX. A 
`ViewContext<T>` is supplied as an argument to the view function. 

```JSX
    import * as myra from 'myra/core'

    type State = string

    const view = (ctx: myra.ViewContext<State>) => 
        <p>
           The state is {ctx.state}
        </p>

```

#### The `ViewContext<T>`
The `ViewContext<T>` contains key properties for the component:

- `state` - the current state of the component.
- `apply` - a function that updates the state of the component by applying the 
  `Update` function that is supplied as an argument. Subsequent arguments will 
  be passed as arguments to the `Update` function.
- `invoke` - a function that invokes an `Effect` which may update the state 
  later.
- `bind` - a convenience function to apply an update function and pass the value
  of a form field as an argument.

Examples of usage:

```JSX
    import * as myra from 'myra/core'
    import { startTimeout } from 'myra/time'

    type State = {
        inputValue: string
    }

    const myApplyUpdate = (s: State) => 
        myra.evolve(s, x => x.inputValue = '')
    
    const myBindUpdate = (s: State, inputValue: string) =>
        myra.evolve(s, x => x.inputValue = inputValue)

    const view = (ctx: myra.ViewContext<State>) => 
        <div>
            <input type="text"
                   oninput={ctx.bind(myBindUpdate)} />
            <p>{ctx.state.inputValue}</p>
            <button onclick={() => ctx.apply(myApplyUpdate)}>
                Clear inputValue
            </button>
            <button onclick={() => ctx.invoke(startTimeout(5000, undefined, myApplyUpdate))}>
                Clear in 5 seconds
            </button>
        </div>
```


#### Event listeners
Any attribute key starting with `on` is treated as an event listener.
The event and the `NodeDescriptor` of the node are passed as arguments.
A `NodeDescriptor` is a "virtual DOM" representation of a DOM node. It contains
a reference to it's associated `Node`. 

Keyboard events are handled a bit different: in order to know what key to be
listening for, the key of the attribute must be suffixed with an underscore
and the name of the key code to listen for, i.e. `keyup_49`. There are also
aliases for the following common keys: backspace, tab, enter, esc and space.
These can be used instead of their corresponding key code, i.e. 
`keyup_backspace`, `keydown_enter` etc. 

```JSX
    import * as myra from 'myra/core'

    type State = ...

    const myUpdate = (s: State) => {
        ...
        return myra.evolve(s)
    }

    const view = (ctx: myra.ViewContext<State>) => 
        <div class="className" onclick={(ev: MouseEvent, el: NodeDescriptor) => ctx.apply(myUpdate)}></div>

```

#### Special attributes
Some attributes and events has special behavior associated with them.

* The `class` attribute value will be set to the `className` property of the element.
* `blur`, `focus` and `click` attributes with a truthy value will result in a call to 
  `element.blur()`, `element.focus()` and `element.click()` respectively.
* `checked` and `disabled` attributes with a truthy value will set 
  `element.checked` and/or `element.disabled` to true.
* The `value` attribute will set `element.value` if it is either an `input`, 
  `select` or `textarea` element.

#### Child components
To mount a child component use it's identifier as a JSX tag. The component
identifier must begin with an uppercase first letter, as by standard JSX rules.

Any attributes will be passed to the child component's `onMount` `Update` function 
if defined.

```JSX
    import * as myra from 'myra/core'
    import MyComponent from './myComponent'
    
    const view = (_) => 
        <MyOtherComponent foo="an argument" />

```

### Subscriptions
Subscriptions makes it possible to communicate between components and between 
effects and components. 

To subscribe to messages, supply `defineComponent` with an anonymous object 
where the keys are the message type to listen for and the value is the `Update`
function to call when a message is recieved:

```typescript
    import * as myra from 'myra/core'

    type State = ...

    const onFooMessageRecieved = (s: State, messageData: string) => {
        ...
        return myra.evolve(s)
    }

    const myComponent = myra.defineComponent({
        name: 'MyComponent',
        init: ...,
        subscriptions: {
            'fooMessage': onFooMessageRecieved
        },
        view: ...
    })
```

To broadcast a message, use the `broadcast` function to create a "broadcast 
effect":

```typescript
    import * as myra from 'myra/core'

    type State = ...

    const broadcastMsg = myra.broadcast('messageType', 'an argument')
    const someUpdateFn = (s: State) => 
        myra.evolve(s).and(broadcastMsg)
```

### HTTP requests
The [myra-http](https://github.com/jhdrn/myra-http) exposes the package
`httpRequest` function that is an `Effect` wrapper for 
making XmlHttpRequests. Take a look at 
[examples/kitchen-sink/src/components/http.tsx](https://github.com/jhdrn/myra/blob/master/examples/kitchen-sink/src/components/http.tsx)
for an example on how to use the module.

### Timeouts and intervals
The [myra-time](https://github.com/jhdrn/myra-time) contains `Effect` package
wrappers for `setTimeout` and `setInterval`.
Take a look at 
[examples/kitchen-sink/src/components/time.tsx](https://github.com/jhdrn/myra/blob/master/examples/kitchen-sink/src/components/time.tsx)
for an example on how to use the module.

### Routing
Routing is supplied by the [myra-router](https://github.com/jhdrn/myra-router) 
package (currently a work in progress).

Both the 
[kitchen-sink example](https://github.com/jhdrn/myra/blob/master/examples/kitchen-sink/src/components/routing.tsx) 
and the 
[todomvc example](https://github.com/jhdrn/myra/blob/master/examples/todomvc/src/components/todo-list.tsx) 
contains code examples for `myra-router`.

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2016 Jonathan Hedrén
