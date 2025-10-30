import * as b from '../../builders.js'

export function Program(node, ctx) {
    node = ctx.next() ?? node

    let stmt
    const stmts1 = []
    const stmts2 = []

    // import
    stmt = b.importSpecifier('$$', '@drop/runtime')
    stmts1.push(stmt)

    // html template
    const template = ctx.state.template.template
    stmt = b.declaration('TEMPLATE', b.template(template))
    stmts1.push(stmt)

    // style
    const css = ctx.state.template.css
    const style = css.length >= 0 ? `<style>${ctx.state.template.css.join('')}</style>` : ''
    stmt = b.declaration('STYLE', b.literal(style))
    stmts1.push(stmt)

    // $name
    stmt = b.$nameDecl(node.metadata?.customElement.name ?? ctx.state.context.customElementName)
    stmts1.push(stmt)

    // $set
    const properties = [
        ...node.metadata?.customElement.properties,
        ...node.metadata?.customElement.setters
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
    stmts1.push(stmt)

    // defineCustomElement
    if (!node.metadata?.hasDefineCustomElement) {
        stmt = b.defineCustomElement(
            ctx.state.context.customElementName,
            node.metadata?.customElement.className
        )
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
