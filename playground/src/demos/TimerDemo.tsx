import * as myra from 'myra'
import { useState, useEffect, ComponentProps } from 'myra'

function pad(n: number) {
    return String(n).padStart(2, '0')
}

function formatTime(ms: number) {
    const totalSecs = Math.floor(ms / 1000)
    const mins = Math.floor(totalSecs / 60)
    const secs = totalSecs % 60
    const cents = Math.floor((ms % 1000) / 10)
    return `${pad(mins)}:${pad(secs)}.${pad(cents)}`
}

export function TimerDemo(_props: ComponentProps): myra.VNode {
    const [elapsed, setElapsed] = useState(0)
    const [running, setRunning] = useState(false)

    // The effect re-runs whenever `running` changes.
    // When running=true  → starts the interval, returns cleanup that clears it.
    // When running=false → no interval is started; cleanup is a no-op.
    // On unmount          → cleanup runs regardless of running state.
    useEffect(() => {
        if (!running) return

        const start = Date.now() - elapsed
        const id = setInterval(() => {
            setElapsed(Date.now() - start)
        }, 16)

        return () => clearInterval(id)
    }, [running])

    const reset = () => {
        setRunning(false)
        setElapsed(0)
    }

    return (
        <div class="demo-grid">
            <div class="demo-card" style="max-width:360px">
                <h3>Stopwatch — <code>useEffect</code> cleanup</h3>
                <p>
                    The interval is started inside <code>useEffect</code> and
                    cleared in the cleanup function it returns. Cleanup runs when:
                </p>
                <ul style="font-size:.875rem;color:var(--text-muted);padding-left:1.25rem;margin:.25rem 0">
                    <li>the dep (<code>running</code>) changes, or</li>
                    <li>the component unmounts.</li>
                </ul>
                <p>
                    Without the cleanup, the interval would keep firing after
                    pause/unmount, leaking memory and mutating stale state.
                </p>

                <div class="timer-display" style="margin:.5rem 0">
                    {formatTime(elapsed)}
                </div>

                <div class="btn-row">
                    <button onclick={() => setRunning(v => !v)}>
                        {running ? 'Pause' : 'Start'}
                    </button>
                    <button class="secondary" onclick={reset} disabled={elapsed === 0 && !running}>
                        Reset
                    </button>
                </div>

                <p class="dom-note" style="margin-top:.75rem">
                    Navigate away (unmount) while running — the interval is
                    cleaned up automatically. Navigate back to start fresh.
                </p>
            </div>
        </div>
    )
}
