import { getModuleId, nextElementId, pathStmt } from '../context.js'
import * as b from '../../builders.js'
import { clx } from '../../css.js'

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

    const text = []
    const expressions = []

    for (const val of value) {
        ctx.visit(val, { ...ctx.state, text, expressions })
    }

    if (expressions.length > 0) {
        // expression attribute
        const rootId = nextElementId(ctx)
        const rootStmt = b.declaration(rootId, pathStmt(ctx))
        ctx.state.init.elem.push(rootStmt)

        if (node.name.startsWith('on')) {
            const stmt = b.assignment(b.member(rootId, node.name), b.arrowFunc(expressions[0]))
            ctx.state.handlers.push(stmt)
            return
        }

        const module = ctx.state.module
        if (module) {
            const moduleId = getModuleId(ctx, module.name)
            const stmt = b.$effect([b.$set(moduleId, rootId, node.name, expressions[0])])
            ctx.state.effects.push(stmt)
            return
        }

        const stmt = b.$effect([b.setAttribute(rootId, b.literal(node.name), expressions[0])])
        ctx.state.effects.push(stmt)
        return
    }

    // text attribute
    ctx.state.template.push(` ${node.name}="${text[0] ?? 'true'}"`)
}
