import * as b from '../../builders.js'

export function Template(node, ctx) {
    const templates = []
    const styles = []
    const template = { text: [''], expressions: [] }
    const init = { elem: [], text: [] }
    const binds = []
    const effects = []
    const animates = []
    const eventListeners = []
    const blocks = []

    templates.push({}) //hold first slot

    ctx.visit(node.fragment, {
        ...ctx.state,
        templates,
        styles,
        template,
        init,
        binds,
        effects,
        animates,
        eventListeners,
        blocks
    })

    const templateStmt = b.declaration('TEMPLATE_1', b.$$template(b.template(template)))
    templates[0] = templateStmt

    const stmt1 = b.declaration('fragment', b.importNode(b.member(b.call('TEMPLATE_1'), 'content')))

    const stmts2 = [
        ...init.elem,
        ...init.text,
        ...binds,
        ...effects,
        ...animates,
        ...eventListeners,
        ...blocks
    ]

    const rootId = node.metadata?.shadowRootMode ? b.shadow() : b.thisExp()
    const stmt3 = b.replaceChildren(rootId, b.id('fragment'))

    const bodyStmt = [stmt1, ...stmts2, stmt3]
    const block = b.$block(bodyStmt)

    return { type: 'TemplateMod', metadata: node.metadata, styles, templates, block }
}
