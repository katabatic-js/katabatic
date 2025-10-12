import { generate } from 'css-tree'
import { append } from '../../../utils/misc.js'

export function Style(node, ctx) {
    node = ctx.next() ?? node
    
    const css = generate(node.content)
    append(ctx.state.text, `<style>${css}</style>`)
}