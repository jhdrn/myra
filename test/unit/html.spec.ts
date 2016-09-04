import * as core from 'core'
import { nothing, text } from 'html'
import * as html from 'html/elements'

describe('Node descriptor helpers', () => {

    it('nothing returns a NothingNodeDescriptor', () => {
        expect(nothing()).toEqual({
            __type: 'nothing',
        } as core.NothingNodeDescriptor)
    })

    it('creates a TextNodeDescriptor', () => {
        expect(text('some text')).toEqual({
            __type: 'text',
            value: 'some text'
        } as core.TextNodeDescriptor)
    })

    it('creates a TextNodeDescriptor and converts the argument to a string', () => {
        expect(text(5)).toEqual({
            __type: 'text',
            value: '5'
        } as core.TextNodeDescriptor)
    })

    it('creates a TextNodeDescriptor and converts undefined to an empty string', () => {
        expect(text(undefined)).toEqual({
            __type: 'text',
            value: ''
        } as core.TextNodeDescriptor)
    })

    it('creates a TextNodeDescriptor and converts null to an empty string', () => {
        expect(text(null)).toEqual({
            __type: 'text',
            value: ''
        } as core.TextNodeDescriptor)
    })

    it('creates an ElementNodeDescriptor with the supplied tagName', () => {
        expect(html.el('div')).toEqual({
            __type: 'element',
            tagName: 'div',
            attributes: {},
            children: []
        } as core.ElementNodeDescriptor)
    })

    it('creates an ElementNodeDescriptor and sets attributes', () => {
        expect(html.el('div', { 'class': 'test', id: 'test' })).toEqual({
            __type: 'element',
            tagName: 'div',
            attributes: {
                'class': 'test',
                id: 'test'
            },
            children: []
        } as core.ElementNodeDescriptor)
    })

    it('creates an ElementNodeDescriptor and adds a TextNodeDescriptor child', () => {
        expect(JSON.stringify(html.el('div', 'A text'))).toEqual(JSON.stringify({
            __type: 'element',
            tagName: 'div',
            attributes: {},
            children: [{
                __type: 'text',
                value: 'A text'
            } as core.TextNodeDescriptor]
        } as core.ElementNodeDescriptor))
    })
    
    it('creates an ElementNodeDescriptor and adds a TextNodeDescriptor child from a number', () => {
        expect(JSON.stringify(html.el('div', 5 as any))).toEqual(JSON.stringify({
            __type: 'element',
            tagName: 'div',
            attributes: {},
            children: [{
                __type: 'text',
                value: '5'
            } as core.TextNodeDescriptor]
        } as core.ElementNodeDescriptor))
    })

    it('creates an ElementNodeDescriptor and adds a TextNodeDescriptor children and attributes', () => {
        expect(JSON.stringify(html.el('div', { id: 'anId' }, 'Text A', 'Text B'))).toEqual(JSON.stringify({
            __type: 'element',
            tagName: 'div',
            attributes: { id: 'anId' },
            children: [{
                __type: 'text',
                value: 'Text A'
            } as core.TextNodeDescriptor,
            {
                __type: 'text',
                value: 'Text B'
            } as core.TextNodeDescriptor]
        } as core.ElementNodeDescriptor))
    })

    it('creates an ElementNodeDescriptor and flattens children', () => {
        expect(JSON.stringify(html.el('div', ['Text A', 'Text B'], 'Text C', ...['Text D', 'Text E']))).toEqual(JSON.stringify({
            __type: 'element',
            tagName: 'div',
            attributes: {},
            children: [
                { __type: 'text', value: 'Text A' } as core.TextNodeDescriptor,
                { __type: 'text', value: 'Text B' } as core.TextNodeDescriptor,
                { __type: 'text', value: 'Text C' } as core.TextNodeDescriptor,
                { __type: 'text', value: 'Text D' } as core.TextNodeDescriptor,
                { __type: 'text', value: 'Text E' } as core.TextNodeDescriptor
            ]
        } as core.ElementNodeDescriptor))
    })

    it('creates a TextNodeDescriptor from a supplied non-NodeDescriptor object', () => {
        expect(JSON.stringify(html.el('div', [{ someKey: 'A text' }]))).toEqual(JSON.stringify({
            __type: 'element',
            tagName: 'div',
            attributes: {},
            children: [{
                __type: 'text',
                value: '[object Object]'
            } as core.TextNodeDescriptor]
        } as core.ElementNodeDescriptor))
    })

    const childNodeDescriptor = {
        __type: 'element',
        tagName: 'div',
        attributes: {},
        children: []
    } as core.ElementNodeDescriptor

    it('creates an ElementNodeDescriptor and appends a single child', () => {

        expect(html.el('div', html.el('div'))).toEqual({
            __type: 'element',
            tagName: 'div',
            attributes: {},
            children: [
                childNodeDescriptor
            ]
        } as core.ElementNodeDescriptor)
    })
    
    it('creates an ElementNodeDescriptor and appends multiple children with a single argument', () => {
        expect(html.el('div', [html.el('div'), html.el('div')])).toEqual({
            __type: 'element',
            tagName: 'div',
            attributes: {},
            children: [
                childNodeDescriptor,
                childNodeDescriptor
            ]
        } as core.ElementNodeDescriptor)
    })

    it('creates an ElementNodeDescriptor and appends children with multiple child arguments', () => {

        expect(html.el('div', html.el('div'), ...[html.el('div')])).toEqual({
            __type: 'element',
            tagName: 'div',
            attributes: {},
            children: [
                childNodeDescriptor,
                childNodeDescriptor
            ]
        } as core.ElementNodeDescriptor)
    })
})