import * as b from '../../builders.js'

export function Program(node, ctx) {
    node = ctx.next() ?? node

    const importStmts = [b.importSpecifier('$$', '@drop/runtime')]
    const defineStmts = []

    // html template
    const template = ctx.state.template.template.join('')
    const templateStmt = b.declaration('TEMPLATE', b.literal(template))

    // style
    let style = ''
    if (ctx.state.template.css.length >= 0) {
        style = `<style>${ctx.state.template.css.join('')}</style>`
    }
    const styleStmt = b.declaration('STYLE', b.literal(style))

    // modules
    for (const [index, name] of [...ctx.state.template.modules].entries()) {
        const module = ctx.state.context.getModule(name)
        const moduleId = b.id(`$Module_${index + 1}`)
        importStmts.push(b.importNamespace(moduleId, ctx.state.context.moduleImport(module)))
        defineStmts.push(b.$define(moduleId))
    }

    // define declaration
    const defineDeclStmt = b.$defineDecl([
        b.ifStmt(b.unary('!', b.getCustomElement(ctx.state.context.customElementName)), [
            b.defineCustomElement(
                ctx.state.context.customElementName,
                node.metadata?.customElement.className
            )
        ])
    ])

    // set declaration
    const properties = [
        ...node.metadata?.customElement.properties,
        ...node.metadata?.customElement.setters
    ]

    let setDecStmt
    if (properties.length > 0) {
        setDecStmt = b.$setDecl([
            b.ifStmt(
                b.includes(b.array(properties), 'attribute'),
                [b.setProperty('node', 'attribute', 'value')],
                [b.setAttribute('node', 'attribute', 'value')]
            )
        ])
    } else {
        setDecStmt = b.$setDecl([b.setAttribute('node', 'attribute', 'value')])
    }

    return {
        ...node,
        body: [
            ...importStmts,
            ...node.body,
            templateStmt,
            styleStmt,
            defineDeclStmt,
            setDecStmt,
            ...defineStmts
        ]
    }
}
