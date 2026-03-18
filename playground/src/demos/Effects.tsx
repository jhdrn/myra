import * as myra from 'myra'
import { useState, useEffect, useLayoutEffect, useRef, ComponentProps } from 'myra'

// Sub-component so we can observe true mount/unmount lifecycle
type LoggerProps = ComponentProps & { onLog: (msg: string) => void }

function LifecycleChild(props: LoggerProps): myra.VNode {
    const { onLog } = props

    useEffect(() => {
        onLog('mount — useEffect(fn, []) fired')
        return () => onLog('cleanup — component is unmounting')
    }, [])

    return <div class="demo-card" style="border-color: var(--success)">Child is mounted.</div>
}

type DepChildProps = ComponentProps & { dep: number; onLog: (msg: string) => void }

function DepChild(props: DepChildProps): myra.VNode {
    const { dep, onLog } = props

    useEffect(() => {
        onLog(`dep changed → ${dep}`)
    }, [dep])

    return <span>dep = <strong>{dep}</strong></span>
}

function LayoutMeasure(_props: ComponentProps): myra.VNode {
    const boxRef = useRef<HTMLDivElement>()
    const [size, setSize] = useState({ w: 0, h: 0 })
    const [width, setWidth] = useState(200)

    // Runs synchronously after render — no flicker
    useLayoutEffect(() => {
        if (boxRef.current) {
            const r = boxRef.current.getBoundingClientRect()
            setSize({ w: Math.round(r.width), h: Math.round(r.height) })
        }
    }, [width])

    return (
        <div style="display:flex;flex-direction:column;gap:.75rem">
            <p>Width measured synchronously after render — no flicker between render and read.</p>
            <div
                ref={boxRef}
                class="measure-box"
                style={`width:${width}px`}
            >
                {width}px wide
            </div>
            <div class="btn-row">
                <button onclick={() => setWidth(w => Math.max(80, w - 40))}>Shrink</button>
                <button onclick={() => setWidth(w => Math.min(500, w + 40))}>Grow</button>
            </div>
            <p>
                Measured: <strong>{size.w} × {size.h} px</strong>
            </p>
        </div>
    )
}

export function Effects(_props: ComponentProps): myra.VNode {
    const [logs, setLogs] = useState<string[]>(['(toggle the child to see lifecycle events)'])
    const [showChild, setShowChild] = useState(false)
    const [dep, setDep] = useState(0)

    const addLog = (msg: string) =>
        setLogs(prev => [...prev.slice(-8), `[${new Date().toLocaleTimeString()}] ${msg}`])

    return (
        <div class="demo-grid">
            <div class="demo-card">
                <h3>Mount / unmount — <code>useEffect(fn, [])</code></h3>
                <p>
                    Empty dep array means: run once on mount, run cleanup on unmount.
                </p>
                <div class="btn-row">
                    <button onclick={() => setShowChild(v => !v)}>
                        {showChild ? 'Unmount child' : 'Mount child'}
                    </button>
                    <button class="secondary" onclick={() => setLogs([])}>Clear</button>
                </div>
                {showChild
                    ? <LifecycleChild onLog={addLog} />
                    : <nothing />
                }
                <pre class="log-panel">{logs.join('\n')}</pre>
            </div>

            <div class="demo-card">
                <h3>Dep array — <code>useEffect(fn, [dep])</code></h3>
                <p>
                    Effect runs only when <code>dep</code> changes (deep equality
                    check via <code>equal()</code>).
                </p>
                <div class="btn-row">
                    <DepChild dep={dep} onLog={addLog} />
                    <button onclick={() => setDep(d => d + 1)}>Change dep</button>
                </div>
                <pre class="log-panel">{logs.join('\n')}</pre>
            </div>

            <div class="demo-card">
                <h3>Synchronous DOM measurement — <code>useLayoutEffect</code></h3>
                <p>
                    Fires <em>before</em> the browser paints, so DOM reads happen
                    without a visible layout shift.
                </p>
                <LayoutMeasure />
            </div>
        </div>
    )
}
