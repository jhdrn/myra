import * as core from 'core'

/**
 * evolve
 */
describe('core.evolve', () => {
    it('leaves the original object untouched', () => {
        const obj = {
            a: 'A string'
        }
        core.evolve(obj, x => x.a = 'A new string')
        expect(obj).toEqual(obj)
    })

    it('only updates changed properties', () => {
        type EvolveTestObj = {
            a: string
            b: number
            c: string[]
            d: {
                e: string
            }
        }
        
        const obj: EvolveTestObj = {
            a: 'A string',
            b: 6,
            c: [],
            d: {
                e: 'Another string'
            }
        }

        const evolvedObj = core.evolve(obj, x => {
            x.a = 'An updated string'
        })

        expect(evolvedObj).toEqual({
            a: 'An updated string',
            b: 6,
            c: [],
            d: {
                e: 'Another string'
            }
        })
    })
})
