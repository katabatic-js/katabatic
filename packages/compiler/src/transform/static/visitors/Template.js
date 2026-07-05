export function Template(node, ctx) {
    const template = { text: [''], expressions: [] }
    const blocks = []

    ctx.visit(node.fragment, { ...ctx.state, template, blocks })

    return { type: 'TemplateMod', template, blocks }
}
