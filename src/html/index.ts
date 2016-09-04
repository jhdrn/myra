import * as c from '../core/contract'
import { flatten } from '../core/helpers'

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
export function element<A extends c.GlobalAttributes>(tagName: string) {
    return function (attributesOrNode?: A | (c.NodeDescriptor | string)[] | c.NodeDescriptor | string, ...children: (c.NodeDescriptor | string)[]): c.ElementNodeDescriptor {
        if (typeof attributesOrNode === 'undefined' && typeof children === 'undefined') {
            return {
                __type: 'element',
                tagName: tagName,
                attributes: {},
                children: []
            }
        }

        const attributesGiven = !Array.isArray(attributesOrNode) && typeof attributesOrNode === 'object' && !(attributesOrNode as c.NodeDescriptor).__type

        const flattenedChildren = [] as (c.NodeDescriptor | string)[]

        for (let i = 0; i < arguments.length; i++) {
            if (attributesGiven && i === 0) {
                continue
            }

            if (Array.isArray(arguments[i])) {
                flatten<c.NodeDescriptor>(arguments[i])
                    .map(c => typeof c === 'object' && !(c as c.NodeDescriptor).__type ? text(c) : c)
                    .forEach(c => flattenedChildren.push(c))
            }
            else if (typeof arguments[i] === 'object') {
                if ((arguments[i] as c.NodeDescriptor).__type) {
                    flattenedChildren.push(arguments[i] as c.NodeDescriptor)
                }
                else {
                    flattenedChildren.push(text(arguments[i]))    
                }
            }
            else {
                flattenedChildren.push(arguments[i]) 
            }
        }

        return {
            __type: 'element',
            tagName,
            attributes: attributesGiven ? attributesOrNode as A : {},
            children: flattenedChildren.filter(c => typeof c !== 'undefined').map(c => {
                if (typeof c !== 'object' || Array.isArray(c) || typeof c === 'object' && !(c as c.NodeDescriptor).__type) {
                    return text(c)
                }
                return c as c.NodeDescriptor
            })
        }
    }
}