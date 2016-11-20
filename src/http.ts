import { Apply, Update } from './core/index'
import { isIE9 } from './core/helpers'

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
export type Headers = { [header: string]: string }
export type ResponseType = '' | 'arraybuffer' | 'blob' | 'document' | 'json' | 'text'
export type RequestParams = {
    method?: HttpMethod
    url: string
    data?: any
    headers?: Headers
    responseType?: ResponseType
}

export interface HttpResponse<T> {
    status: number
    statusText: string
    data: T
    headers: Headers
}

export const httpRequest = <S, T>(params: RequestParams, success: Update<S, HttpResponse<T>>, failure: Update<S, HttpResponse<T>>) => {
    return (apply: Apply) => {
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
                catch (error) {
                    console.error(error)
                }
            }

            const responseData = {
                status: xhr.status,
                statusText: xhr.statusText,
                data: data,
                headers: headers
            }
            apply(xhr.status >= 200 && xhr.status < 300 ? success : failure, responseData)
        }
        const method = typeof params.method === 'undefined' ? 'GET' : params.method
        xhr.open(method, params.url)

        if (typeof params.headers !== 'undefined') {
            for (const header in params.headers) {
                if (params.headers.hasOwnProperty(header)) {
                    xhr.setRequestHeader(header, params.headers[header])
                }
            }
        }

        xhr.responseType = params.responseType || ''
        xhr.send(params.data)
    }
}
