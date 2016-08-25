import { task, broadcast, Task, Dispatch, NodeDescriptor, ComponentNodeDescriptor, ElementNodeDescriptor, TextNodeDescriptor, NothingNodeDescriptor  } from './core/index'
import { nothing } from './html' 

export { Task, ComponentNodeDescriptor, ElementNodeDescriptor, TextNodeDescriptor, NothingNodeDescriptor }
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

export const goBack = (steps?: number) => task(dispatch => {
    window.history.back(steps)
    broadcastLocationChanged(dispatch)
}) 

export const goForward = (steps?: number) => task(dispatch => {
    window.history.forward(steps)
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
const matchPattern = (pattern: string, url: string) => !!new RegExp(createPattern(trimSlashes(pattern)), 'i').exec(url)


// export const getLocationParams = (pattern: string) => {
//     // FIXME
//     console.log(new RegExp(createPattern(trimSlashes(pattern)), 'i').exec(window.location.hash || window.location.pathname))
// }

/**
 * Checks if the given pattern matches the location.
 */
export const matchLocation = (pattern: string, ...patterns: string[]): boolean => {
    
    const url = pattern.indexOf('#') === 0 ? trimSlashes(window.location.hash) :
        trimSlashes(window.location.pathname).split('&')[0]

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

export type RouteOptions = {
    [pattern: string]: NodeDescriptor
}
export const route = (opts: RouteOptions) => {
    for (const pattern in opts) {
        if (opts.hasOwnProperty(pattern) && matchLocation(pattern)) {
            const nodeDescriptor = opts[pattern] as NodeDescriptor
            if (nodeDescriptor.__type === 'component') {
                //nodeDescriptor.args = routeParams
            } 
            return nodeDescriptor
        }
    }
    return nothing()
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
        .replace(/:[^\/]+/ig, (_match) => {
            // parameterNames.push(match.substr(1, match.length - 2));
            return "([^/]+)";
        }) // {parameter}
        .replace(/\*/g, '[^/]+') // *
        .replace(/\//g, '\\/') // replace / with \/
        + '$'

   return normalizedRoute
} 