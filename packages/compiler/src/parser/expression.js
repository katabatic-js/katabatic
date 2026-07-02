import { parseExpressionAt } from 'acorn'
import { Parser } from './parser.js'
import { TokenTypes } from './tokentype.js'

/**
 *
 * @param {Parser} p
 * @returns
 */
export function parseExpressionTag(p) {
    p.expectToken([TokenTypes.braceL])
    p.skipWhitespaces()
    const expression = parseExpression(p)
    p.skipWhitespaces()
    p.expectToken([TokenTypes.braceR])

    return { type: 'ExpressionTag', expression }
}

/**
 *
 * @param {Parser} p
 * @returns
 */
export function parseQuotedExpressionTag(p) {
    p.expectToken([TokenTypes.quoteBraceL])
    p.skipWhitespaces()
    const expression = parseExpression(p)
    p.skipWhitespaces()
    p.expectToken([TokenTypes.braceRQuote])

    return { type: 'ExpressionTag', expression }
}

/**
 *
 * @param {Parser} p
 * @returns
 */
export function parseDoubleQuotedExpressionTag(p) {
    p.expectToken([TokenTypes.doubleQuoteBraceL])
    p.skipWhitespaces()
    const expression = parseExpression(p)
    p.skipWhitespaces()
    p.expectToken([TokenTypes.braceRDoubleQuote])

    return { type: 'ExpressionTag', expression }
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
