import { matchModule } from '../../module-matcher.js'
import { getTemplate } from '../context.js'

export function ImportDeclaration(node, ctx) {
    const template = getTemplate(ctx)

    const { dirname, filename, extension } = parse(node.source.value)
    if (filename.includes('-')) {
        const index = ctx.state.modules.length
        const isModule = matchModule(filename, index, template)

        if (isModule) {
            node.metadata ??= {}
            node.metadata.isModule = isModule
            node.metadata.dirname = dirname
            node.metadata.filename = filename
            node.metadata.extension = extension
            node.metadata.index = index

            ctx.state.modules.push(filename)
        }
    }
}

function parse(path) {
    const dirnameTokens = path.split('/')
    const filenameTokens = dirnameTokens.pop().split('.')
    const extension = filenameTokens.pop()

    return {
        dirname: dirnameTokens.join('/'),
        filename: filenameTokens.join('.'),
        extension
    }
}
