import * as b from '../../../builders.js'
import { append } from '../../../utils/misc.js'
import { clx } from '../../../css.js'

export function Attribute(node, ctx) {
    let value = node.value
    if (node.name === 'id' && node.metadata?.isScoped) {
        if (value[0].type === 'Text') {
            value = [b.text(`${value[0].data}-${ctx.state.context.hash}`)]
        } else {
            value = [...value, b.text(`-${ctx.state.context.hash}`)]
        }
    }
    if (node.name === 'class' && node.metadata?.isScoped) {
        if (value[0].type === 'Text') {
            value = [b.text(clx(value[0].data, `drop-${ctx.state.context.hash}`))]
        } else {
            value = [...value, b.text(` drop-${ctx.state.context.hash}`)]
        }
    }

    append(ctx.state.text, ` ${node.name}="`)
    for (const val of value) {
        ctx.visit(val)
    }
    append(ctx.state.text, `"`)
}
