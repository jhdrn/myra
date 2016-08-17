import { task, broadcast, Task, Dispatch } from './core/index'

export { Task }
export type Params = { [key: string]: any }
export interface LocationData {
    // FIXME: Add all properties from window.location object
    url: string
    params: Params
}
export const LOCATION_CHANGED_MSG = '__locationChanged'

const broadcastLocationChanged = (dispatch: Dispatch) =>     
    broadcast(LOCATION_CHANGED_MSG, { 
        url: window.location.pathname, 
        params: searchStrToObj(window.location.search) 
    }).execute(dispatch)

export const trackLocationChanges = () => task((dispatch) => {
    broadcastLocationChanged(dispatch)
    
    window.onpopstate = (_) => {
        broadcastLocationChanged(dispatch)
    }
})
export const updateLocation = (path: string, params?: Params) => task((dispatch) => {
    const url = makeUrl(path, params)
    window.history.pushState({ url: url }, '', url)

    broadcastLocationChanged(dispatch)
})
export const replaceLocation = (path: string, params?: Params) => task((dispatch) => {
    const url = makeUrl(path, params)
    window.history.replaceState({ url: url }, '', url)

    broadcastLocationChanged(dispatch)
})

function makeUrl(path: string, params?: Params) {
    if (params) {
        const queryString = Object.keys(params).map(key => 
            [key, params![key]].map(encodeURIComponent).join('=')
        ).join('&')
        return `${path}?${queryString}`
    }
    return path
}

/**
 * Trims slashes and returns the trimmed string.
 */
const trimSlashes = (str: string) => !str ? '' : str.replace(/^\/+|\/+$/g, '')

/**
 * Tries to match a route for the given path.
 */
const matchPattern = (path: string, url: string) => !!new RegExp(createPattern(trimSlashes(path)), 'i').exec(url)

/**
 * Checks if the given pattern matches the location.
 */

export const matchLocation = (pattern: string, ...patterns: string[]): boolean => {
    
    const url = pattern.indexOf('#') === 0 ? trimSlashes(window.location.hash) :
        trimSlashes(window.location.pathname).split('&')[0]

    if (matchPattern(trimSlashes(pattern), url)) {
        return true
    } else if (patterns) {
        for (const i in patterns) {
            if (matchPattern(trimSlashes(patterns[i]), url)) {
                return true
            }
        }
    }
    return false
} 

function searchStrToObj(searchString: string) {
    if (!searchString) return {}

    return searchString
        .substring(1)
        .split('&')
        .reduce((acc, next) => {
            const [key, value] = next.split('=')
            acc[decodeURIComponent(key)] = decodeURIComponent(value)
            return acc;
        }, {} as { [key: string]: string })
}

function createPattern(route: string) {
    // var parameterNames = [];
    var normalizedRoute = '^' + route.replace(/{\*.+}/i, (_match) => {
        // parameterNames.push(match.substr(2, match.length - 3));
        return "(.+)";
    }) // {*path}
        .replace(/{[^\/]+}/ig, (_match) => {
            // parameterNames.push(match.substr(1, match.length - 2));
            return "([^/]+)";
        }) // {parameter}
        .replace(/\*/g, '[^/]+') // *
        .replace(/\//g, '\\/') // replace / with \/
        + '$'

   return normalizedRoute
} 