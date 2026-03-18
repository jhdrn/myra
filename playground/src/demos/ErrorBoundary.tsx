import * as myra from 'myra'
import { useState, useErrorHandler, ComponentProps, VNode } from 'myra'

// A child that always throws when rendered
function BrokenChild(_props: ComponentProps): myra.VNode {
    throw new Error('Intentional render error from BrokenChild')
}

// A child that throws when a button is clicked (error in a state updater)
function ClickThrower(_props: ComponentProps): myra.VNode {
    const [, setState] = useState(0)

    const throwInUpdater = () => {
        setState(() => {
            throw new Error('Error thrown inside a state updater')
        })
    }

    return (
        <div class="demo-card" style="border-color:var(--success)">
            <p>This child is healthy. Click below to throw from a state updater.</p>
            <button class="danger" onclick={throwInUpdater}>Throw in updater</button>
        </div>
    )
}

export function ErrorBoundaryDemo(_props: ComponentProps): myra.VNode {
    const [caughtError, setCaughtError] = useState<string | null>(null)
    const [scenario, setScenario] = useState<'render' | 'updater' | null>(null)

    useErrorHandler((err): VNode => {
        // This handler is called when an error propagates to this component.
        // It returns an immediate fallback VNode. The setState below queues a
        // re-render that will show the full recovery UI.
        const msg = err instanceof Error ? err.message : String(err)
        setCaughtError(msg)
        return <div class="error-box">Catching error…</div>
    })

    const reset = () => {
        setCaughtError(null)
        setScenario(null)
    }

    if (caughtError !== null) {
        return (
            <div class="demo-grid">
                <div class="demo-card" style="border-color:var(--danger)">
                    <h3>Error caught</h3>
                    <div class="error-box">
                        <strong>Error:</strong> {caughtError}
                    </div>
                    <div class="btn-row" style="margin-top:.5rem">
                        <button onclick={reset}>Recover</button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div class="demo-grid">
            <div class="demo-card">
                <h3>Render-time error</h3>
                <p>
                    <code>useErrorHandler</code> registers a handler on this
                    component. When a child throws during render, the handler is
                    called with the error and returns a fallback VNode.
                </p>
                <div class="btn-row">
                    <button
                        class="danger"
                        onclick={() => setScenario('render')}
                    >
                        Mount broken child
                    </button>
                </div>
                {scenario === 'render' ? <BrokenChild /> : <nothing />}
            </div>

            <div class="demo-card">
                <h3>State-updater error</h3>
                <p>
                    Errors thrown inside a <code>setState</code> updater function
                    are also caught by the nearest <code>useErrorHandler</code>.
                </p>
                <div class="btn-row">
                    <button onclick={() => setScenario('updater')}>
                        Mount child
                    </button>
                </div>
                {scenario === 'updater' ? <ClickThrower /> : <nothing />}
            </div>
        </div>
    )
}
