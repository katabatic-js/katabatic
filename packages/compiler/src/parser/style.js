import { parse } from 'css-tree'
import { TokenTypes } from './tokentype.js'
import { Parser } from './parser.js'

/**
 *
 * @param {Parser} p
 * @returns
 */
export function parseStyle(p) {
    const start = p.pos
    p.expectToken([TokenTypes.lte])
    p.expectToken([TokenTypes.name])
    const name = p.value

    p.skipWhitespaces()
    p.expectToken([TokenTypes.gte])

    const content = parseCSS(p)

    p.expectToken([TokenTypes.lteSlash])
    p.expectToken([TokenTypes.name])
    const tagNameClose = p.value
    p.skipWhitespaces()
    p.expectToken([TokenTypes.gte])

    if (name !== tagNameClose) throw new Error('wrong closing tag')

    return { type: 'Style', content, start, end: p.pos }
}

/**
 *
 * @param {Parser} p
 */
function parseCSS(p) {
    const start = p.pos
    skipCSS(p)
    return parse(p.input.slice(start, p.pos))
}

/**
 *
 * @param {Parser} p
 */
function skipCSS(p) {
    while (p.pos < p.input.length) {
        if (
            p.input.charCodeAt(p.pos) === 60 &&
            p.input.charCodeAt(p.pos + 1) === 47 &&
            p.input.substring(p.pos + 2, p.pos + 7) === 'style'
        ) {
            break
        }
        p.pos++
    }
}
