import * as myra from '../../../../src/myra'

interface IProps {
    propA: number
    propB: string
    propC?: boolean
    forceUpdate: number
}

const defaultProps = {
    propC: true
}

export const Props = myra.define<IProps>((props) => {
    const {
        propA,
        propB,
        propC,
        children
    } = { ...defaultProps, ...props }

    // Use state to keep track of number of renders
    const [state, setState] = myra.useState(0)

    setState(state + 1)

    return (
        <section>
            <h2>Props</h2>
            <p>A demo of props and using <code>shouldRender</code> and <code>useDefaultProps</code>.</p>
            <dl>
                <dt>propA</dt>
                <dd>{propA}</dd>
                <dt>propB</dt>
                <dd>{propB}</dd>
                <dt>propC</dt>
                <dd>{propC ? 'true' : 'false'}</dd>
                <dt>children</dt>
                <dd>{children}</dd>
            </dl>
            <p>Rendered {state + 1} times</p>
        </section>
    )
})