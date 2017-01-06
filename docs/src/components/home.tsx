import * as myra from 'myra'

import Navigation from './navigation'

export default () =>
    <div id="home">
        <section id="section-intro">
            <div class="container">
                <h1>Myra</h1>
                <p class="lead">A simple and small Typescript framework for building web interfaces</p>
                <Navigation />
            </div>
        </section>
    </div>