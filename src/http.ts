import { task, Task, Dispatch, Update } from './core/index'
import { isIE9 } from './core/helpers'

export { Task }
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
export type Headers = { [header: string]: string }
export type ResponseType = '' | 'arraybuffer' | 'blob' | 'document' | 'json' | 'text'
export type RequestParams = {
    method: HttpMethod
    url: string
    data?: any
    headers?: Headers
    responseType?: ResponseType
}

export interface HttpResponse { 
    status: number
    statusText: string
    data: any
    headers: Headers 
}

export const httpRequest = <M>(success: Update<M, HttpResponse>, failure: Update<M, HttpResponse>, params: RequestParams) => {
    return task((dispatch: Dispatch) => {
        const xhr = new XMLHttpRequest()

        xhr.onload = () => {
            const headers = 
                xhr.getAllResponseHeaders()
                    .split('\r\n')
                    .filter(h => !!h)
                    .reduce((acc, header) => {
                        const [key, value] = header.split(': ')
                        acc[key] = value
                        return acc
                    }, {} as { [key: string]: string })
            
            // IE 9 does not populate xhr.response...
            let data = isIE9 ? xhr.responseText : xhr.response
            
            // IE is not honoring responseType = 'json', so manually parsing is
            // needed.
            if (params.responseType === 'json' && typeof data === 'string') {
                try {
                    data = JSON.parse(data)
                }
                catch(error) {
                    console.error(error)
                }
            }

            const responseData = { 
                status: xhr.status, 
                statusText: xhr.statusText,
                data: data,
                headers: headers
            }
            dispatch(xhr.status >= 200 && xhr.status < 300 ? success : failure, responseData)
        }
        xhr.open(params.method, params.url)
        if (typeof params.headers !== 'undefined') {
            for (const header in params.headers) {
                if (params.headers.hasOwnProperty(header)) {
                    xhr.setRequestHeader(header, params.headers[header])
                }
            }
        }
        
        xhr.responseType = params.responseType || ''
        xhr.send(params.data)
    })
}

/**
 * Creates a task that sends a GET HTTP request and dispatches a message when the response is received.
 */
export const httpGet = <M>(success: Update<M, HttpResponse>, failure: Update<M, HttpResponse>, url: string, headers?: Headers, responseType?: ResponseType) => 
    httpRequest(
        success,
        failure,
        {
            method: 'GET',
            url: url,
            headers: headers,
            responseType: responseType
        }
    )

/**
 * Creates a task that sends a POST HTTP request and dispatches a message when the response is received.
 */
export const httpPost = <M>(success: Update<M, HttpResponse>, failure: Update<M, HttpResponse>, url: string, data: any, headers?: Headers, responseType?: ResponseType) => 
    httpRequest(
        success,
        failure,
        {
            method: 'POST',
            url: url, 
            data: data, 
            headers: headers,
            responseType: responseType
        }
    )

/**
 * Creates a task that sends a PUT HTTP request and dispatches a message when the response is received.
 */
export const httpPut = <M>(success: Update<M, HttpResponse>, failure: Update<M, HttpResponse>, url: string, data: any, headers?: Headers, responseType?: ResponseType) => 
    httpRequest(
        success,
        failure,
        {
            method: 'PUT',
            url: url,
            data: data,
            headers: headers,
            responseType: responseType
        }
    )

/**
 * Creates a task that sends a DELETE HTTP request and dispatches a message when the response is received.
 */
export const httpDelete = <M>(success: Update<M, HttpResponse>, failure: Update<M, HttpResponse>, url: string, headers?: Headers) => 
    httpRequest(
        success,
        failure,
        {
            method: 'DELETE', 
            url: url, 
            headers: headers 
        }
    )