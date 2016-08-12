import { task, Task, Update } from './core'

export { Task }

/**
 * Creates a task that dispatches a message with the current timestamp.
 */
export const now = <M>(success: Update<M, Date>) => 
    task(dispatch => dispatch(success, new Date()))


/**
 * Creates a task that starts sending @time_interval_tick messages
 * until a cancelInterval task is executed with the supplied handle.
 */
export const startInterval = <M>(interval: number, success: Update<M, Date>) => task(dispatch => {
    let handle: number
    handle = setInterval(() => {
        dispatch(success, handle)
    }, interval)
})

/**
 * Cancels the interval of the supplied handle.
 */
export const cancelInterval = <M>(handle: number, success?: Update<M, undefined>) => task(dispatch => {
    clearInterval(handle)
    if (success) {
        dispatch(success)
    }
})

/**
 * Creates a task that sets a timeout and sends a message when that timeout is met.
 */
export const delay = <M>(delay: number, started: Update<M, number>, ended:  Update<M, number>) => task(dispatch => {
    let handle: number
    handle = setTimeout(() => {
        dispatch(ended, handle)
    }, delay)
    dispatch(started, handle)
})

/**
 * Cancels the delay of the supplied handle.
 */
export const cancelDelay = <M>(handle: number, success?: Update<M, undefined>) => task(dispatch => {
    clearTimeout(handle)
    if (success) {
        dispatch(success)
    }
})