# Myra
Myra is a simple and small [Typescript](http://www.typescriptlang.org/) 
framework for building web interfaces.

[![npm](https://img.shields.io/npm/v/myra.svg?maxAge=36000)](https://www.npmjs.com/package/myra)
[![Travis](https://img.shields.io/travis/jhdrn/myra.svg?maxAge=36000)](https://travis-ci.org/jhdrn/myra)
[![codecov](https://codecov.io/gh/jhdrn/myra/branch/master/graph/badge.svg)](https://codecov.io/gh/jhdrn/myra)

## Disclaimer
This project is currently in alpha stage. There are bugs and it's API might 
change in future versions. Use at your own risk!

## Requirements
Myra requires Typescript 2.0 to function properly. It is also highly advised 
that the compiler options `strictNullChecks`, `noImplicitReturns` and 
`noImplicitAny` are set to true.

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
  Hello World example is ~10kb minified/~4kb minified and gzipped

## State of the project
The core API (i.e. `myra/core`) is close to be finalized. The other modules
are subjects to a lot of changes.

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
    import { defineComponent, mountComponent } from 'myra/core'

    type State = string

    const MyComponent = defineComponent({
        // The name of the component
        name: 'MyComponent', 
        
        // The initial state and tasks (optional) (see 'Tasks' below)
        init: {
            state: 'Hello world',
            tasks: ... // optional 
        }, 

        // An optional Update function to call when the component is mounted.
        // See 'Update' below.
        onMount: ..., 
        
        // Any subscriptions (see 'Subscriptions' below)
        subscriptions: ...,
        
        // The view of the component (see 'View' below)
        view: (state: State) => <p>{state}</p>
    })

    // Mounts the component to a DOM element
    mountComponent(MyComponent, document.body) 
```

### Updating the state
State is updated with `Update` functions. `Update` functions should 
always be [pure](https://en.wikipedia.org/wiki/Pure_function) and 
should also always copy the state if any changes are made to it.

The `evolve` function helps with modifying and copying the state.

```typescript
    import { evolve } from 'myra/core'

    type State = {
        foo: string
    }

    const updateFoo = (state: State, newFoo: string) => 
        evolve(state, x => x.foo = newFoo)
```

Update functions must return a `Result<T>` which is an object with the
following definition: 

``` typescript
    {
        state: T
        tasks?: Task[]
    }
```

### Tasks
A `Task` represents some kind of side effect. It receives a dispatch function
that may be used to dispatch an `Update` function with any given arguments.

Tasks can be returned in a `Result<T>` from an `Update` function or from
an event listener (see 'Event listeners' below).

```typescript
    import { task, Update } from 'myra/core'

    const myTask = (update: Update<any, any>) => task(dispatch => {
        ...some side effect...
        const arg = ...
        dispatch(update, arg)
    })
```

### Views
Myra does not use HTML templates but creates it's views with JSX. The state of
the component is supplied as an argument to the view function.

```JSX
    import * as jsxFactory from 'myra/html/jsxFactory'

    type State = string

    const view = (s: State) => 
        <p>
           The state is {s}
        </p>

```

##### Event listeners
Any attribute key starting with `on` is treated as an event listener.
Event listeners are functions that returns either an `Update` function or a 
`Task`. The event and the `NodeDescriptor` of the node are passed as arguments.
A `NodeDescriptor` is a "virtual DOM" representation of a DOM node. It contains
a reference to it's associated `Node`. 

Keyboard events are handled a bit different: in order to know what key to be
listening for, the key of the attribute must be suffixed with an underscore
and the name of the key code to listen for, i.e. `keyup_49`. There are also
aliases for the following common keys: backspace, tab, enter, esc and space.
These can be used instead of their corresponding key code, i.e. 
`keyup_backspace`, `keydown_enter` etc. 

```JSX
    import * as jsxFactory from 'myra/html/jsxFactory'

    const myUpdate = (m: State) => {
        ...
        return evolve(m)
    }

    const view = (_) => 
        <div class="className" onclick={(ev: MouseEvent, el: NodeDescriptor) => myUpdate}></div>

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
    import * as jsxFactory from 'myra/html/jsxFactory'
    import MyComponent from './myComponent'
    
    const view = (_) => 
        <MyOtherComponent foo="an argument" />

```

### Subscriptions
Subscriptions makes it possible to communicate between components and between 
tasks and components. 

To subscribe to messages, supply `defineComponent` with an anonymous object 
where the keys are the message type to listen for and the value is the `Update`
function to call when a message is recieved:

```typescript
    import { defineComponent } from 'myra/core'

    const onFooMessageRecieved = (s: State, messageData: string) => {
        ...
        return s
    }

    const myComponent = defineComponent({
        name: 'MyComponent',
        init: ...,
        subscriptions: {
            'fooMessage': onFooMessageRecieved
        },
        view: ...
    })
```

To broadcast a message, use the `broadcast` function to create a "broadcast 
task":

```typescript
    import { broadcast } from 'myra/core'

    const broadcastTask = broadcast('messageType', 'an argument')
    const someUpdateFn = (s: State) => 
        evolve(s).and(broadcastTask)
```

### Forms
`myra/forms` is a module with helper functions and components for form handling. 
It's currently a work in progress.

### HTTP requests
`myra/http` is a module with `Task` wrappers for making XmlHttpRequests. It 
exposes the `httpRequest` function and 'shortcut' functions for GET, POST, PUT 
and DELETE requests. Take a look at 
[examples/kitchen-sink/src/components/http.ts](https://github.com/jhdrn/myra/blob/master/examples/kitchen-sink/src/components/http.ts)
for an example on how to use the module.

### Location/"routing"
`myra/location` is a module with `Task` wrappers for 
`pushState/replaceState/popState`.

Both the 
[kitchen-sink example](https://github.com/jhdrn/myra/blob/master/examples/kitchen-sink/src/components/location.ts) 
and the 
[todomvc example](https://github.com/jhdrn/myra/blob/master/examples/todomvc/src/components/todo-list.ts) 
contains code examples for `myra/location`.

### Timeouts and intervals
`myra/time` is a module with `Task` wrappers for `setTimeout` and `setInterval`.
Take a look at 
[examples/kitchen-sink/src/components/time.ts](https://github.com/jhdrn/myra/blob/master/examples/kitchen-sink/src/components/time.ts)
for an example on how to use the module.

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2016 Jonathan Hedrén
