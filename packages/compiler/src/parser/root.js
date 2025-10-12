import { Parser } from './parser.js'
import { parseScript } from './script.js'
import { parseTemplate } from './template.js'
import { TokenTypes } from './tokentype.js'

/**
 * @param {Parser} p
 * @returns
 */
export function parseRoot(p) {
    let script
    let template

    p.skipWhitespaces()
    while (!p.isEOF()) {
        const lteToken = p.peakToken([TokenTypes.lte])
        const nameToken = p.peakToken([TokenTypes.name], lteToken)

        switch (nameToken?.value) {
            case 'script':
                script = parseScript(p)
                break
            case 'template':
                template = parseTemplate(p)
                break
            default:
                throw new Error('unexpected html tag at position ' + p.pos)
        }
        p.skipWhitespaces()
    }

    return { type: 'Root', script, template }
}
