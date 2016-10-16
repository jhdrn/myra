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
  ~17kb minified/~5kb minified and gzipped

## Getting started
Clone the repository and check the [examples](https://github.com/jhdrn/myra/tree/master/examples) folder. Open any example's folder
in your terminal and execute `npm install` followed by `npm start`, then open 
your favorite browser and point it to `localhost:8080`.

## Components
Myra is all about components and there is always at least one component in a 
Myra application. A component will have it's own state (the 'State') and view.

A component will be defined with `defineComponent`:
    
```typescript
    import { defineComponent } from 'myra/core'

    const myComponent = defineComponent({
        // The name of the component
        name: 'MyComponent', 
        
        // The initial state and optional tasks (see 'State' and 'Task' below)
        init: ..., 

        // An optional Update function to call when the component is mounted.
        // See 'Update' below.
        mount: ..., 
        
        // Any subscriptions (see 'Subscriptions' below)
        subscriptions: ...,
        
        // The view of the component (see 'View' below)
        view: ... 
    })
```

The "main" component should be mounted to a HTML element:

```typescript
    import { mountComponent } from 'myra/core'

    mountComponent(myComponent, document.body)
```

### State
Represents the state of the component. Can be anything but a function, even 
undefined or null.

### Task
A `Task` represents some kind of side effect. It receives a dispatch function
that may be used to dispatch an `Update` function with any given arguments.

```typescript
    import { task, Update } from 'myra/core'

    const myTask = (update: Update<any, any>) => task(dispatch => {
        ...some side effect...
        const arg = ...
        dispatch(update, arg)
    })
```

### Update
One or more functions that updates the state. Update functions should always be 
pure and should also always copy the state if any changes are made to it.
The `evolve` function helps with copying the state.

```typescript
    import { evolve } from 'myra/core'

    type State = {
        foo: string
    }

    const updateFoo = (state: State, newFoo: string) => 
        evolve(state, x => x.foo = newFoo)
```

Update functions must return a `Result<T>` which is basically an object with the
following definition: 

``` typescript
    {
        state: T
        tasks?: Task[]
    }
```

### View
Myra does not use HTML templates but creates it's views with JSX.

```JSX
    import * as jsxFactory from 'myra/html/jsxFactory'

    const view = (_) => 
        <div>
            <ul>
                <li>
                    A list item
                </li>
            </ul>
        </div>

```

##### Attributes and event listeners
Event listeners can be either an `Update` function or a `Task`.

```JSX
    import * as jsxFactory from 'myra/html/jsxFactory'

    const myUpdate = (m: State) => {
        ...
        return m
    }

    const view = (_) => 
        <div class="className" onclick={myUpdate}></div>

```

##### Special behavior
Some attributes and events has special behavior associated with them.

* Any attribute key starting with `on` is treated as an event listener. The
  value of such an attribute should be an `Update` or `Task` function. However,
  if there is a need to call `event.preventDefault()` and/or 
  `event.stopPropagation()`, the event listener can be wrapped in an object 
  like this: 
  `{ listener: updateFnOrTask, preventDefault: true, stopPropagation: true }`
* If an event listener is added to an `input`, `select` or `textarea` element,
  it's `value` will be passed as an argument to the attached `Update` function.
* If the element is a `form` element and the `onsubmit` event listener is 
  triggered, all values of it's child elements with a `name` attribute will be 
  copied to an anonymous object which will be passed as argument to the 
  attached `Update` function. 
* Keyboard events are handled a bit different: in order to know what key to be
  listening for, the key of the attribute must be suffixed with an underscore
  and the name of the key code to listen for, i.e. `keyup_49`. There are also
  aliases for the following common keys: backspace, tab, enter, esc and space.
  These can be used instead of their corresponding key code, i.e. 
  `keyup_backspace`, `keydown_enter` etc. 
* `blur`, `focus` and `click` attributes with a truthy value will result in a call to 
  `element.blur()`, `element.focus()` and `element.click()` respectively.
* `checked` and `disabled` attributes with a truthy value will set 
  `element.checked` and/or `element.disabled` to true.
* The `value` attribute will set element.value if it is either an `input`, 
  `select` or `textarea` element.

```JSX
    import * as jsxFactory from 'myra/html/jsxFactory'

    type FormData = { 
        foo: string
        bar: string
    }

    // Example of update function that will receive form data as 
    // argument when the event is triggered.
    const handleFormSubmit = (s: State, formData: FormData) => {
        ...
        return evolve(s)
    }

    // Example of update function that will receive an input elements value as 
    // argument when the event is triggered.
    const updateNothing = (s: State, value: string) => 
        return evolve(s)
    
    const view = (_) =>
        <form onsubmit={{ listener: handleFormSubmit, preventDefault: true }}>
            <div>
                <input focus={ true }
                       name="foo"
                       type="text"
                       onkeyup_escape={ updateNothing } />
                
                <input type="checkbox"
                       checked={ true }
                       name="bar" />
                <button type="submit"></button>
            </div>
        </form>
```

#### Child components
To mount a child component................., rendering it's view hierarchy. It's possible to feed
the child component with arguments.

```JSX
    import * as jsxFactory from 'myra/html/jsxFactory'

    ...
    
    const view = (_) => 
        <MyOtherComponent foo="an argument" />

```


#### Nothing
Represents nothing, renders as a comment node with the comment "Nothing".

```JSX
    import * as jsxFactory from 'myra/html/jsxFactory'

    ...
    
    const view = (_) => <nothing />

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
