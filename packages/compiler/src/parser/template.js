import { parseAttributes } from './attributes.js'
import { parseFragment } from './element.js'
import { Parser } from './parser.js'
import { TokenTypes } from './tokentype.js'

/**
 *
 * @param {Parser} p
 */
export function parseTemplate(p) {
    const start = p.pos

    p.expectToken([TokenTypes.lte])
    p.expectToken([TokenTypes.name])
    const name = p.value
    const attributes = parseAttributes(p)
    p.expectToken([TokenTypes.gte])

    const fragment = parseFragment(p, true, true)

    p.expectToken([TokenTypes.lteSlash])
    p.expectToken([TokenTypes.name])
    const tagNameClose = p.value
    p.skipWhitespaces()
    p.expectToken([TokenTypes.gte])

    if (name !== tagNameClose) throw new Error('wrong closing tag')

    return { type: 'Template', attributes, fragment, start, end: p.pos }
}
