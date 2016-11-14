import { httpGet, httpPost, httpPut, httpDelete, httpRequest, HttpResponse } from 'http'

const dispatch = (fn: any, args: any) => fn(undefined, args)

describe('http module', () => {

    beforeEach((done) => {
        done()
    })

    it('httpGet calls success callback with HttpResponse as argument', done => {

        const mocks = {
            success: (m: any, response: HttpResponse) => {
                expect(JSON.parse(response.data).name).toBe('myra')
                return m
            }
        }

        spyOn(mocks, 'success').and.callThrough()

        httpGet(mocks.success, m => m, '/base/test/test.json', {}, 'text')(dispatch)

        setTimeout(() => {
            expect(mocks.success).toHaveBeenCalledTimes(1)
            done()
        }, 1000)
    })

    it('httpRequest calls error callback with HttpResponse as argument', done => {

        const mocks = {
            error: (m: any, response: HttpResponse) => {
                expect(response.status).toBe(404)
                return m
            }
        }

        spyOn(mocks, 'error').and.callThrough()

        httpRequest(m => m, mocks.error, {
            method: 'GET',
            url: '/base/test/fail.json',
            responseType: 'text'
        })(dispatch)

        setTimeout(() => {
            expect(mocks.error).toHaveBeenCalledTimes(1)
            done()
        }, 1000)
    })

    
    it('httpPost calls error callback with HttpResponse as argument', done => {

        const mocks = {
            error: (m: any, response: HttpResponse) => {
                expect(response.status).toBe(404)
                return m
            }
        }

        spyOn(mocks, 'error').and.callThrough()

        httpPost(m => m, mocks.error, '/base/test/fail', 'some data', { 'Header': 'header value'}, 'text')(dispatch)

        setTimeout(() => {
            expect(mocks.error).toHaveBeenCalledTimes(1)
            done()
        }, 1000)
    })
    
    it('httpPut calls error callback with HttpResponse as argument', done => {

        const mocks = {
            error: (m: any, response: HttpResponse) => {
                expect(response.status).toBe(404)
                return m
            }
        }

        spyOn(mocks, 'error').and.callThrough()

        httpPut(m => m, mocks.error, '/base/test/fail', 'some data', { 'Header': 'header value'}, 'text')(dispatch)

        setTimeout(() => {
            expect(mocks.error).toHaveBeenCalledTimes(1)
            done()
        }, 1000)
    })
    
    it('httpDelete calls error callback with HttpResponse as argument', done => {

        const mocks = {
            error: (m: any, response: HttpResponse) => {
                expect(response.status).toBe(404)
                return m
            }
        }

        spyOn(mocks, 'error').and.callThrough()

        httpDelete(m => m, mocks.error, '/base/test/fail', { 'Header': 'header value'})(dispatch)

        setTimeout(() => {
            expect(mocks.error).toHaveBeenCalledTimes(1)
            done()
        }, 1000)
    })
})