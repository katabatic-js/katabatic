import { print } from 'esrap'
import { appendText } from '../../../utils/template.js'

export function Script(node, ctx) {
    node = ctx.next() ?? node

    const { code } = print(node.content)
    appendText(ctx.state.template, `<script type="module">${code}</script>`)
}
