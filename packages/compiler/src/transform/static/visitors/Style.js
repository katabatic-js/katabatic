import { generate } from 'css-tree'
import { appendText } from '../../../utils/template.js'

export function Style(node, ctx) {
    node = ctx.next() ?? node
    
    const css = generate(node.content)
    appendText(ctx.state.template, `<style>${css}</style>`)
}