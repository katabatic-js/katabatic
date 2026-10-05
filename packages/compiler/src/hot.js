import { walk } from 'zimmerframe'
import * as b from './builders.js'
import * as is from './checkers.js'

export function $hot(program, ctx) {
    const stmts1 = []
    const stmts2 = []
    const stmts3 = []

    const sheetStmts = []
    if (ctx.state.template?.styles[0]) {
        const styleRootId = ctx.state.template?.metadata?.shadowRootMode
            ? b.shadow()
            : b.getRootNode()
        const stmt = b.$$removeStyleSheet(styleRootId, 'SHEET')
        sheetStmts.push(stmt)
    }

    const stmt = b.ifStmt('dispose', [...sheetStmts, b.returnStmt()])
    stmts1.push(stmt)

    walk(program, undefined, {
        PropertyDefinition: (node) => {
            if (!node.static) {
                const stmt = b.assignment(b.thisMember(node.key), node.value, '??=')
                stmts2.push(stmt)
            }
        },
        MethodDefinition: (node) => {
            if (node.key.name === 'constructor') {
                for (let _node of node.value.body.body) {
                    if (is.superCall(_node)) {
                        continue
                    }

                    if (is.thisAssignment(_node)) {
                        _node = is.expression(_node) ? _node.expression : _node

                        const stmt = { ..._node, operator: '??=' }
                        stmts3.push(stmt)
                        continue
                    }
                    stmts3.push(_node)
                }
            }
        }
    })

    return b.exp(b.$hot([...stmts1, ...stmts2, ...stmts3]))
}
