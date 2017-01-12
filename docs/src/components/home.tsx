import * as myra from 'myra'

import Navigation from './navigation'

export default () =>
    <div id="home">
        <div class="container">
            <h1>Myra</h1>
            <p class="lead">
                A simple and small Typescript framework for building web interfaces
            </p>
            <Navigation />

        </div>
        <div id="features">
            <div class="container">
                <h2>Features</h2>
                <ul>
                    <li>
                        <h3>Simple</h3>
                        <p>
                            Myra should be easy to learn as it's API and 
                            concepts are limited.
                        </p>
                    </li>
                    <li>
                        <h3>Small</h3>
                        <p>
                            Hello World in ~4kb minified and gzipped.
                            Also, no external dependencies.
                        </p>
                    </li>
                    <li>
                        <h3>Functional</h3>
                        <p>
                            Myra encourages functional programming and 
                            immutability for predictable behavior.
                        </p>
                    </li>
                </ul>
            </div>
        </div>
    </div>