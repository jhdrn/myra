import { Update, Dispatch, NodeDescriptor, ComponentContext } from './contract'

export interface Render {
    (parentNode: Element, view: NodeDescriptor, oldView: NodeDescriptor | undefined, oldRootNode: Node, dispatch: Dispatch): Node
}

export function dispatch<M, A>(fn: Update<M, A>, arg: A | undefined, context: ComponentContext<M, A>, render: Render) {

    if (context.isUpdating) {
        throw `${context.name}: Dispatch error - the dispatch function may not be called during an update. Doing so would most likely corrupt the model state.`
    }
    
    context.dispatchLevel++

    context.isUpdating = true

    const result = fn(context.model!, arg)
    
    context.isUpdating = false

    const dispatchFn = (fn: Update<M, A>, arg: A | undefined) => dispatch(fn, arg, context, render)

    if (Array.isArray(result)) {
        const [newModel, task] = result

        context.model = newModel

        if (Array.isArray(task)) {
            task.forEach(t => t.execute(dispatchFn))
        }
        else if (typeof task === 'undefined') {
            console.warn(`${context.name}: Task is undefined.`)
        }
        else {
            task.execute(dispatchFn)
        }
    }
    else {
        context.model = result
    }
    
    // Update view if the component was already mounted
    if (context.mounted && context.dispatchLevel === 1) {
        
        const newView = context.view(context.model!) || { __type: 'comment', comment: `Component: ${context.name}` }

        context.rootNode = render(context.parentNode, newView, context.oldView, context.rootNode, dispatchFn)
        context.oldView = newView
    }
    
    context.dispatchLevel--
}
