import { now, startTimeout, cancelTimeout, startInterval, cancelInterval } from 'time'

const dispatch = (fn: any, args: any) => fn(undefined, args)

describe('time module', () => {

    beforeEach(() => {
        jasmine.clock().install()
    })

    afterEach(() => {
        jasmine.clock().uninstall()
    })

    it('now executes the given Update function with the current timestamp', () => {
        const testNow = new Date()
        const mocks = {
            success: (m: any, now: Date) => {
                expect(now.toUTCString()).toBe(testNow.toUTCString())
                return m
            }
        }

        spyOn(mocks, 'success').and.callThrough()

        now(mocks.success)(dispatch)
        expect(mocks.success).toHaveBeenCalledTimes(1)

    })

    it('delay executes callbacks before and after timeout', () => {
        const mocks = {
            started: (m: any) => m,
            ended: (m: any) => m
        }

        spyOn(mocks, 'started')
        spyOn(mocks, 'ended')

        startTimeout(500, mocks.started, mocks.ended)(dispatch)
        expect(mocks.started).toHaveBeenCalledTimes(1)

        expect(mocks.ended).not.toHaveBeenCalled()

        jasmine.clock().tick(501)
        expect(mocks.ended).toHaveBeenCalledTimes(1)
    })

    it('cancelDelay clears timeout', () => {
        let delayHandle = -1
        const mocks = {
            started: (m: any, handle: number) => {
                delayHandle = handle
                return m
            },
            ended: (m: any) => m,
            canceled: (m: any) => m
        }

        spyOn(mocks, 'ended')
        spyOn(mocks, 'canceled')

        startTimeout(500, mocks.started, mocks.ended)(dispatch)

        jasmine.clock().tick(200)

        expect(delayHandle).not.toBe(-1)
        
        cancelTimeout(delayHandle, mocks.canceled)(dispatch)

        expect(mocks.canceled).toHaveBeenCalledTimes(1)

        jasmine.clock().tick(301)

        expect(mocks.ended).not.toHaveBeenCalled()
    })

    it('startInterval executes callbacks before and after timeout', () => {
        const mocks = {
            started: (m: any) => m,
            tick: (m: any) => m
        }

        spyOn(mocks, 'started')
        spyOn(mocks, 'tick')

        startInterval(50, mocks.started, mocks.tick)(dispatch)
        expect(mocks.started).toHaveBeenCalledTimes(1)

        expect(mocks.tick).not.toHaveBeenCalled()

        jasmine.clock().tick(51)
        jasmine.clock().tick(50)
        jasmine.clock().tick(50)

        expect(mocks.tick).toHaveBeenCalledTimes(3)
    })

    it('cancelInterval clears timeout', () => {
        let intervalHandle = -1
        const mocks = {
            started: (m: any, handle: number) => {
                intervalHandle = handle
                return m
            },
            tick: (m: any) => m,
            canceled: (m: any) => m
        }

        spyOn(mocks, 'tick')
        spyOn(mocks, 'canceled')

        startInterval(50, mocks.started, mocks.tick)(dispatch)

        jasmine.clock().tick(101)

        expect(intervalHandle).not.toBe(-1)
        
        cancelInterval(intervalHandle, mocks.canceled)(dispatch)

        expect(mocks.canceled).toHaveBeenCalledTimes(1)

        jasmine.clock().tick(100)

        expect(mocks.tick).toHaveBeenCalledTimes(2)
    })
})