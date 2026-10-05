import { Client } from './client.js'
import { EachBlock } from './eachBlock.js'
import { IfBlock } from './ifBlock.js'
import { RootClient } from './root.js'

export { EachBlock, IfBlock }

export function $$(customElement) {
    Client.prototype.ifBlock ??= function (anchor, getCondition, concequent, alternate) {
        const block = new IfBlock(anchor, getCondition, concequent, alternate).init()
        this.add(block)
        return block
    }

    Client.prototype.eachBlock ??= function (anchor, getIterable, getKey, body) {
        const block = new EachBlock(anchor, getIterable, getKey, body).init()
        this.add(block)
        return block
    }

    return new RootClient(customElement)
}

$$.init = function (object, property, value) {
    const isSetter = arguments.length === 2

    if (object.hasOwnProperty(property)) {
        value = object[property]
        delete object[property]

        if (isSetter) {
            object[property] = value
        }
    }
    return value
}

$$.template = function (text) {
    let template
    return () => {
        if (!template) {
            template = document.createElement('template')
            template.innerHTML = text
        }
        return template
    }
}

$$.cssStyleSheet = function (text) {
    let sheet
    return () => {
        if (!sheet) {
            sheet = new CSSStyleSheet()
            sheet.replaceSync(text)
        }
        return sheet
    }
}

$$.adoptStyleSheet = function (node, sheet) {
    if (!node.adoptedStyleSheets.includes(sheet)) {
        node.adoptedStyleSheets.push(sheet)
    }
}

$$.setAttribute = function (element, name, value) {
    if (value === null || value === undefined) {
        element.removeAttribute(name)
    } else {
        element.setAttribute(name, value)
    }
}

$$.setBoolAttribute = function (element, name, value) {
    if (!value) {
        element.removeAttribute(name)
    } else {
        element.setAttribute(name, '')
    }
}

$$.setStyle = function (element, value) {
    if (typeof value === 'string') {
        element.style.cssText = value
    } else if (typeof value === 'object') {
        for (const [key, val] of Object.entries(value)) {
            element.style[key] = val ?? ''
        }
    }
}

$$.setClass = function (element, value, scope) {
    if (typeof value === 'string') {
        element.className = value + ' ' + scope
    } else if (Array.isArray(value)) {
        value = value.filter((v) => v).join(' ')
        element.className = value + ' ' + scope
    } else if (typeof value === 'object') {
        element.classList.add(scope)
        for (const [key, val] of Object.entries(value)) {
            element.classList.toggle(key, !!val)
        }
    }
}
