import { print } from 'esrap'
import * as b from '../builders.js'

export * from './html.js'

export function createRouter(registry) {
    const routes = b.object()
    const imports = { page: [], layout: [] }

    for (const entry of Object.values(registry)) {
        if (entry.isPage) {
            const node = makeNode(routes, entry.route)
            const pageId = b.id(`page_${imports.page.length + 1}`)
            imports.page.push(b.importNamespace(pageId, entry.routerImport))
            node.properties.push(b.property('_page', pageId))
            continue
        }

        if (entry.isLayout) {
            const node = makeNode(routes, entry.route)
            const layoutId = b.id(`layout_${imports.layout.length + 1}`)
            imports.layout.push(b.importNamespace(layoutId, entry.routerImport))
            node.properties.push(b.property('_layout', layoutId))
            continue
        }

        if (entry.isIndex) {
            imports.index = b.importSpecifier('renderIndex', entry.routerImport)
            continue
        }
    }

    return printRouter({
        imports: print(b.program([...imports.layout, ...imports.page, imports.index])),
        routes: print(b.program([routes]))
    })
}

function makeNode(node, path) {
    const tokens = path.split('/').filter((t) => t !== '')

    for (let token of tokens) {
        const param = token.startsWith('[') && token.endsWith(']') ? token.slice(1, -1) : undefined
        token = param ? '*' : token

        const prop = node.properties.find((p) => p.key.value === token)
        if (prop) {
            node = prop.value
        } else {
            const child = b.object()
            if (param) {
                child.properties.push(b.property('_param', b.literal(param)))
            }
            node.properties.push(b.property(b.literal(token), child))
            node = child
        }
    }
    return node
}

function printRouter({ imports, routes }) {
    return {
        code: `${imports.code}

const ROUTES = ${routes.code}

export async function route(path) {
    const route = resolve(path)

    if (route) {
        const { modules, ...context } = route
        const data = await load(modules, context)
        const result = render(modules, data)
        
        return renderIndex({ body: result })
    }
}

function load(modules, context) {
    const data = []
    for (let i = 0; i < modules.length; i++) {
        data.push(modules[i].load(context, data[i - 1]))
    }
    return Promise.all(data)
}

function render(modules, data) {
    let result
    for (let i = modules.length - 1; i >= 0; i--) {
        result = modules[i].render(data[i], { default: result })
    }
    return result
}

function resolve(path) {
    const modules = []
    const params = {}
    const route = []
    const tokens = path.split('/').filter((t) => t !== '')

    let node = ROUTES

    if (node._layout) {
        modules.push(node._layout)
    }

    for (const token of tokens) {
        node = node[token] ?? node['*']
        if (!node) break

        if (node._layout) {
            modules.push(node._layout)
        }

        if (node._param) {
            params[node._param] = token
            route.push(\`[\${node._param}]\`)
        } else{
            route.push(token)
        }
    }

    if (node?._page) {
        modules.push(node._page)
        return { modules, route: \`/\${route.join('/')}\`, params }
    }
}
`
    }
}
