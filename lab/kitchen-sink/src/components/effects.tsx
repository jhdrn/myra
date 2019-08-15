import * as myra from '../../../../src/myra'
// function sleep(ms: number) {
//     return new Promise(resolve => setTimeout(resolve, ms))
// }
interface Props {
    forceUpdate: number
}

// const it = 3000000

export const Effects = (_: Props) => {
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
        console.debug('useLayoutEffect', ref.node);

        (ref.node as HTMLElement).style.color = 'red'
        return () => {
            console.log('useLayoutEffect cleanup')
        }
    }, s)

    myra.useEffect(() => {
        async function x() {
            await new Promise(() => {
                // for (let i = 0; i < it; i++) {
                (ref.node as HTMLElement).style.color = 'blue'
                // }
            })
        }
        x()
        console.debug('useEffect', ref.node)
        return () => {
            console.log('useEffect cleanup')
        }
    }, value)

    myra.useEffect(() => {
        if (s < 100) {
            setState(s + 1)
        }
    })

    return (
        <section>
            <h2>Effects</h2>
            <p>Demo of <code>useEffect</code> and <code>useLayoutEffect</code>.</p>
            <p>
                {s}
                <button onclick={() => setState(s + 1)}>Click me</button> to see the layout effect/cleanup.
                <textarea oninput={ev => setValue((ev.target as HTMLTextAreaElement).value)} cols="50" rows="3">{value}</textarea>
            </p>
        </section>
    )
}
