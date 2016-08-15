# Myra
Myra is a simple and small [Typescript](http://www.typescriptlang.org/) 
framework for building web interfaces.

[![npm](https://img.shields.io/npm/v/myra.svg?maxAge=3600000)](https://www.npmjs.com/package/myra)
[![Travis](https://img.shields.io/travis/jhdrn/myra.svg?maxAge=3600000)](https://travis-ci.org/jhdrn/myra)
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
  Myra does not use HTML templates but uses functions or 
  [JSX](https://facebook.github.io/react/docs/jsx-in-depth.html) to build up 
  view hierarchies. This reduces run time errors and increases performance.
* **No dependencies:** 
  Myra does not depend on any external libraries.
* **Small code base/size:** 
  ~48kb/~17kb minified/~5kb minified and gzipped

## Getting started
Clone the repository and check the [examples](https://github.com/jhdrn/myra/tree/master/examples) folder. Open any example's folder
in your terminal and execute `npm install` followed by `npm start`, then open 
your favorite browser and point it to `localhost:8080`.

## Components
Myra is all about components and there is always at least one component in a 
Myra application. A component will have it's own state (the 'Model') and view.

A component will be defined with `defineComponent`:
    
```typescript
    import { defineComponent } from 'myra/core'

    const myComponent = defineComponent({
        // The name of the component
        name: 'MyComponent', 
        
        // The initial model (see 'Model' below)
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
    myComponent.mount(document.body)
```

### Model
Represents the state of the component. Can be anything but a function, even 
undefined or null.

### Update
One or more functions that updates the model. Update functions should always be 
pure and should also always copy the model if any changes are made to it.
The `evolve` function helps with copying the model.

```typescript
    import { evolve } from 'myra/core'

    type Model = {
        foo: string
    }

    const updateFoo = (model: Model, newFoo: string) => 
        evolve(model, x => x.foo = newFoo)
```

Update functions can either return just the model or a tuple 
`[Model, Task | Task[]]` to do side effects.

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

### View
Myra does not use HTML templates but creates it's views with functions or JSX 
returning `NodeDescriptor` which is a union type of the following types:

#### ElementNodeDescriptor
Renders as an HTML element. Most HTML elements are represented as functions in
`myra/html` module (there is also an `el` function to create custom elements). 

```typescript
    import { text } from 'myra/html'
    import { div, ul, li, el } from 'myra/html/elements'

    const view = (_) => 
        div(
            ul(
                li(
                    text('A list item')
                )
            ),
            el('custom')
        )
```
JSX can also be used:

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
Most functions returning an `ElementNodeDescriptor` takes an anonymous object as 
first argument. The keys and values of the supplied object will be mapped to
attributes and event listeners on the element. Event listeners can be either an
`Update` function or a `Task`.

```typescript
    import { div } from 'myra/html'
    
    const myUpdate = (m: Model) => {
        ...
        return m
    }

    const view = (_) => 
        div({
            'class': 'className',
            onclick: myUpdate,
        })
```

JSX:

```JSX
    import * as jsxFactory from 'myra/html/jsxFactory'

    ...

    const view = (_) => 
        <div class="className" onclick={ myUpdate }></div>

```

##### Special behavior
Some attributes and events has special behavior associated with them.

* If an event listener is added to an `input`, `select` or `textarea` element,
  it's `value` will be passed as an argument to the attached `Update` function.
* If the element is a `form` element and the `onsubmit` event listener is 
  triggered, all values of it's child elements with a `name` attribute will be 
  copied to an anonymous object which will be passed as argument to the 
  attached `Update` function. 
* Keyboard events are handled a bit different: in order to know what key to be
  listening for, the key of the attribute must be suffixed with an underscore
  and the name of the key to listen for, i.e. `keyup_enter`.
* `blur` and `focus` attributes with a truthy value will result in a call to 
  `element.blur()` and `element.focus()` respectively.
* `checked` and `disabled` attributes with a truthy value will set 
  `element.checked` and/or `element.disabled` to true.
* The `value` attribute will set element.value if it is either an `input`, 
  `select` or `textarea` element.
* If there is a need to call `event.preventDefault()` and/or 
  `event.stopPropagation()`, the event listener can be wrapped in an object 
  like this: 
  `{ listener: updateFnOrTask, preventDefault: true, stopPropagation: true }`


```typescript
    import { form, div, input, button } from 'myra/html'

    type FormData = { 
        foo: string
        bar: string
    }
    const handleFormSubmit = (m: Model, formData: FormData) => {
        ...
        return m
    }

    // Example of update function that will receive an input elements value as 
    // argument when the event is triggered.
    const updateNothing = (m: Model, value: string) => {
        return m
    } 

    const view = (_) =>
        form({ onsubmit: { listener: handleFormSubmit, preventDefault: true } },
            div(
                input({
                    focus: true,
                    name: 'foo',
                    type: 'text',
                    onkeyup_escape: updateNothing
                }),
                input({
                    type: 'checkbox',
                    checked: true,
                    name: 'bar'
                }),
                button({
                    type: 'submit'
                })
            )
        )
```

#### ComponentNodeDescriptor
Mounts a child component, rendering it's view hierarchy. It's possible to feed
the child component with arguments.

```typescript
    import { component } from 'myra/html'
    import { myOtherComponent } from './myOtherComponent'

    const view = (_) => component(myOtherComponent, 'an argument')
```

JSX:

```JSX
    import * as jsxFactory from 'myra/html/jsxFactory'

    ...
    
    const view = (_) => 
        <mount component={ myOtherComponent } args={ 'an argument' } />

```

#### TextNodeDescriptor
Renders as a text node.

```typescript
    import { text } from 'myra/html'

    const view = (_) => text('Hello world!')
```

With JSX you will have to wrap the text in an element.

#### NothingNodeDescriptor
Represents nothing, renders as a comment node with the comment "Nothing".

```typescript
    import { nothing } from 'myra/html'

    const view = (_) => nothing()
```

JSX:

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

    const onFooMessageRecieved = (m: Model, messageData: string) => {
        ...
        return m
    }

    const myComponent = defineComponent({
        name: 'MyComponent',
        model: ...,
        subscriptions: {
            'fooMessage': onFooMessageRecieved
        },
        view: ...
    })
```

To broadcast a message, use the `broadcast` function to create a "broadcast 
task":

```typescript
    import { broadcast, Task } from 'myra/core'

    const broadcastTask = broadcast('messageType', 'an argument')
    const someUpdateFn = (m: Model) => 
        [m, broadcastTask] as [Model, Task]
```

### HTTP requests
`myra/http` is a module with `Task` wrappers for making XmlHttpRequests. It 
exposes the `httpRequest` function and 'shortcut' functions for GET, POST, PUT 
and DELETE requests. Take a look at 
[examples/kitchen-sink/src/models/books.ts](https://github.com/jhdrn/myra/blob/master/examples/kitchen-sink/src/models/books.ts)
for an example on how to use the module.

### Location/"routing"
`myra/location` is a module with `Task` wrappers for 
`pushState/replaceState/popState`.

Both the 
[kitchen-sink example](https://github.com/jhdrn/myra/blob/master/examples/kitchen-sink/src/components/header.ts) 
and the 
[todomvc example](https://github.com/jhdrn/myra/blob/master/examples/todomvc/src/components/todo-list.ts) 
contains code examples for `myra/location`.

### Timeouts and intervals
`myra/time` is a module with `Task` wrappers for `setTimeout` and `setInterval`.
Take a look at 
[examples/kitchen-sink/src/components/book-search.ts](https://github.com/jhdrn/myra/blob/master/examples/kitchen-sink/src/components/book-search.ts)
for an example on how to use the module.

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2016 Jonathan Hedrén