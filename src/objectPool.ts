const objectPool: object[] = []
const arrayPool: any[][] = []

export function getObj<T extends {}>(): T {
    if (objectPool.length === 0) {
        return {} as T
    }
    return objectPool.pop() as T
}

export function getArray<T extends {}>(): Array<T> {
    if (objectPool.length === 0) {
        return [] as Array<T>
    }
    return arrayPool.pop() as Array<T>
}

export function releaseObj(obj: any) {
    for (const key in obj) {
        delete obj[key]
    }
    objectPool.push(obj)
}

export function releaseArray(obj: any) {
    obj.length = 0
    arrayPool.push(obj)
}