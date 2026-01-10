import { walk } from 'zimmerframe'
import * as b from './builders.js'
import * as is from './checkers.js'

export function $hot(program) {
    const stmts1 = []
    const stmts2 = []

    walk(program, undefined, {
        PropertyDefinition: (node) => {
            if (!node.static) {
                const stmt = b.assignment(b.thisMember(node.key), node.value, '??=')
                stmts1.push(stmt)
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
                        stmts2.push(stmt)
                        continue
                    }
                    stmts2.push(_node)
                }
            }
        }
    })

    return b.exp(b.func('$hot', [...stmts1, ...stmts2]))
}
