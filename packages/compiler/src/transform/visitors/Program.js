import * as b from '../../builders.js'
import { $hot } from '../../hot.js'

export function Program(node, ctx) {
    node = ctx.next() ?? node

    let stmt
    const stmts1 = []
    const stmts2 = []

    if (!node.metadata?.hasCustomElementClass) {
        const stmt = ctx.visit(b.customElement(ctx.state.context.customElementClassName))
        stmts2.push(stmt)
    }

    if (!node.metadata?.hasDefineCustomElement) {
        stmt = b.defineCustomElement(
            ctx.state.context.customElementName,
            node.metadata?.customElement.className ?? ctx.state.context.customElementClassName
        )
        stmts2.push(stmt)
    }

    // import
    stmt = b.importSpecifier('$$', '@katabatic/runtime')
    stmts1.push(stmt)

    // html template
    if (ctx.state.template?.template) {
        const { template } = ctx.state.template
        stmt = b.declaration('TEMPLATE', b.template(template))
        stmts1.push(stmt)
    }

    // style
    if (ctx.state.template?.style) {
        const { style } = ctx.state.template
        stmt = b.declaration('STYLE', b.template(style))
        stmts1.push(stmt)
    }

    //$hot
    if (ctx.state.context.hot) {
        const stmt = $hot({ ...node, body: [...node.body, ...stmts2] })
        stmts2.push(stmt)
    }

    // $set
    const properties = [
        ...(node.metadata?.customElement.properties ?? []),
        ...(node.metadata?.customElement.setters ?? [])
    ]
    if (properties.length > 0) {
        stmt = b.$setDecl([
            b.ifStmt(
                b.includes(b.array(properties), 'attribute'),
                [b.setProperty('node', 'attribute', 'value')],
                [b.setAttribute('node', 'attribute', 'value')]
            )
        ])
    } else {
        stmt = b.$setDecl([b.setAttribute('node', 'attribute', 'value')])
    }
    stmts2.push(stmt)

    // $name
    stmt = b.exp(
        b.declaration(
            '$name',
            b.literal(node.metadata?.customElement.name ?? ctx.state.context.customElementName)
        )
    )
    stmts2.push(stmt)

    // $class
    stmt = b.exp(
        b.declaration(
            '$class',
            b.id(node.metadata?.customElement.className ?? ctx.state.context.customElementClassName)
        )
    )
    stmts2.push(stmt)

    // $shadowRootMode
    if (ctx.state.template?.metadata?.shadowRootMode) {
        const { shadowRootMode } = ctx.state.template.metadata
        stmt = b.exp(b.declaration('$shadowRootMode', b.literal(shadowRootMode)))
        stmts2.push(stmt)
    }

    return {
        ...node,
        body: [
            ...node.body.filter((n) => n.type === 'ImportDeclaration'),
            ...stmts1,
            ...node.body.filter((n) => n.type !== 'ImportDeclaration'),
            ...stmts2
        ]
    }
}
