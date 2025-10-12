import * as b from '../../../builders.js'

export function Template(node, ctx) {
    const text = ['']
    const expressions = []
    const blocks = []

    ctx.visit(node.fragment, { ...ctx.state, text, expressions, blocks })

    const template = b.template(text, expressions)
    return { type: 'TemplateMod', template, blocks }
}
