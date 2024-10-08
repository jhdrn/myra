import { equal, typeOf } from '../src/helpers'
import { expect } from 'chai'

describe('core.helpers.equal', () => {

    it('equals string against string', () => {
        expect(equal('', '')).to.be.eq(true)
    })

    it('equals null against null', () => {
        expect(equal(null, null)).to.be.eq(true)
    })

    it('equals undefined against undefined', () => {
        expect(equal(undefined, undefined)).to.be.eq(true)
    })

    it('equals boolean against boolean', () => {
        expect(equal(false, false)).to.be.eq(true)
    })

    it('equals number against number', () => {
        expect(equal(65.43, 65.43)).to.be.eq(true)
    })

    it('equals array against array', () => {
        const a1 = ['a', 5, true, undefined, null]
        const a2 = ['a', 5, true, undefined, null]
        expect(equal(a1, a2)).to.be.eq(true)
    })

    it('equals array against itself', () => {
        const a1 = ['a', 5, true, undefined, null]
        const a2 = a1
        a1[2] = false
        expect(equal(a1, a2)).to.be.eq(true)
    })

    it('equals object against object', () => {
        const o1 = { a: 'a', b: 5, c: true, d: undefined, e: null }
        const o2 = { a: 'a', b: 5, c: true, d: undefined, e: null }
        expect(equal(o1, o2)).to.be.eq(true)
    })

    it('equals object against itself', () => {
        const o1 = { a: 'a', b: 5, c: true, d: undefined, e: null }
        const o2 = o1
        o2.c = false
        expect(equal(o1, o2)).to.be.eq(true)
    })
    it('equals date against date', () => {
        const d1 = new Date('2016-01-01')
        const d2 = new Date('2016-01-01')

        expect(equal(d1, d2)).to.be.eq(true)
    })

    it('equals regexp against regexp', () => {
        const r1 = /^.*$/
        const r2 = /^.*$/

        expect(equal(r1, r2)).to.be.eq(true)
    })

    it('equals other type against itself', () => {
        const x1 = document.createElement("div")

        expect(equal(x1, x1)).to.be.eq(true)
    })

    it('equals anonymous function against itself', () => {
        const fn = () => { }
        expect(equal(fn, fn)).to.be.eq(true)
    })

    it('equals named function against itself', () => {
        const fn = function withName() { }
        expect(equal(fn, fn)).to.be.eq(true)
    })

    it('does not equal different anonymous functions', () => {
        const r1 = function () { }
        const r2 = function () { }

        expect(equal(r1, r2)).to.be.eq(false)
    })

    it('does not equal different functions with the same name', () => {
        const r1 = function withName() { }
        const r2 = function withName() { }

        expect(equal(r1, r2)).to.be.eq(false)
    })

    it('does not equal string against undefined', () => {
        expect(equal('a string', undefined)).to.be.eq(false)
    })

    it('does not equal false against true', () => {
        expect(equal(false, true)).to.be.eq(false)
    })

    it('does not equal object against non-equal object', () => {
        const o1 = { a: 'a', b: 5, c: false, d: undefined, e: null }
        const o2 = { a: 'a', b: 5, c: true, d: undefined, e: null }
        expect(equal(o1, o2)).to.be.eq(false)
    })

    it('does not equal object against object with missing property', () => {
        const o1 = { a: 'a', b: 5, c: true, d: undefined, e: null }
        const o2 = { a: 'a', b: 5, c: true, d: undefined }
        expect(equal(o1, o2)).to.be.eq(false)
    })

    it('does not equal object against undefined', () => {
        expect(equal({ test: 'a string' }, undefined)).to.be.eq(false)
    })

    it('does not equal array against array with different values', () => {
        const a1 = ['a', 5.01, true, undefined, null]
        const a2 = ['a', 5, true, undefined, null]
        expect(equal(a1, a2)).to.be.eq(false)
    })

    it('does not equal array against array with different length', () => {
        const a1 = ['a', 5, true, undefined]
        const a2 = ['a', 5, true, undefined, null]
        expect(equal(a1, a2)).to.be.eq(false)
    })

    it('does not equal date against different date', () => {
        const d1 = new Date('2015-01-01')
        const d2 = new Date('2016-01-01')

        expect(equal(d1, d2)).to.be.eq(false)
    })

    it('does not equal regexp against different regexp', () => {
        const r1 = /^.*$/
        const r2 = /^.+$/

        expect(equal(r1, r2)).to.be.eq(false)
    })

    it('does not equal different types', () => {
        const a = 'A string'
        const b = 254

        expect(equal(a, b as any)).to.be.eq(false)
    })
})

// describe('core.helpers.max', () => {
//     it('returns max', () => {
//         expect(max(66, 22)).to.be.eq(66)
//     })

//     it('returns max of negative numbers', () => {
//         expect(max(-51, -2)).to.be.eq(-2)
//     })
// })

describe('core.helpers.typeOf', () => {

    it('identifies an array', () => {
        expect(typeOf([])).to.be.eq('array')
    })

    it('identifies an object', () => {
        expect(typeOf({})).to.be.eq('object')
    })

    it('identifies a string', () => {
        expect(typeOf('test string')).to.be.eq('string')
    })

    it('identifies a date', () => {
        expect(typeOf(new Date())).to.be.eq('date')
    })

    it('identifies a regexp', () => {
        expect(typeOf(/^.*$/)).to.be.eq('regexp')
    })

    it('identifies a function', () => {
        expect(typeOf(() => 0)).to.be.eq('function')
    })

    it('identifies true as a boolean', () => {
        expect(typeOf(true)).to.be.eq('boolean')
    })

    it('identifies false as a boolean', () => {
        expect(typeOf(false)).to.be.eq('boolean')
    })

    it('identifies a number', () => {
        expect(typeOf(1235)).to.be.eq('number')
    })

    it('identifies null', () => {
        expect(typeOf(null)).to.be.eq('null')
    })

    it('identifies undefined', () => {
        expect(typeOf(undefined)).to.be.eq('undefined')
    })
})