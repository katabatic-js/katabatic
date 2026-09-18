import { generate } from 'css-tree'
import * as b from '../../builders.js'
import { appendExpression, appendText } from '../../utils/template.js'

export function Style(node, ctx) {
    node = ctx.next() ?? node

    const style = generate(node.content)

    // handle modules
    const tokens = style.split(/(\$Module_\d+)/)
    for (const token of tokens) {
        token.startsWith('$Module_')
            ? appendExpression(ctx.state.style, b.$name(token))
            : appendText(ctx.state.style, token)
    }

    appendText(ctx.state.template, '<!-- -->')
}
