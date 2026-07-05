import * as b from '../../../builders.js'
import { appendText } from '../../../utils/template.js'
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
            value = [b.text(clx(value[0].data, `ktb-${ctx.state.context.hash}`))]
        } else {
            value = [...value, b.text(` ktb-${ctx.state.context.hash}`)]
        }
    }

    appendText(ctx.state.template, ` ${node.name}`)
    if (value.length > 0) {
        appendText(ctx.state.template, `="`)
        for (const val of value) {
            ctx.visit(val)
        }
        appendText(ctx.state.template, `"`)
    }
}
