import * as core from 'core'
import { nothing, text, component } from 'html'
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

    it('creates a ComponentNodeDescriptor', () => {
        const testComponent = core.defineComponent({
            name: 'TestComponent',
            init: undefined,
            view: () => html.div()
        })
        expect(component(testComponent)).toEqual({
            __type: 'component',
            component: testComponent,
            args: undefined,
            forceMount: undefined
        } as core.ComponentNodeDescriptor)
    })
})