/**
 * @typedef {Object} TokenType
 * @property {string} label
 * @property {Array<number>} [charCodes]
 * @property {(code: number, input: string, pos: number) => boolean} [test]
 */

/**
 *
 * @param {string} label
 * @param {Array<number>} charCodes
 * @returns {TokenType}
 */
function charTT(label, charCodes) {
    return { label, charCodes }
}

/**
 *
 * @param {string} label
 * @param {(code: number, input: string, pos: number) => boolean} test
 * @returns {TokenType}
 */
function stringTT(label, test) {
    return { label, test }
}

export const TokenTypes = {
    name: stringTT('name', name),
    quotedText: stringTT('text', quotedText),
    doubleQuotedText: stringTT('text', doubleQuotedText),
    commentText: stringTT('text', commentText),
    text: stringTT('text', text),

    // html punctuation
    lte: charTT('<', [60]),
    gte: charTT('>', [62]),
    lteSlash: charTT('</', [60, 47]),
    slashGte: charTT('/>', [47, 62]),
    lteExclHyph2: charTT('<!--', [60, 33, 45, 45]),
    hyph2Gte: charTT('-->', [45, 45, 62]),
    eq: charTT('=', [61]),
    quote: charTT("'", [39]),
    doubleQuote: charTT('"', [34]),

    // block punctuation
    quoteBraceL: charTT("'{", [39, 123]),
    doubleQuoteBraceL: charTT('"{', [34, 123]),
    braceRQuote: charTT("}'", [125, 39]),
    braceRDoubleQuote: charTT('}"', [125, 34]),
    braceL: charTT('{', [123]),
    braceR: charTT('}', [125]),
    braceLHash: charTT('{#', [123, 35]),
    braceLColumn: charTT('{:', [123, 58]),
    braceLSlash: charTT('{/', [123, 47]),
    parenthesesL: charTT('(', [40]),
    parenthesesR: charTT(')', [41])
}

function name(code) {
    // Automatically allow all extended ASCII and UTF-16 surrogate bytes
    if (code > 127) return true

    // Fast check for control characters, whitespace, and quotes
    if (code <= 47) {
        return (
            code !== 0 && // NULL
            code !== 9 && // Tab (\t)
            code !== 10 && // Line Feed (\n)
            code !== 12 && // Form Feed (\f)
            code !== 13 && // Carriage Return (\r)
            code !== 32 && // Space ( )
            code !== 34 && // Double Quote (")
            code !== 39 && // Single Quote (')
            code !== 47 // Forward Slash (/)
        )
    }

    // Blocks Equals (=), Greater-Than (>), and Right-Brace (})
    return code !== 61 && code !== 62 && code !== 125
}

function quotedText(code) {
    return code > 0 && code !== 39 // Blocks NULL (0) and Single Quote (39)
}

function doubleQuotedText(code) {
    return code > 0 && code !== 34 // Blocks NULL (0) and Double Quote (34)
}

function commentText(code, input, pos) {
    if (
        input.charCodeAt(pos) === 45 &&
        input.charCodeAt(pos + 1) === 45 &&
        input.charCodeAt(pos + 2) === 62
    ) {
        // Blocks the sequence "-->"
        return false
    }

    return code >= 32 || code === 9 || code === 10 || code === 13 // Allows printable characters and standard whitespace (Tab, LF, CR)
}

function text(code) {
    // Quickly allow all extended ASCII and UTF-16 surrogate bytes
    if (code > 127) return true

    // Blocks NULL (0), Less-Than (<), Left-Brace ({)
    return code !== 0 && code !== 60 && code !== 123
}
