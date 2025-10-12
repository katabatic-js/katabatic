/**
 * @typedef {Object} TokenType
 * @property {string} label
 * @property {Array<number>} [charCodes]
 * @property {(char: number) => boolean} [test]
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
 * @param {(char: number) => boolean} test
 * @returns {TokenType}
 */
function stringTT(label, test) {
    return { label, test }
}

export const TokenTypes = {
    name: stringTT('name', name),
    text: stringTT('text', text),

    // html punctuation
    lte: charTT('<', [60]),
    gte: charTT('>', [62]),
    slashGte: charTT('/>', [47, 62]),
    lteSlash: charTT('</', [60, 47]),
    eq: charTT('=', [61]),
    quote: charTT('\'', [39]),
    doubleQuote: charTT('"', [34]),

    // block punctuation
    quoteBraceL: charTT('\'{', [39, 123]),
    doubleQuoteBraceL: charTT('"{', [34, 123]),
    braceRQuote: charTT('}\'', [125, 39]),
    braceRDoubleQuote: charTT('}"', [125, 34]),
    braceL: charTT('{', [123]),
    braceR: charTT('}', [125]),
    braceLHash: charTT('{#', [123, 35]),
    braceLColumn: charTT('{:', [123, 58]),
    braceLSlash: charTT('{/', [123, 47]),
    parenthesesL: charTT('(', [40]),
    parenthesesR: charTT(')', [41]),
}

function name(code) {
    if (code === 45) return true
    if (code < 48) return false
    if (code < 58) return true
    if (code < 65) return false
    if (code < 91) return true
    if (code < 123) return true
    return false
}

function text(code) {
    if (code === 10) return true
    if (code === 32) return true
    if (code === 47) return true
    if (code < 48) return false
    if (code < 58) return true
    if (code < 65) return false
    if (code < 91) return true
    if (code < 123) return true
    return false
}
