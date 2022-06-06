

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

Myra is a JSX rendering engine implementing a subset of React, but with some
differences (one being Myra uses requestAnimationFrame for updates).

## Setup

Add a reference to myra, for example by installing it with NPM:

`
npm install --save myra
`

Add a tsconfig.json to your project:

    {
      "compilerOptions": {
        "target": "es5",
        "module": "commonjs",
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
    
## Mounting a component
Use `myra.mount` to mount a component to the DOM:

```JSX
    // Mount the component to a DOM element
    myra.mount(<MyComponent />, document.body) 
```

## Implemented hooks
* useState - same as https://reactjs.org/docs/hooks-state.html
* useMemo - same as https://reactjs.org/docs/hooks-reference.html#usememo
* useEffect - same as https://reactjs.org/docs/hooks-effect.html
* useLayoutEffect - same as https://reactjs.org/docs/hooks-reference.html#uselayouteffect
* useRef - same as https://reactjs.org/docs/hooks-reference.html#useref
* useErrorHandler - Catches any errors and renders an "error view" instead of 
  the regular component view:
    ```JSX
        myra.useErrorHandler(error => <p>An error occured: {error}</p>) 
    ```

## Memoized components
Use `myra.memo` to create a component that will only render if it's props have
changed. The second argument is an optional comparison function to make a custom 
rendering decision:

```JSX
    // Mount the component to a DOM element
    const MyMemoComponent = myra.memo<IProps>(props => <p></p>) 
```

## Special props
Some props and events has special behavior associated with them.

* The `key` prop should be used to ensure that the state of child 
components is retained when they are changing position in a list. When used with
elements, it may also prevent unnecessary re-rendering and thus increase performance.
_It's value must be unique amongst the items in the list._
* The `class` prop value will be set to the `className` property of the element.
* The `ref` prop can be used to populate a ref's current value (see https://reactjs.org/docs/hooks-reference.html#useref)

## License

[MIT](http://opensource.org/licenses/MIT)

Copyright (c) 2016-2022 Jonathan Hedrén
