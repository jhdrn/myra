/**
 * Creates a new object by shallow copying the arguments. The second argument's 
 * properties will have precedence over the first's. 
 * 
 * All non-primitive properties are copied by reference).
 */
export function evolve<T>(first: T, evolve: (obj: T) => void): T {
    const second = {} as T
    evolve(second)

    let result: any = {};
    for (let prop in first) {
        if (first.hasOwnProperty(prop)) {
            result[prop] = (first as any)[prop];
        }
    }
    for (let prop in second) {
        if (second.hasOwnProperty(prop)) {
            result[prop] = (second as any)[prop];
        }
    }
    return result as T;
}