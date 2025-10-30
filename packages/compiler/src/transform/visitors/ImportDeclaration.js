import * as b from '../../builders.js'

export function ImportDeclaration(node) {
    if (node.metadata?.isModule) {
        const moduleId = `$Module_${node.metadata.index + 1}`
        const value = `${node.metadata.dirname}/${node.metadata.basename}.js`
        const raw = undefined

        return {
            ...node,
            specifiers: [...node.specifiers, b.importNamespaceSpecifier(moduleId)],
            source: { ...node.source, value, raw }
        }
    }
}
