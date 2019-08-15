import * as myra from '../../../../src/myra'
// function sleep(ms: number) {
//     return new Promise(resolve => setTimeout(resolve, ms))
// }
interface Props {
    forceUpdate: number
}

// const it = 3000000

export const Tasks = (_: Props) => {
    const [firstRender, setRendered] = myra.useState(true)
    setRendered(false)
    const ref = myra.useRef()
    console.debug('firstRender', firstRender)

    const [s, setState] = myra.useState(0)

    const [value, setValue] = myra.useState('')

    myra.useLayoutEffect(() => {

        // for (let i = 0; i < it; i++) {
        //     (ref.node as HTMLElement).style.color = 'red'
        // }
        console.debug('useTask', ref.node);
        return () => {
            console.log('useTask cleanup')
        }
    }, s)

    myra.useEffect(() => {
        async function x() {
            await new Promise(() => {
                // for (let i = 0; i < it; i++) {
                (ref.node as HTMLElement).style.color = 'red'
                // }
            })
        }
        x()
        console.debug('useAsyncTask', ref.node)
        return () => {
            console.log('useAsyncTask cleanup')
        }
    }, value)

    return (
        <section>
            <h2>Life cycle events</h2>
            <p>Demo of <code>useLifecycle</code>. Life cycle events are logged to the console.</p>
            <p>
                {s}
                <button onclick={() => setState(s + 1)}>Click me</button> to see the <code>beforeRender</code> and <code>afterRender</code> events fire.
                <textarea oninput={ev => setValue((ev.target as HTMLTextAreaElement).value)} cols="50" rows="3">{value}</textarea>
            </p>
        </section>
    )
}
