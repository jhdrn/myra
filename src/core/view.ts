import { typeOf, max } from './helpers'
import { Dispatch, Task, UpdateAny, ElementEventAttributeArguments, NodeDescriptor, TextNodeDescriptor, ElementNodeDescriptor, ComponentNodeDescriptor, ListenerWithEventOptions } from './contract'

const EVENTS = [
    'blur',
    'change', // input, select, textarea
    'click',
    'contextmenu',
    'dblclick',
    'focus',
    'input', // input, textarea
    'keydown',
    'keypress',
    'keyup',
    'mousedown',
    'mouseenter',
    'mouseleave',
    'mousemove',
    'mouseout',
    'mouseover',
    'mouseup',
    'reset', // form
    'show',
    'submit' // form
]

const INPUT_TAG_NAMES = ['INPUT', 'TEXTAREA', 'SELECT']

function nodesEqual(a: Node | undefined, b: Node) {
    return typeof a !== 'undefined' && (a === b || a.nodeType === Node.COMMENT_NODE && b.nodeType === Node.COMMENT_NODE && a.nodeValue === b.nodeValue) 
}

/** Sets an attribute or event listener on an HTMLElement. */
function setAttr(element: HTMLElement, attributeName: string, attributeValue: any, dispatch: Dispatch) {
    const [eventName, key] = attributeName.substr(2).toLowerCase().split('_')
    if (attributeName.indexOf('on') === 0 && EVENTS.indexOf(eventName) >= 0) {
        let eventListener = createEventListener([eventName, key], attributeValue, element, dispatch)
        if ((element as any)['on' + eventName]) {
            const prevListener = (element as any)['on' + eventName]
            ;(element as any)['on' + eventName] = (ev: Event) => {
                prevListener(ev)
                eventListener(ev)
            }
        }
        else {
            ;(element as any)['on' + eventName] = eventListener
        }
    }
    else if (attributeName === 'disabled') {
        (element as HTMLInputElement).disabled = !!attributeValue
    }
    else if (attributeName === 'checked') {
        (element as HTMLInputElement).checked = !!attributeValue
    }
    else if (attributeValue && ['blur', 'focus'].indexOf(attributeName) >= 0) {
        (element as any)[attributeName]()
    }
    else if (attributeName === 'value' && INPUT_TAG_NAMES.indexOf(element.tagName) >= 0) {
        (element as HTMLInputElement).value = attributeValue
    }
    else {
        const attr = document.createAttribute(attributeName)
        attr.value = attributeValue
        element.attributes.setNamedItem(attr)
    }
}

/** Removes an attribute or event listener from an HTMLElement. */
function removeAttr(a: string, node: Node) {
    const [eventName, ] = a.substr(2).toLowerCase().split('_')
    if (a.indexOf('on') === 0 && EVENTS.indexOf(eventName) >= 0) {
        (node as any)['on' + eventName.toLowerCase()] = null
    }
    else if ((node as Node).attributes.getNamedItem(a)) {
        (node as Node).attributes.removeNamedItem(a)
    }
}

/** Creates an event listener */
function createEventListener([eventName, key]: [string, string], eventArgs: ElementEventAttributeArguments, node: Node, dispatch: Dispatch) {
    return (ev: Event) => {

        if (['keyup', 'keypress', 'keydown'].indexOf(eventName) >= 0 && typeof key !== 'undefined' && key !== (ev as KeyboardEvent).key.toLowerCase()) {
            return
        }
        const eventArgsType = typeOf(eventArgs)

        if ((eventArgs as Task).execute) {
            (eventArgs as Task).execute(dispatch)
            return
        } 
        else if (eventArgsType === 'object') {
            if ((eventArgs as ListenerWithEventOptions).preventDefault) {
                ev.preventDefault()
            }
            if ((eventArgs as ListenerWithEventOptions).stopPropagation) {
                ev.stopPropagation()
            }
            if ((eventArgs as ListenerWithEventOptions).listener) {
                if (((eventArgs as ListenerWithEventOptions).listener as Task).execute) {
                    ((eventArgs as ListenerWithEventOptions).listener as Task).execute(dispatch)
                    return
                }
                else {
                    eventArgs = (eventArgs as ListenerWithEventOptions).listener
                }
            }
        }

        const tagName = (node as Element).tagName
        if (INPUT_TAG_NAMES.indexOf(tagName) !== -1) {
            dispatch(eventArgs as UpdateAny, (node as HTMLInputElement).value)
        }
        else if (tagName === 'FORM' && eventName === 'submit') {
            const namedElements = (node as Element).querySelectorAll('[name]')
            const formData: { [name: string]: string } = {}
            for (let i = 0; i < namedElements.length; i++) {
                const el = namedElements.item(i) as HTMLInputElement
                formData[el.name] = el.value
            }
            dispatch(eventArgs as UpdateAny, formData)
        }
        else {
            dispatch(eventArgs as UpdateAny)
        }
    }
}

