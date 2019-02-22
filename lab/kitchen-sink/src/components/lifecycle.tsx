import * as myra from '../../../../src/myra'

export const Lifecycle = myra.withContext((_, ctx) => {
    const [, setState] = ctx.useState('')

    ctx.useLifecycle(console.log)

    return (
        <section>
            <h2>Life cycle events</h2>
            <p>Demo of <code>useLifecycle</code>. Life cycle events are logged to the console.</p>
            <p>
                <button onclick={() => setState('')}>Click me</button> to see the <code>willRender</code> and <code>didRender</code> events fire.
            </p>
        </section>
    )
})