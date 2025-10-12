import { parse as parseJS } from 'acorn'
import { TokenTypes } from './tokentype.js'
import { Parser } from './parser.js'
import { parseAttributes } from './attributes.js'
/** @import {Program} from 'acorn' */

/**
 *
 * @param {Parser} p
 * @returns
 */
export function parseScript(p) {
    const start = p.pos
    p.expectToken([TokenTypes.lte])
    p.expectToken([TokenTypes.name])
    const name = p.value
    parseAttributes(p)
    p.expectToken([TokenTypes.gte])

    const content = parseProgram(p)

    p.expectToken([TokenTypes.lteSlash])
    p.expectToken([TokenTypes.name])
    const tagNameClose = p.value
    p.skipWhitespaces()
    p.expectToken([TokenTypes.gte])

    if (name !== tagNameClose) throw new Error('wrong closing tag')

    return { type: 'Script', content, start, end: p.pos }
}

/**
 *
 * @param {Parser} p
 * @returns {Program}
 */
function parseProgram(p) {
    const start = p.pos
    skipCode(p)
    return parseJS(p.input.slice(start, p.pos), { ecmaVersion: 'latest', sourceType: 'module' })
}

/**
 *
 * @param {Parser} p
 */
function skipCode(p) {
    while (p.pos < p.input.length) {
        if (
            p.input.charCodeAt(p.pos) === 60 &&
            p.input.charCodeAt(p.pos + 1) === 47 &&
            p.input.substring(p.pos + 2, p.pos + 8) === 'script'
        ) {
            break
        }
        p.pos++
    }
}
