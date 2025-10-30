import { matchModule } from '../../module-matcher.js'
import { getTemplate } from '../context.js'

export function ImportDeclaration(node, ctx) {
    const template = getTemplate(ctx)

    const { dirname, basename } = parse(node.source.value)
    if (basename.includes('-')) {
        const index = ctx.state.modules.length
        const isModule = matchModule(basename, index, template)

        if (isModule) {
            node.metadata ??= {}
            node.metadata.isModule = isModule
            node.metadata.basename = basename
            node.metadata.dirname = dirname
            node.metadata.index = index

            ctx.state.modules.push(basename)
        }
    }
}

function parse(filename) {
    const tokens = filename.split('/')
    const basename = tokens.pop()
    const index = basename.lastIndexOf('.')

    return {
        dirname: tokens.join('/'),
        basename: index >= 0 ? basename.substring(0, index) : basename
    }
}
