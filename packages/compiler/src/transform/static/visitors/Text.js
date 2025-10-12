import { append } from '../../../utils/misc.js'

export function Text(node, ctx) {
    append(ctx.state.text, node.data)
}
