import * as c from '../core/contract'

/**
 * Creates a ComponentNodeDescriptor
 */
export const component = <T>(component: c.Component, args?: T, forceMount?: boolean) => 
    ({ __type: 'component', component, args, forceMount }) as c.ComponentNodeDescriptor

/**
 * Creates a NothingNodeDescriptor
 */
export const nothing = (): c.NothingNodeDescriptor => ({ __type: 'nothing' })

/**
 * Creates a TextNodeDescriptor
 */
export const text = (value: any): c.TextNodeDescriptor => {
    if (typeof value === 'undefined' || value === null) {
        value = ''
    }
    else if (typeof value !== 'string') {
        value = value.toString()
    }
    return { 
        __type: 'text', 
        value: value 
    }
}

/**
 * Creates an ElementNodeDescriptor
 */
export const element = <A extends c.GlobalAttributes>(tagName: string) => (attributesOrNode?: A | c.NodeDescriptor[] | c.NodeDescriptor, ...children: c.NodeDescriptor[]): c.ElementNodeDescriptor => {
    if (typeof attributesOrNode === 'undefined' && typeof children === 'undefined') {
        return {
            __type: 'element',
            tagName: tagName,
            attributes: {},
            children: []
        }
    }

    const isNodeDescriptor = Array.isArray(attributesOrNode) || typeof attributesOrNode === 'undefined' ? false : attributesOrNode.hasOwnProperty('__type')
    if (Array.isArray(attributesOrNode)) {
        children = attributesOrNode.concat(children)
    } 
    else if (isNodeDescriptor) {
        children.unshift(attributesOrNode as c.NodeDescriptor)
    }
    
    return {
        __type: 'element',
        tagName,
        attributes: isNodeDescriptor || Array.isArray(attributesOrNode) || typeof attributesOrNode === 'undefined' ? {} : attributesOrNode,
        children: children.filter(c => typeof c !== 'undefined')
    }
}
