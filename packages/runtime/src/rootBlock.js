import { Client } from './client.js'

export function rootBlock(fn) {
    const block = new Client()
    fn(block)
    return block
}
