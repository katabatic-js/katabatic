import { parseExpressionAt } from 'acorn'
import { parseFragment } from './element.js'
import { Parser } from './parser.js'
import { TokenTypes } from './tokentype.js'

/**
 *
 * @param {Parser} p
 * @returns
 */
export function parseIfBlock(p, elseif = false) {
    const start = p.pos
    p.expectToken([TokenTypes.braceLHash, TokenTypes.braceLColumn])
    p.expectToken([TokenTypes.name])
    const name = p.value

    if (elseif) {
        p.skipWhitespaces()
        p.expectToken([TokenTypes.name])
    }

    const test = parseExpression(p)
    p.expectToken([TokenTypes.braceR])
    const consequent = parseFragment(p)

    const punctToken = p.peakToken([TokenTypes.braceLColumn])
    const nameToken1 = p.peakToken([TokenTypes.name], punctToken)
    const whitespaceToken = p.peakWhitespaces(nameToken1)
    const nameToken2 = p.peakToken([TokenTypes.name], whitespaceToken)

    let alternate
    if (nameToken1?.value === 'else' && nameToken2?.value === 'if') {
        alternate = fragment([parseIfBlock(p, true)])
    } else if (nameToken1?.value === 'else') {
        p.expectToken([TokenTypes.braceLColumn])
        p.expectToken([TokenTypes.name])
        p.skipWhitespaces()
        p.expectToken([TokenTypes.braceR])

        alternate = parseFragment(p)
    } else if (punctToken) {
        throw new Error(`unknown block ${nameToken1?.value}`)
    }

    if (!elseif) {
        p.expectToken([TokenTypes.braceLSlash])
        p.expectToken([TokenTypes.name])
        const blockNameClose = p.value
        p.skipWhitespaces()
        p.expectToken([TokenTypes.braceR])

        if (name !== blockNameClose) throw new Error('wrong closing tag')
    }

    return { type: 'IfBlock', elseif, test, consequent, alternate, start, end: p.pos }
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

function fragment(nodes) {
    return { type: 'Fragment', nodes }
}
