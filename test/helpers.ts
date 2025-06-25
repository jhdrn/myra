export function flushEffects() {
    return new Promise(resolve => setTimeout(resolve, 0))
}
