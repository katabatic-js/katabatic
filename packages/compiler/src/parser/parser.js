import { parseRoot } from './root.js'

/** @typedef {import('./tokentype.js').TokenType} TokenType */

/**
 * @typedef {Object} Token
 * @property {TokenType} type
 * @property {number} start
 * @property {number} end
 * @property {string} [value]
 */

/**
 * * @member {string} input
 */
export class Parser {
    constructor(input) {
        this.input = input

        this.start = 0
        this.end = 0
        this.pos = 0
        this.type = undefined
        this.value = undefined
    }

    parse() {
        return parseRoot(this)
    }

    /**
     *
     * @param {Array<TokenType>} types
     * @param {Token} [after]
     * @returns {Token}
     */
    peakToken(types, after) {
        for (const type of types) {
            let token

            if (type.charCodes) {
                token = this.peakCharToken(type, after)
            } else {
                token = this.peakStringToken(type, after)
            }

            if (token) return token
        }
        return null
    }

    /**
     *
     * @param {Array<TokenType>} types
     */
    expectToken(types) {
        for (const type of types) {
            if (type.charCodes) {
                if (this.readCharToken(type)) return
            } else {
                if (this.readStringToken(type)) return
            }
        }
        throw new Error(`unexpected token ${this.input[this.pos]} at position ${this.pos}`)
    }

    /**
     *
     * @param {Array<TokenType>} types
     * @returns boolean
     */
    readToken(types) {
        for (const type of types) {
            if (type.charCodes) {
                if (this.readCharToken(type)) return true
            } else {
                if (this.readStringToken(type)) return true
            }
        }
        return false
    }

    /**
     *
     * @param {TokenType} type
     * @returns {boolean}
     */
    readStringToken(type) {
        const start = this.pos
        while (this.pos < this.input.length) {
            if (!type.test(this.input.charCodeAt(this.pos))) break
            this.pos++
        }

        if (this.pos !== start) {
            this.type = type
            this.start = start
            this.end = this.pos
            this.value = this.input.substring(this.start, this.end)
            return true
        }
        return false
    }

    /**
     *
     * @param {TokenType} type
     * @param {Token} after
     * @returns {Token}
     */
    peakStringToken(type, after) {
        if (after === null) return null

        const start = after?.end ?? this.pos
        let pos = start
        while (pos < this.input.length) {
            if (!type.test(this.input.charCodeAt(pos))) break
            pos++
        }

        if (pos !== start) {
            return {
                type,
                start,
                end: pos,
                value: this.input.substring(start, pos)
            }
        }
        return null
    }

    /**
     *
     * @param {TokenType} type
     * @returns {boolean}
     */
    readCharToken(type) {
        if (this.isCharToken(type)) {
            this.type = type
            this.start = this.pos
            this.pos += type.charCodes.length
            this.end = this.pos
            return true
        }
        return false
    }

    /**
     *
     * @param {TokenType} type
     * @param {Token} [after]
     * @returns {Token}
     */
    peakCharToken(type, after) {
        if (after === null) return null

        const pos = after?.end ?? this.pos
        if (this.isCharToken(type, pos)) {
            return {
                type,
                start: pos,
                end: pos + type.charCodes.length
            }
        }
        return null
    }

    /**
     *
     * @param {TokenType} type
     * @param {number} [pos]
     * @returns {boolean}
     */
    isCharToken(type, pos) {
        assert(!!type.charCodes)

        pos ??= this.pos
        return (
            this.input.charCodeAt(pos) === type.charCodes[0] &&
            (type.charCodes[1] ? this.input.charCodeAt(pos + 1) === type.charCodes[1] : true) &&
            (type.charCodes[2] ? this.input.charCodeAt(pos + 2) === type.charCodes[2] : true)
        )
    }

    token() {
        return {
            type: this.type,
            start: this.start,
            end: this.end,
            value: this.value
        }
    }

    peakWhitespaces(after) {
        if (after === null) return null

        let pos = after?.end ?? this.pos
        const start = pos

        while (this.pos < this.input.length) {
            const code = this.input.charCodeAt(pos)
            if (code === 10 || code === 32) {
                pos++
                continue
            }
            break
        }

        if (pos !== start) {
            return {
                type: { label: 'whitespace' },
                start,
                end: pos
            }
        }
        return null
    }

    skipWhitespaces() {
        while (this.pos < this.input.length) {
            const code = this.input.charCodeAt(this.pos)
            if (code === 10 || code === 32) {
                this.pos++
                continue
            }
            break
        }
    }

    raiseUnexpectedToken() {
        throw new Error(`unexpected token ${this.input[this.pos]} at position ${this.pos}`)
    }

    isEOF() {
        return this.pos === this.input.length
    }
}

/**
 *
 * @param {number} code
 * @returns {boolean}
 */
function isIdentifierChar(code) {
    if (code < 48) return false
    if (code < 58) return true
    if (code < 65) return false
    if (code < 91) return true
    if (code < 123) return true
    return false
}

/**
 *
 * @param {boolean} test
 */
function assert(test) {
    if (!test) throw new Error('assert error')
}
