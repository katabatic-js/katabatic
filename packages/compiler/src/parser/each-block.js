import { parseExpressionAt } from 'acorn'
import { parseFragment } from './element.js'
import { Parser } from './parser.js'
import { TokenTypes } from './tokentype.js'

/**
 *
 * @param {Parser} p
 * @returns
 */
export function parseEachBlock(p) {
    const start = p.pos
    p.expectToken([TokenTypes.braceLHash, TokenTypes.braceLColumn])
    p.expectToken([TokenTypes.name])
    const name = p.value
    
    p.skipWhitespaces()
    const expression = parseExpression(p)
    
    p.skipWhitespaces()
    p.expectToken([TokenTypes.name])
    const as = p.value
    if (as !== 'as') throw new Error('expected token as')

    p.skipWhitespaces()
    const context = parseIdentifier(p)

    let key
    p.skipWhitespaces()
    if (p.readToken([TokenTypes.parenthesesL])) {
        key = parseExpression(p)
        p.expectToken([TokenTypes.parenthesesR])
    }

    p.skipWhitespaces()
    p.expectToken([TokenTypes.braceR])

    const body = parseFragment(p)

    p.expectToken([TokenTypes.braceLSlash])
    p.expectToken([TokenTypes.name])
    const blockNameClose = p.value
    p.skipWhitespaces()
    p.expectToken([TokenTypes.braceR])

    if (name !== blockNameClose) throw new Error('wrong closing tag')

    return { type: 'EachBlock', expression, context, key, body, start, end: p.pos }
}

/**
 *
 * @param {Parser} p
 * @returns
 */
function parseExpression(p) {
    const node = parseExpressionAt(p.input, p.pos, { ecmaVersion: 'latest' })
    p.pos = node.end
    return node
}

/**
 *
 * @param {Parser} p
 * @returns
 */
function parseIdentifier(p) {
    const start = p.pos
    p.expectToken([TokenTypes.name])
    const name = p.value

    return { type: 'Identifier', name, start, end: p.pos }
}
