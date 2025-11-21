import * as b from '../../builders.js'

export function Template(node, ctx) {
    const css = []
    const template = { text: [''], expressions: [] }
    const init = { elem: [], text: [], binding: [] }
    const effects = []
    const handlers = []
    const blocks = []

    ctx.visit(node.fragment, {
        ...ctx.state,
        css,
        template,
        init,
        effects,
        handlers,
        blocks
    })

    const rootId = node.metadata?.shadowRootMode ? b.shadow() : b.thisExp()

    const stmts1 = [
        b.declaration('template', b.createElement('template')),
        b.assignment(b.innerHTML('template'), b.binary('+', b.id('TEMPLATE'), b.id('STYLE')))
    ]
    const stmts2 = [...init.elem, ...init.text, ...init.binding, ...effects, ...handlers, ...blocks]
    const stmt3 = b.replaceChildren(rootId, b.member('template', 'content'))

    const bodyStmt = [...stmts1, ...stmts2, stmt3]
    const block = b.$block(bodyStmt)

    return { type: 'TemplateMod', metadata: node.metadata, css, template, block }
}
