import { httpRequest, HttpResponse } from 'http'

const apply = (fn: any, args: any) => fn(undefined, args)

describe('http module', () => {

    beforeEach((done) => {
        done()
    })

    it('httpGet calls success callback with HttpResponse as argument', done => {

        const mocks = {
            success: (m: any, response: HttpResponse<any>) => {
                expect(JSON.parse(response.data).name).toBe('myra')
                return m
            }
        }

        spyOn(mocks, 'success').and.callThrough()

        httpRequest({
            url: '/base/test/test.json',
            responseType: 'text'
        }, mocks.success, m => m)(apply)

        setTimeout(() => {
            expect(mocks.success).toHaveBeenCalledTimes(1)
            done()
        }, 1000)
    })

    it('httpRequest calls error callback with HttpResponse as argument', done => {

        const mocks = {
            error: (m: any, response: HttpResponse<any>) => {
                expect(response.status).toBe(404)
                return m
            }
        }

        spyOn(mocks, 'error').and.callThrough()

        httpRequest({
            method: 'GET',
            url: '/base/test/fail.json',
            responseType: 'text'
        }, m => m, mocks.error)(apply)

        setTimeout(() => {
            expect(mocks.error).toHaveBeenCalledTimes(1)
            done()
        }, 1000)
    })


    it('httpPost calls error callback with HttpResponse as argument', done => {

        const mocks = {
            error: (m: any, response: HttpResponse<any>) => {
                expect(response.status).toBe(404)
                return m
            }
        }

        spyOn(mocks, 'error').and.callThrough()

        httpRequest({
            method: 'POST',
            url: '/base/test/fail',
            data: 'some data',
            headers: { 'Header': 'header value' },
            responseType: 'text'
        }, m => m, mocks.error)(apply)

        setTimeout(() => {
            expect(mocks.error).toHaveBeenCalledTimes(1)
            done()
        }, 1000)
    })

    it('httpPut calls error callback with HttpResponse as argument', done => {

        const mocks = {
            error: (m: any, response: HttpResponse<any>) => {
                expect(response.status).toBe(404)
                return m
            }
        }

        spyOn(mocks, 'error').and.callThrough()

        httpRequest({
            method: 'PUT',
            url: '/base/test/fail',
            data: 'some data',
            headers: { 'Header': 'header value' },
            responseType: 'text'
        }, m => m, mocks.error)(apply)

        setTimeout(() => {
            expect(mocks.error).toHaveBeenCalledTimes(1)
            done()
        }, 1000)
    })

    it('httpDelete calls error callback with HttpResponse as argument', done => {

        const mocks = {
            error: (m: any, response: HttpResponse<any>) => {
                expect(response.status).toBe(404)
                return m
            }
        }

        spyOn(mocks, 'error').and.callThrough()

        httpRequest({
            method: 'DELETE',
            url: '/base/test/fail',
            headers: { 'Header': 'header value' }
        }, m => m, mocks.error)(apply)

        setTimeout(() => {
            expect(mocks.error).toHaveBeenCalledTimes(1)
            done()
        }, 1000)
    })
})