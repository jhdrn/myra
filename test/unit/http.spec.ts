import { httpRequest, HttpResponse } from 'http'

const dispatch = (fn: any, args: any) => fn(undefined, args)

describe('http module', () => {

    beforeEach((done) => {
        done()
    })


    it('httpRequest calls success callback with HttpResponse as argument', done => {

        const mocks = {
            success: (m: any, response: HttpResponse) => {
                expect(response.data.name).toBe('myra')
                return m
            }
        }

        spyOn(mocks, 'success').and.callThrough()

        httpRequest(mocks.success, m => m, {
            method: 'GET',
            url: 'http://localhost:9876/base/test/test.json',
            responseType: 'json'
        }).execute(dispatch)

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
            url: 'http://localhost:9876/base/test/fail.json',
            responseType: 'json'
        }).execute(dispatch)

        setTimeout(() => {
            expect(mocks.error).toHaveBeenCalledTimes(1)
            done()
        }, 1000)
    })
})