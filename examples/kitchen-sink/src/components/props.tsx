import * as myra from 'myra'

/**
 * Props
 */
type Props = {
    foo: string
    bar: number
}

/**
 * Component
 */
export default myra.define({
    // The name of the component. Used for debugging purposes.
    name: 'PropsComponent',

    // Init takes either an initial model or a tuple of an initial model 
    // and one or more tasks to execute when the component is initialized.
    init: {},

    // This callback is optional and is called when the component is mounted or
    // re-mounted (if it's arguments has changed or if it's explicitly forced to 
    // re-mount). The props of the component are passed as the second argument.
    onMount: (state, _props: Props) => state,

    // The render function is called after an update. 
    render: ({ props }) =>
        <section>
            <h2>Props example</h2>
            <dl>
                <dt>The value of <code>props.foo</code> is:</dt>
                <dd>{props.foo}</dd>
                <dt>The value of <code>props.bar</code> is:</dt>
                <dd>{props.bar}</dd>
            </dl>
        </section>
})