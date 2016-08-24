import { equal, max, typeOf, evolve, deepCopy, flatten } from 'core/helpers'


describe('core.helpers.equal', () => {

    it('equals string against string', () => {
        expect(equal('', '')).toBe(true)
    })

    it('equals null against null', () => {
        expect(equal(null, null)).toBe(true)
    })

    it('equals undefined against undefined', () => {
        expect(equal(undefined, undefined)).toBe(true)
    })

    it('equals boolean against boolean', () => {
        expect(equal(false, false)).toBe(true)
    })

    it('equals number against number', () => {
        expect(equal(65.43, 65.43)).toBe(true)
    })

    it('equals array against array', () => {
        const a1 = ['a', 5, true, undefined, null]
        const a2 = ['a', 5, true, undefined, null]
        expect(equal(a1, a2)).toBe(true)
    })

    it('equals object against object', () => {
        const o1 = { a: 'a', b: 5, c: true, d: undefined, e: null }
        const o2 = { a: 'a', b: 5, c: true, d: undefined, e: null }
        expect(equal(o1, o2)).toBe(true)
    })

    it('equals date against date', () => {
        const d1 = new Date('2016-01-01')
        const d2 = new Date('2016-01-01')
        
        expect(equal(d1, d2)).toBe(true)
    })

    it('equals regexp against regexp', () => {
        const r1 = /^.*$/
        const r2 = /^.*$/
        
        expect(equal(r1, r2)).toBe(true)
    })

    it('does not equal string against undefined', () => {
        expect(equal('a string', undefined)).toBe(false)
    })

    it('does not equal false against true', () => {
        expect(equal(false, true)).toBe(false)
    })

    it('does not equal object against non-equal object', () => {
        const o1 = { a: 'a', b: 5, c: false, d: undefined, e: null }
        const o2 = { a: 'a', b: 5, c: true, d: undefined, e: null }
        expect(equal(o1, o2)).toBe(false)
    })

    it('does not equal object against object with missing property', () => {
        const o1 = { a: 'a', b: 5, c: true, d: undefined, e: null }
        const o2 = { a: 'a', b: 5, c: true, d: undefined }
        expect(equal(o1, o2)).toBe(false)
    })

    it('does not equal array against array with different values', () => {
        const a1 = ['a', 5.01, true, undefined, null]
        const a2 = ['a', 5, true, undefined, null]
        expect(equal(a1, a2)).toBe(false)
    })

    it('does not equal array against array with different length', () => {
        const a1 = ['a', 5, true, undefined]
        const a2 = ['a', 5, true, undefined, null]
        expect(equal(a1, a2)).toBe(false)
    })

    it('does not equal date against different date', () => {
        const d1 = new Date('2015-01-01')
        const d2 = new Date('2016-01-01')
        
        expect(equal(d1, d2)).toBe(false)
    })

    it('does not equal regexp against different regexp', () => {
        const r1 = /^.*$/
        const r2 = /^.+$/
        
        expect(equal(r1, r2)).toBe(false)
    })

    
    it('does not equal different types', () => {
        const a = 'A string'
        const b = 254
        
        expect(equal(a, b as any)).toBe(false)
    })
    //FIXME: functions?
})

describe('core.helpers.max', () => {
    it('returns max', () => {
        expect(max(66, 22)).toBe(66)
    })
    
    it('returns max of negative numbers', () => {
        expect(max(-51, -2)).toBe(-2)
    })
})

describe('core.helpers.typeOf', () => {

    it('identifies an array', () => {
        expect(typeOf([])).toBe('array')
    })
    
    it('identifies an object', () => {
        expect(typeOf({})).toBe('object')
    })

    it('identifies a string', () => {
        expect(typeOf('test string')).toBe('string')
    })

    it('identifies a date', () => {
        expect(typeOf(new Date())).toBe('date')
    })

    it('identifies a regexp', () => {
        expect(typeOf(/^.*$/)).toBe('regexp')
    })

    it('identifies a function', () => {
        expect(typeOf(() => 0)).toBe('function')
    })

    it('identifies true as a boolean', () => {
        expect(typeOf(true)).toBe('boolean')
    })

    it('identifies false as a boolean', () => {
        expect(typeOf(false)).toBe('boolean')
    })

    it('identifies a number', () => {
        expect(typeOf(1235)).toBe('number')
    })

    it('identifies null', () => {
        expect(typeOf(null)).toBe('null')
    })

    it('identifies undefined', () => {
        expect(typeOf(undefined)).toBe('undefined')
    })
})

describe('core.helpers.deepCopy', () => {

    it('copies a deep hierarchy', () => {
        const obj = {
            a: 'A string',
            b: {
                c: [1, 2, 6, 10]
            },
            d: new Date()
        }
        const objCopy = deepCopy(obj)
        
        expect(JSON.stringify(objCopy)).toEqual(JSON.stringify(obj))
        expect(objCopy).not.toBe(obj)
    })

    it('throws if trying to copy a function', () => {
        const obj = {
            a: () => 'foo'
        }
        expect(() => deepCopy(obj)).toThrow()
    })
})


describe('core.helpers.evolve', () => {
    it('leaves the original object untouched', () => {
        const obj = {
            a: 'A string'
        }
        evolve(obj, x => x.a = 'A new string')
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

        const evolvedObj = evolve(obj, x => {
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


describe('core.helpers.flatten', () => {
    it('flattens a multidimensional array', () => {
        const multidimensional = 
            [
                'a',
                [
                    'b',
                    [
                        'c'
                    ],
                    'd'
                ],
                'e'
            ]

        expect(flatten(multidimensional)).toEqual(['a', 'b', 'c', 'd', 'e'])
    })
})