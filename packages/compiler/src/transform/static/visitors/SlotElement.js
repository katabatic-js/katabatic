import * as b from '../../../builders.js'
import { appendExpression } from '../../../utils/template.js'

export function SlotElement(node, ctx) {
    node = ctx.next() ?? node

    appendExpression(ctx.state.template, b.member(b.id('slot'), b.id('default')))
}
