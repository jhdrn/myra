import * as myra from '../../../../src/myra'

export default (props: { test: string } & myra.ComponentProps) =>
    <div>
        <h2>Stateless component example</h2>
        <dl>
            <dt>The value of <code>props.test</code> is:</dt>
            <dd>{props.test}</dd>
        </dl>
        {props.children}
    </div>