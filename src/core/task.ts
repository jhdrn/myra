
import { Task, Dispatch } from './contract'

class TaskImpl implements Task {
    constructor(private fn: (dispatch: Dispatch) => void) {
    }

    execute(dispatch: Dispatch): void {
        this.fn(dispatch)
    }
}

/** Creates a task. */
export function task(fn: (dispatch: Dispatch) => void): Task {
    return new TaskImpl(fn)
}