import * as b from '../../builders.js'

export function ImportDeclaration(node, ctx) {
    if (node.metadata?.isModule) {
        const moduleId = `$Module_${node.metadata.index + 1}`
        const raw = undefined

        let value
        if (ctx.state.context.rewriteRelativeImportExtensions) {
            value = `${node.metadata.dirname}/${node.metadata.filename}.js`
        } else {
            value = `${node.metadata.dirname}/${node.metadata.filename}.${node.metadata.extension}`
        }

        return {
            ...node,
            specifiers: [...node.specifiers, b.importNamespaceSpecifier(moduleId)],
            source: { ...node.source, value, raw }
        }
    }
}
