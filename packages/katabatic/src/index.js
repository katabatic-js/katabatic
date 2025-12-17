#! /usr/bin/env node
import path from 'path'
import { watch as watchDir, existsSync } from 'fs'
import { parseArgs } from 'node:util'
import { startDevServer } from '@web/dev-server'
import { walkDir } from './utils/files.js'
import { hash } from './utils/misc.js'
import { printHelp, withHelp } from './utils/help.js'
import { route } from './route.js'
import { buildIndex, buildModule, buildRouter } from './build.js'

const options = {
    root: { type: 'string', short: 'r', description: 'project root directory (default: .)' },
    srcDir: { type: 'string', description: 'src files directory (default .)' },
    outDir: { type: 'string', description: 'out files directory (default .)' },
    routesDir: {
        type: 'string',
        description:
            'page and layout files directory when using the file system router (default ./routes)'
    },
    help: { type: 'boolean', short: 'h', description: 'get help' },
    watch: { type: 'boolean', short: 'w', description: 'watches the file system' },
    serve: { type: 'boolean', short: 's', description: 'starts the development server' },
    rewriteRelativeImportExtensions: {
        type: 'boolean',
        description: 'rewrite imported katabatic files extension (.html or .ktb) in .js'
    }
}

const { values: args } = withHelp(options, () => parseArgs({ options }))

const rootPath = path.resolve(args.root ?? '.')
const srcDirPath = path.join(rootPath, args.srcDir ?? '.')
const outDirPath = path.join(rootPath, args.outDir ?? '.')
const routesDirPath = path.join(srcDirPath, args.routesDir ?? './routes')
const hasRoutes = existsSync(routesDirPath)

const rewriteRelativeImportExtensions = args.rewriteRelativeImportExtensions ?? false

if (args.help) {
    printHelp(options)
} else {
    const registry = build()
    if (args.watch) watch(registry)
    if (args.serve) serve()
}

function build() {
    const registry = {}

    walkDir(srcDirPath, {}, (entry) => {
        if (entry.name === 'index.html') {
            if (!hasRoutes) return

            const srcFilePath = path.join(entry.parentPath, entry.name)
            const index = buildIndex(resolve(srcFilePath))
            registry[index.ref] = index
            return
        }

        if (entry.name.endsWith('.html') || entry.name.endsWith('.ktb')) {
            const srcFilePath = path.join(entry.parentPath, entry.name)
            const module = buildModule(resolve(srcFilePath, true))
            registry[module.ref] = module
            return
        }
    })

    if (hasRoutes) {
        buildRouter(outDirPath, registry)
    }
    return registry
}

function watch(registry) {
    watchDir(srcDirPath, { recursive: true }, (event, fileName) => {
        if (fileName.endsWith('index.html')) {
            if (!hasRoutes) return

            const srcFilePath = path.join(srcDirPath, fileName)
            const index = buildIndex(resolve(srcFilePath))
            registry[index.ref] = index
            return
        }

        if (fileName.endsWith('.html') || fileName.endsWith('.ktb')) {
            const srcFilePath = path.join(srcDirPath, fileName)
            const module = buildModule(resolve(srcFilePath, true))
            registry[module.ref] = module
            return
        }
    })
}

function serve() {
    const plugins = []

    if (hasRoutes) {
        plugins.push(route(outDirPath))
    }

    startDevServer({
        config: {
            rootDir: rootPath,
            port: 3000,
            watch: true,
            open: true,
            nodeResolve: true,
            plugins
        },
        readCliArgs: false,
        readFileConfig: false
    })
}

function resolve(srcFilePath, isModule) {
    const srcFileName = path.basename(srcFilePath)
    const srcParentPath = path.dirname(srcFilePath)

    const parentPath = path.join(outDirPath, path.relative(srcDirPath, srcParentPath))
    const fileName = srcFileName.replace(/\.html|\.ktb$/, '.js')
    const filePath = path.join(parentPath, fileName)

    const ref = path.relative(srcDirPath, srcFilePath)
    let routerImport = `./${path.relative(outDirPath, filePath)}`

    if (isModule) {
        const name = path.basename(fileName, '.js')
        const moduleHash = hash(srcFilePath)

        let route = path.relative(routesDirPath, srcParentPath)
        route = route.startsWith('..') ? undefined : `/${route}`
        routerImport = !!route ? routerImport : undefined
        const isPage = !!route && !!srcFileName.match(/^page(\.html|\.ktb)$/)
        const isLayout = !!route && !!srcFileName.match(/^layout(\.html|\.ktb)$/)

        return {
            ref,
            name,
            customElementName: `${name}-${moduleHash}`,
            route,
            isPage,
            isLayout,
            routerImport,
            hash: moduleHash,
            rewriteRelativeImportExtensions,
            src: {
                filePath: srcFilePath
            },
            out: {
                parentPath,
                fileName,
                filePath
            }
        }
    }

    return {
        ref,
        isIndex: true,
        routerImport,
        src: {
            filePath: srcFilePath
        },
        out: {
            parentPath,
            fileName,
            filePath
        }
    }
}
