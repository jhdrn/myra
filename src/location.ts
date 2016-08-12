import { task, broadcast, Task, Dispatch } from './core'

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
        return [path, Object.keys(params).map(key => [key, params![key]].map(encodeURIComponent).join("="))].join("&")
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

// /**
//  *
//  */
// function normalizeAndAddRoute(route: string, callback: Function): void {
//     var parameterNames = [];
//     var normalizedRoute = '^' + route.replace(/{\*.+}/i, function (match) {
//         parameterNames.push(match.substr(2, match.length - 3));
//         return "(.+)";
//     }) // {*path}
//         .replace(/{[^\/]+}/ig, function (match) {
//             parameterNames.push(match.substr(1, match.length - 2));
//             return "([^/]+)";
//         }) // {parameter}
//         .replace(/\*/g, '[^/]+') // *
//         .replace(/\//g, '\\/') // replace / with \/
//         + '$';

//     _routes.push({
//         normalizedRoute: normalizedRoute,
//         route: route,
//         callback: callback,
//         parameterNames: parameterNames
//     });
// }

/**
 *
 */
// function normalizePath(path: string): string {
//     if (path.match(/^(https?|ftp|file):\/\//)) {
//         return path;
//     }
//     return _window.location.protocol + '//' + _window.location.host + _basePath + trimSlashes(path);
// }

// function merge(obj1: object, obj2) {
//     var key;
//     for (key in obj2) {
//         obj1[key] = obj2[key];
//     }
// }

// /**
// * Returns any query parameters of the request as an object.
// */
// function getQueryParameters(): { [key: string]: string } {
//     var parameters: { [key: string]: string } = {};
//     if (_window.location.search) {
//         var kvps: string[] = _window.location.search.substring(1).split('&'),
//             kvp: string[],
//             key: string,
//             value: string;

//         for (var i = 0; i < kvps.length; i++) {
//             kvp = kvps[i].split('=');
//             key = kvp[0];
//             value = decodeURIComponent(kvp[1]);
//             parameters[key] = value;
//         }
//     }
//     return parameters;
// }
