// import * as core from 'core'

// describe('Node descriptor helpers', () => {

//     it('creates an ElementNodeDescriptor with the supplied tagName', () => {
//         expect(el('div')).toEqual({
//             __type: 'element',
//             tagName: 'div',
//             attributes: {},
//             children: []
//         })
//     })

//     it('creates an ElementNodeDescriptor and sets attributes', () => {
//         expect(el('div', { 'class': 'test', id: 'test' })).toEqual({
//             __type: 'element',
//             tagName: 'div',
//             attributes: {
//                 'class': 'test',
//                 id: 'test'
//             },
//             children: []
//         })
//     })

//     it('creates an ElementNodeDescriptor and adds a TextNodeDescriptor child', () => {
//         expect(JSON.stringify(el('div', 'A text'))).toEqual(JSON.stringify({
//             __type: 'element',
//             tagName: 'div',
//             attributes: {},
//             children: [{
//                 __type: 'text',
//                 value: 'A text'
//             } as core.TextDescriptor]
//         }))
//     })

//     it('creates an ElementNodeDescriptor and adds a TextNodeDescriptor child from a number', () => {
//         expect(JSON.stringify(el('div', 5 as any))).toEqual(JSON.stringify({
//             __type: 'element',
//             tagName: 'div',
//             attributes: {},
//             children: [{
//                 __type: 'text',
//                 value: '5'
//             } as core.TextDescriptor]
//         }))
//     })

//     it('creates an ElementNodeDescriptor and adds a TextNodeDescriptor children and attributes', () => {
//         expect(JSON.stringify(el('div', { id: 'anId' }, 'Text A', 'Text B'))).toEqual(JSON.stringify({
//             __type: 'element',
//             tagName: 'div',
//             attributes: { id: 'anId' },
//             children: [{
//                 __type: 'text',
//                 value: 'Text A'
//             } as core.TextDescriptor,
//             {
//                 __type: 'text',
//                 value: 'Text B'
//             } as core.TextDescriptor]
//         }))
//     })

//     it('creates an ElementNodeDescriptor and flattens children', () => {
//         expect(JSON.stringify(el('div', ['Text A', 'Text B'], 'Text C', ...['Text D', 'Text E']))).toEqual(JSON.stringify({
//             __type: 'element',
//             tagName: 'div',
//             attributes: {},
//             children: [
//                 { __type: 'text', value: 'Text A' } as core.TextDescriptor,
//                 { __type: 'text', value: 'Text B' } as core.TextDescriptor,
//                 { __type: 'text', value: 'Text C' } as core.TextDescriptor,
//                 { __type: 'text', value: 'Text D' } as core.TextDescriptor,
//                 { __type: 'text', value: 'Text E' } as core.TextDescriptor
//             ]
//         }))
//     })

//     it('creates a TextNodeDescriptor from a supplied non-NodeDescriptor object', () => {
//         expect(JSON.stringify(el('div', [{ someKey: 'A text' }]))).toEqual(JSON.stringify({
//             __type: 'element',
//             tagName: 'div',
//             attributes: {},
//             children: [{
//                 __type: 'text',
//                 value: '[object Object]'
//             } as core.TextDescriptor]
//         }))
//     })

//     const childNodeDescriptor = {
//         __type: 'element',
//         tagName: 'div',
//         attributes: {},
//         children: []
//     }

//     it('creates an ElementNodeDescriptor and appends a single child', () => {

//         expect(el('div', el('div'))).toEqual({
//             __type: 'element',
//             tagName: 'div',
//             attributes: {},
//             children: [
//                 childNodeDescriptor
//             ]
//         })
//     })

//     it('creates an ElementNodeDescriptor and appends multiple children with a single argument', () => {
//         expect(el('div', [el('div'), el('div')])).toEqual({
//             __type: 'element',
//             tagName: 'div',
//             attributes: {},
//             children: [
//                 childNodeDescriptor,
//                 childNodeDescriptor
//             ]
//         })
//     })

//     it('creates an ElementNodeDescriptor and appends children with multiple child arguments', () => {

//         expect(el('div', el('div'), ...[el('div')])).toEqual({
//             __type: 'element',
//             tagName: 'div',
//             attributes: {},
//             children: [
//                 childNodeDescriptor,
//                 childNodeDescriptor
//             ]
//         })
//     })
// })