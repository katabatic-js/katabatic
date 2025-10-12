import { parseAttributes } from './attributes.js'
import { parseIfBlock } from './if-block.js'
import { parseEachBlock } from './each-block.js'
import { parseExpressionTag } from './expression.js'
import { Parser } from './parser.js'
import { parseScript } from './script.js'
import { parseStyle } from './style.js'
import { TokenTypes } from './tokentype.js'

/**
 *
 * @param {Parser} p
 * @returns
 */
export function parseElement(p) {
    const start = p.pos
    p.expectToken([TokenTypes.lte])
    p.expectToken([TokenTypes.name])
    const name = p.value
    const type = name === 'slot' ? 'SlotElement' : name.includes('-') ? 'CustomElement' : 'Element'
    const attributes = parseAttributes(p)
    p.expectToken([TokenTypes.gte, TokenTypes.slashGte])

    if (p.type === TokenTypes.gte) {
        const fragment = parseFragment(p)

        p.expectToken([TokenTypes.lteSlash])
        p.expectToken([TokenTypes.name])
        const tagNameClose = p.value
        p.skipWhitespaces()
        p.expectToken([TokenTypes.gte])

        if (name !== tagNameClose) throw new Error('wrong closing tag')

        return { type, name, attributes, fragment, start, end: p.pos }
    }
    return { type, name, attributes, start, end: p.pos }
}

/**
 *
 * @param {Parser} p
 * @returns
 */
export function parseFragment(p, allowScript = false, allowStyle = false) {
    const nodes = []

    p.skipWhitespaces()
    while (!p.peakToken([TokenTypes.lteSlash, TokenTypes.braceLSlash, TokenTypes.braceLColumn])) {
        const punctToken = p.peakToken([TokenTypes.lte, TokenTypes.braceLHash, TokenTypes.braceL])
        const nameToken = p.peakToken([TokenTypes.name], punctToken)

        switch (punctToken?.type) {
            case TokenTypes.lte:
                if (nameToken?.value === 'script') {
                    if (!allowScript) throw new Error('invalid script position')

                    nodes.push(parseScript(p))
                    break
                }
                if (nameToken?.value === 'style') {
                    if (!allowStyle) throw new Error('invalid style position')

                    nodes.push(parseStyle(p))
                    break
                }

                nodes.push(parseElement(p))
                break
            case TokenTypes.braceLHash:
                if (nameToken?.value === 'if') {
                    nodes.push(parseIfBlock(p))
                    break
                }
                if (nameToken?.value === 'each') {
                    nodes.push(parseEachBlock(p))
                    break
                }

                throw new Error(`unknown block ${nameToken?.value}`)
            case TokenTypes.braceL:
                nodes.push(parseExpressionTag(p))
                break
            default:
                nodes.push(parseText(p))
                break
        }
        p.skipWhitespaces()
    }

    return { type: 'Fragment', nodes }
}

/**
 *
 * @param {Parser} p
 * @returns
 */
function parseText(p) {
    const previousToken = p.token()
    p.expectToken([TokenTypes.text])
    let data = p.value

    if (previousToken.type === TokenTypes.braceR) {
        // add back skipped whitespaces if the previous sibling is an expressionTag
        data = p.input.substring(previousToken.end, p.start) + data
    }

    if (!p.peakToken([TokenTypes.braceL])) {
        // remove trailing spaces if next sibling is not an expressionTag
        data = data.trimEnd()
    }

    return { type: 'Text', start: p.start, end: p.end, data }
}
