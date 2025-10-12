import { Client } from './client.js'

export function rootBlock(body) {
    const block = new Client()
    body(block)

    return {
        dispose() {
            block.dispose()
        }
    }
}
