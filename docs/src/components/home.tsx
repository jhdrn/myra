import * as myra from 'myra'

import Navigation from './navigation'

export default () =>
    <div id="home">
        <div class="container">
            <h1>Myra</h1>
            <p class="lead">A simple and small Typescript framework for building web interfaces</p>
            <Navigation />
            <ul>
                <li>
                    <strong>Functional:</strong>
                    Myra encourages functional programming and immutability for predictable
                    behavior.
                </li>
                <li>
                    <strong>Small API:</strong>
                    Myra should be easy to learn as it's API and concepts are limited.
                </li>
                <li>
                    <strong>Statically typed views:</strong>
                    Myra does not use HTML templates but uses
                    <a href="https://facebook.github.io/react/docs/jsx-in-depth.html">JSX</a>
                    to build up view hierarchies. With Typescript's type checking
                    errors can catched in the build step.
                </li>
                <li>
                    <strong>No dependencies:</strong>
                    Myra does not depend on any external libraries.
                </li>
                <li>
                    <strong>Small code base/size:</strong>
                    Hello World in ~4kb minified and gzipped
                </li>
            </ul>
        </div>
    </div>