/** Creates a Node from a NodeDescriptor. */
function createNode(descriptor: NodeDescriptor, parentNode: Element): Node {
    switch(descriptor.__type) {
        case 'element':  
            return document.createElement(descriptor.tagName)
        case 'text':
            return document.createTextNode(descriptor.value)
        case 'comment':
            return document.createComment(descriptor.comment)
        case 'component':
            descriptor.componentInstance = descriptor.component.mount(parentNode, descriptor.args) 
            return descriptor.componentInstance.rootNode
        case 'nothing':
            return document.createComment('Nothing')
    }
}

/** Returns true if the node should be replaced, given the new and old descriptors. */
function shouldReplaceNode(newDescriptor: NodeDescriptor, oldDescriptor: NodeDescriptor | undefined): boolean {
    if (!oldDescriptor) {
        return false
    }
    if (newDescriptor.__type !== oldDescriptor.__type) {
        return true
    }
    if (newDescriptor.__type === 'element' && oldDescriptor.__type === 'element') {
        const sameTagName = newDescriptor.tagName === oldDescriptor.tagName

        if (!sameTagName) {
            return true
        }
    }
    return false
}

function getAttributesToRemove(newDescriptor: ElementNodeDescriptor, oldDescriptor: NodeDescriptor, existingNode: Node) {
    const oldAttributeKeys = Object.keys((oldDescriptor as ElementNodeDescriptor).attributes)
    
    if (existingNode !== oldDescriptor.node) {
        return oldAttributeKeys
    }
    
    const newAttributeKeys = Object.keys(newDescriptor.attributes)
    return newAttributeKeys.filter(x => oldAttributeKeys.indexOf(x) === -1)
                           .concat(oldAttributeKeys.filter(x => newAttributeKeys.indexOf(x) === -1 || x.indexOf('on') === 0))
}

