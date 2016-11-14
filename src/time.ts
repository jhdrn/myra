import { Update, Apply } from './core/index'

/**
 * Creates a task that dispatches a message with the current timestamp.
 */
export const now = <S>(success: Update<S, Date>) =>
    (dispatch: Apply) => dispatch(success, new Date())


/**
 * Creates a task that starts calling the supplied Update function
 * until a cancelInterval task is executed with the supplied handle.
 */
export const startInterval = <S>(interval: number, started: Update<S, number>, success: Update<S, Date>) =>
    (dispatch: Apply) => {
        let handle: number
        handle = setInterval(() => {
            dispatch(success, handle)
        }, interval)
        dispatch(started, handle)
    }

/**
 * Cancels the interval of the supplied handle.
 */
export const cancelInterval = <S>(handle: number, success?: Update<S, undefined>) =>
    (dispatch: Apply) => {
        clearInterval(handle)
        if (success) {
            dispatch(success)
        }
    }

/**
 * Creates a task that sets a timeout and sends a message when that timeout is met.
 */
export const startTimeout = <S>(delay: number, started: Update<S, number>, ended: Update<S, number>) =>
    (dispatch: Apply) => {
        let handle: number
        handle = setTimeout(() => {
            dispatch(ended, handle)
        }, delay)
        dispatch(started, handle)
    }

/**
 * Cancels the timeout of the supplied handle.
 */
export const cancelTimeout = <S>(handle: number, success?: Update<S, undefined>) =>
    (dispatch: Apply) => {
        clearTimeout(handle)
        if (success) {
            dispatch(success)
        }
    }