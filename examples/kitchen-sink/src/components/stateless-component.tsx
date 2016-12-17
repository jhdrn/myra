import * as myra from 'myra'

export default (props: { test: string }) =>
    <div>
        <h2>Stateless component example</h2>
        <dl>
            <dt>The value of <code>props.test</code> is:</dt>
            <dd>{props.test}</dd>
        </dl>
    </div>