/** Renders the view by walking the node descriptor tree recursively */
export function render(parentNode: Element, newDescriptor: NodeDescriptor, oldDescriptor: NodeDescriptor, existingNode: Node | undefined, dispatch: Dispatch): Node {
    const replaceNode = shouldReplaceNode(newDescriptor, oldDescriptor)
    if (typeof existingNode === 'undefined' || existingNode === null || replaceNode) {
        // if no existing node, create one
        const newNode = createNode(newDescriptor, parentNode)

        newDescriptor.node = newNode

        if (replaceNode) {
            if (oldDescriptor.__type === 'element') {
                // Remove old event listeners before replacing the node. 
                Object.keys(oldDescriptor.attributes).filter(a => a.indexOf('on') === 0).forEach(a => {
                    removeAttr(a, existingNode!)
                })
            }

            parentNode.replaceChild(newNode, existingNode!)
        }
        else {
            parentNode.appendChild(newNode)
        }

        if (newDescriptor.__type === 'element') {

            for (const name in newDescriptor.attributes) {
                if (newDescriptor.attributes.hasOwnProperty(name)) {
                    const attributeValue = newDescriptor.attributes[name]
                    if (typeof attributeValue !== 'undefined') {
                        setAttr(newNode as HTMLElement, name, attributeValue, dispatch)
                    }
                }
            }

            newDescriptor.children
                        .filter(c => typeof c !== 'undefined')
                        .forEach(c => {
                            render(newNode as Element, c, c, undefined, dispatch)
                            // add "whitespace" between elements
                            newNode.appendChild(document.createTextNode('\r\n'))
                        })
        }
        return newNode
    }
    else { // reuse the old node

        if (!nodesEqual(oldDescriptor.node, existingNode)) {
            console.error('The view is not matching the DOM. Are outside forces tampering with it?')
            console.error('Expected node:')
            console.error(oldDescriptor.node)
            console.error('Actual node:')
            console.error(existingNode)
        }

        // update existing node
        switch (newDescriptor.__type) {
            case 'element':
            
                // remove any attributes that was added with the old node descriptor but does not exist in the new descriptor.
                getAttributesToRemove(newDescriptor, oldDescriptor, existingNode).forEach(a => {
                    removeAttr(a, existingNode!)
                })
                
                // update any attribute where the attribute value has changed
                for (const name in newDescriptor.attributes) {
                    if (newDescriptor.attributes.hasOwnProperty(name)) {
                        const attributeValue = newDescriptor.attributes[name]
                        const oldAttributeValue = (oldDescriptor as ElementNodeDescriptor).attributes[name]
                        if ((name.indexOf('on') === 0 || !existingNode.attributes.getNamedItem(name) || 
                            attributeValue !== oldAttributeValue) && typeof attributeValue !== 'undefined'
                        ) {
                            setAttr(existingNode as HTMLElement, name, attributeValue, dispatch)
                        }
                        else if (typeof attributeValue === 'undefined' && existingNode.attributes.getNamedItem(name)) {
                            existingNode.attributes.removeNamedItem(name)
                        }
                    }
                }

                // Iterate over children and add/update/remove nodes
                const newDescriptorChildLengh = newDescriptor.children.length
                const oldDescriptorChildrenLength = oldDescriptor.__type === 'element' ? oldDescriptor.children.length : 0
                const maxIterations = max(newDescriptorChildLengh, oldDescriptorChildrenLength)

                let childDescriptorIndex = 0
                let childNodeIndex = 0
                while (true) {
                    if (childDescriptorIndex >= maxIterations) {
                        break
                    }

                    const childNode = existingNode!.childNodes.item(childNodeIndex)
                    const childNodeIsCLRF = !!childNode && childNode.nodeType === Node.TEXT_NODE && childNode.textContent === '\r\n'

                    if (childNodeIsCLRF) {
                        // This is a check for an edge case where a text node with value '\r\n' 
                        // has been added in a view structure.
                        const oldDescriptorChildIsCLRF = 
                            oldDescriptor.__type === 'element' && 
                            !!oldDescriptor!.children[childDescriptorIndex] &&
                            oldDescriptor!.children[childDescriptorIndex].__type === 'text' && 
                            (oldDescriptor!.children[childDescriptorIndex] as TextNodeDescriptor).value === '\r\n'
                        
                        if (!oldDescriptorChildIsCLRF) {
                            childNodeIndex++
                        }
                        continue
                    }
                    else if (childDescriptorIndex < newDescriptorChildLengh) {
                        const childDescriptor = newDescriptor.children[childDescriptorIndex]
                        
                        render(existingNode as Element, childDescriptor, oldDescriptor.__type === 'element' ? oldDescriptor!.children[childDescriptorIndex] : childDescriptor, childNode, dispatch)
                        
                        if (!childNode) {
                            // add "whitespace" between elements
                            existingNode.appendChild(document.createTextNode('\r\n'))
                        }
                    }
                    else if (childNode) {
                        existingNode.removeChild(childNode)
                    }          

                    childDescriptorIndex++
                    childNodeIndex++
                }
                break
            case 'text':
                existingNode.textContent = newDescriptor.value
                break
            case 'comment':
                existingNode.textContent = newDescriptor.comment
                break
            case 'component':
                newDescriptor.componentInstance = (oldDescriptor as ComponentNodeDescriptor).componentInstance
                ;(oldDescriptor as ComponentNodeDescriptor).componentInstance = undefined
                newDescriptor.componentInstance!.remount(newDescriptor.args, newDescriptor.forceMount)
                break
        }

        // add a reference to the node
        newDescriptor.node = existingNode

        if (newDescriptor !== oldDescriptor) {
            // clean up
            oldDescriptor.node = undefined
        }
    }
    return existingNode
}