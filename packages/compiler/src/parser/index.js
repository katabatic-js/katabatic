import { Parser } from './parser.js'

/**
 * 
 * @param {string} input 
 * @returns 
 */
export function parse(input) {
    return new Parser(input).parse()
}
