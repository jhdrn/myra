import * as myra from '../../../../src/myra'
function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

export const Lifecycle = myra.useContext((_, ctx) => {
    const [, setState] = ctx.useState('')

    ctx.useLifecycle(async ev => {
        if (ev === 'didRender') {
            await sleep(1000)
        }
        console.log(ev)
    })

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