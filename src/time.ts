import { task, Task, Update } from './core/index'

export { Task }

/**
 * Creates a task that dispatches a message with the current timestamp.
 */
export const now = <M>(success: Update<M, Date>) => 
    task(dispatch => dispatch(success, new Date()))


/**
 * Creates a task that starts calling the supplied Update function
 * until a cancelInterval task is executed with the supplied handle.
 */
export const startInterval = <M>(interval: number, started: Update<M, number>, success: Update<M, Date>) => 
    task(dispatch => {
        let handle: number
        handle = setInterval(() => {
            dispatch(success, handle)
        }, interval)
        dispatch(started, handle)
    })

/**
 * Cancels the interval of the supplied handle.
 */
export const cancelInterval = <M>(handle: number, success?: Update<M, undefined>) => 
    task(dispatch => {
        clearInterval(handle)
        if (success) {
            dispatch(success)
        }
    })

/**
 * Creates a task that sets a timeout and sends a message when that timeout is met.
 */
export const startTimeout = <M>(delay: number, started: Update<M, number>, ended: Update<M, number>) => 
    task(dispatch => {
        let handle: number
        handle = setTimeout(() => {
            dispatch(ended, handle)
        }, delay)
        dispatch(started, handle)
    })

/**
 * Cancels the timeout of the supplied handle.
 */
export const cancelTimeout = <M>(handle: number, success?: Update<M, undefined>) => 
    task(dispatch => {
        clearTimeout(handle)
        if (success) {
            dispatch(success)
        }
    })