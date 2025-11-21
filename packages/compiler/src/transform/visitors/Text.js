import { appendText } from '../../utils/template.js'

export function Text(node, ctx) {
    appendText(ctx.state.template, node.data)
}
