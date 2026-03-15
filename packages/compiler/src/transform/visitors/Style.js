import { generate } from 'css-tree'
import * as b from '../../builders.js'
import { appendExpression, appendText } from '../../utils/template.js'

export function Style(node, ctx) {
    node = ctx.next() ?? node

    const css = generate(node.content)
    const style = css.length > 0 ? `<style>${css}</style>` : ''

    // handle modules
    const tokens = style.split(/(\$Module_\d+)/)
    for (const token of tokens) {
        token.startsWith('$Module_')
            ? appendExpression(ctx.state.style, b.$name(token))
            : appendText(ctx.state.style, token)
    }

    appendText(ctx.state.template, '<!-- -->')
}
