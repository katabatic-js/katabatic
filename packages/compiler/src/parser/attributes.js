import { parseAttributeExpressionTag } from './expression.js'
import { Parser } from './parser.js'
import { TokenTypes } from './tokentype.js'

/**
 *
 * @param {Parser} p
 * @returns
 */
export function parseAttributes(p) {
    const attributes = []

    p.skipWhitespaces()
    while (!p.peakToken([TokenTypes.gte, TokenTypes.slashGte])) {
        attributes.push(parseAttribute(p))
        p.skipWhitespaces()
    }

    return attributes
}

function parseAttribute(p) {
    const start = p.pos
    p.expectToken([TokenTypes.name])
    const name = p.value

    if (p.readToken([TokenTypes.eq])) {
        const punctToken = p.peakToken([
            TokenTypes.quoteBraceL,
            TokenTypes.doubleQuoteBraceL,
            TokenTypes.quote,
            TokenTypes.doubleQuote
        ])

        let value
        switch (punctToken?.type) {
            case TokenTypes.quoteBraceL:
            case TokenTypes.doubleQuoteBraceL:
                value = [parseAttributeExpressionTag(p)]
                break
            case TokenTypes.quote:
            case TokenTypes.doubleQuote:
                value = [parseText(p)]
                break
            default:
                p.raiseUnexpectedToken()
                break
        }
        return { type: 'Attribute', name, value, start, end: p.pos }
    }
    return { type: 'Attribute', name, value: true, start, end: p.pos }
}

/**
 *
 * @param {Parser} p
 * @returns
 */
function parseText(p) {
    const start = p.pos
    p.expectToken([TokenTypes.quote, TokenTypes.doubleQuote])
    p.expectToken([TokenTypes.text])
    const data = p.value
    p.expectToken([TokenTypes.quote, TokenTypes.doubleQuote])
    return { type: 'Text', start, end: p.end, data }
}
