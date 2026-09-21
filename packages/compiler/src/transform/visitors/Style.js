import { generate } from 'css-tree'
import * as b from '../../builders.js'
import { appendExpression, appendText } from '../../utils/template.js'

export function Style(node, ctx) {
    node = ctx.next() ?? node

    const css = generate(node.content)
    const style = { text: [''], expressions: [] }

    // handle modules
    const tokens = css.split(/(\$Module_\d+)/)
    for (const token of tokens) {
        token.startsWith('$Module_')
            ? appendExpression(style, b.$name(token))
            : appendText(style, token)
    }

    const styleStmt = b.declaration('SHEET', b.$$cssStyleSheet(b.template(style)))
    ctx.state.styles.push(styleStmt)

    appendText(ctx.state.template, '<!-- -->')
}
