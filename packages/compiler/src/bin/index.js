#! /usr/bin/env node

import path from 'path'
import { watch as watchDir, existsSync } from 'fs'
import { startDevServer } from '@web/dev-server'
import { walkDir } from '../utils/files.js'
import * as argv from '../utils/argv.js'
import { serve } from './serve.js'
import { buildIndex, buildModule, buildRouter } from './build.js'
import { hash } from '../utils/misc.js'

const command = argv.command()

const rootPath = path.resolve(argv.option('root')) ?? process.cwd()
const srcDirPath = path.join(rootPath, argv.option('srcDir') ?? '.')
const outDirPath = path.join(rootPath, argv.option('outDir') ?? '.')
const routesDirPath = path.join(srcDirPath, argv.option('routesDir') ?? './routes')
const hasRoutes = existsSync(routesDirPath)

const rewriteRelativeImportExtensions = argv.option('rewriteRelativeImportExtensions') ?? false

switch (command) {
    case 'build':
        build()
        break
    default:
        watch(build())
        start()
        break
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

        if (entry.name.endsWith('.html')) {
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

        if (fileName.endsWith('.html')) {
            const srcFilePath = path.join(srcDirPath, fileName)
            const module = buildModule(resolve(srcFilePath, true))
            registry[module.ref] = module
            return
        }
    })
}

function start() {
    const plugins = []

    if (hasRoutes) {
        plugins.push(serve(outDirPath))
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
    const fileName = srcFileName.replace('.html', '.js')
    const filePath = path.join(parentPath, fileName)

    const ref = path.relative(srcDirPath, srcFilePath)
    let routerImport = `./${path.relative(outDirPath, filePath)}`

    if (isModule) {
        const name = path.basename(fileName, '.js')
        const moduleHash = hash(srcFilePath)

        let route = path.relative(routesDirPath, srcParentPath)
        route = route.startsWith('..') ? undefined : `/${route}`
        routerImport = !!route ? routerImport : undefined
        const isPage = !!route && srcFileName === 'page.html'
        const isLayout = !!route && srcFileName === 'layout.html'

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
