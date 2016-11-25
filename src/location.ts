import { Map, Update, Apply } from './core/index'
import { typeOf } from './core/helpers'

export type PatternMap<T> = {
    [pattern: string]: T | ((params: Map<string>) => T)
}
export interface LocationContext {
    // FIXME: Add all properties from window.location object
    readonly url: string
    readonly params: Map<string>
    readonly match: (pattern: string) => boolean
    readonly matchAny: <T>(patterns: PatternMap<T>, defaultValue: T) => T
}

/**
 * Trims slashes and returns the trimmed string.
 */
const trimSlashes = (str: string) => !str ? '' : str.replace(/^\/+|\/+$/g, '')

/**
 * Tries to match a route for the given path.
 */
const matchPattern = (pattern: string, url: string) => {
    const [regexp,] = createRegExpFromPattern(trimSlashes(pattern))
    return !!new RegExp(regexp, 'i').exec(url)
}

/**
 * Checks if the given pattern matches the location.
 */
const matchLocation = (location: Location, pattern: string, ...patterns: string[]): boolean => {

    const url = pattern.indexOf('#') === 0 ? trimSlashes(location.hash) :
        trimSlashes(location.pathname).split('&')[0]

    if (matchPattern(pattern, url)) {
        return true
    } else if (patterns) {
        for (const i in patterns) {
            if (matchPattern(patterns[i], url)) {
                return true
            }
        }
    }
    return false
}

function getLocationContext(location: Location) {
    return {
        url: location.pathname,
        params: searchStrToObj(location.search),
        match: (pattern: string) => matchLocation(location, pattern),
        matchAny: <T>(patterns: PatternMap<T>, defaultValue: T): T => {
            for (const pattern in patterns) {
                if (patterns.hasOwnProperty(pattern)) {
                    const [regexp, paramNames] = createRegExpFromPattern(trimSlashes(pattern))
                    const matches = new RegExp(regexp, 'i').exec(trimSlashes(location.pathname || location.hash))
                    if (matches) {
                        const fnOrVal = patterns[pattern] as T
                        if (typeOf(fnOrVal) === 'function') {
                            const params: Map<string> = {}
                            paramNames.forEach((p, i) => params[p] = matches[i + 1])
                            return (fnOrVal as any)(params)
                        }
                        return fnOrVal
                    }
                }
            }
            return defaultValue
        }
    }
}

const tracked: [Apply, Update<any, LocationContext>][] = []

function applyTracked() {
    const ctx = getLocationContext(window.location)
    for (const [apply, update] of tracked) {
        apply(update, ctx)
    }
}

export const trackLocationChanges = <S>(update: Update<S, LocationContext>) => (apply: Apply) => {

    tracked.push([apply, update])

    apply(update, getLocationContext(window.location))

    window.onpopstate = (_) => {
        apply(update, getLocationContext(window.location))
    }
}



export const updateLocation = (path: string, params?: Map<string>) => (_: Apply) => {
    const url = makeUrl(path, params)
    window.history.pushState({ url: url }, '', url)

    applyTracked()
}

export const replaceLocation = (path: string, params?: Map<string>) => (_: Apply) => {
    const url = makeUrl(path, params)
    window.history.replaceState({ url: url }, '', url)

    applyTracked()
}

export const goBack = (steps?: number) => (_: Apply) => {
    window.history.back(steps)

    applyTracked()
}

export const goForward = (steps?: number) => (_: Apply) => {
    window.history.forward(steps)
    applyTracked()
}

function makeUrl(path: string, params?: Map<string>) {
    if (params) {
        const queryString = Object.keys(params).map(key =>
            [key, params![key]].map(encodeURIComponent).join('=')
        ).join('&')
        return `${path}?${queryString}`
    }
    return path
}

function searchStrToObj(searchString: string) {
    if (!searchString) {
        return {}
    }

    return searchString
        .substring(1)
        .split('&')
        .reduce((acc, next) => {
            const [key, value] = next.split('=')
            acc[decodeURIComponent(key)] = decodeURIComponent(value)
            return acc
        }, {} as { [key: string]: string })
}

function createRegExpFromPattern(route: string): [string, string[]] {
    const parameterNames: string[] = [];
    var normalizedRoute = '^' + route.replace(/\*.+/i, (match) => {
        parameterNames.push(match.substr(2, match.length - 2))
        return '(.+)'
    }) // *path
        .replace(/:[^\/]+/ig, (match) => {
            parameterNames.push(match.substr(1, match.length - 1))
            return '([^/]+)'
        }) // :parameter
        .replace(/\*/g, '[^/]+') // *
        .replace(/\//g, '\\/') // replace / with \/
        + '$'

    return [normalizedRoute, parameterNames]
} 