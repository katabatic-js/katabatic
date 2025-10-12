import path from 'path'
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { compile } from '../index.js'
import { createRouter } from '../router/index.js'
import { compileHtmlIndex } from '../router/html.js'

export function buildModule({ src, out, ...context }) {
    const source = readFileSync(src.filePath, { encoding: 'utf8' })
    const { code, ...module } = compile(source, context)

    if (!existsSync(out.parentPath)) {
        mkdirSync(out.parentPath, { recursive: true })
    }
    writeFileSync(out.filePath, code)

    return module
}

export function buildIndex({ src, out, ...context }) {
    const source = readFileSync(src.filePath, { encoding: 'utf8' })
    const { code, ...index } = compileHtmlIndex(source, context)

    if (!existsSync(out.parentPath)) {
        mkdirSync(out.parentPath, { recursive: true })
    }
    writeFileSync(out.filePath, code)

    return index
}

export function buildRouter(outDirPath, registry) {
    const result = createRouter(registry)

    if (!existsSync(outDirPath)) {
        mkdirSync(outDirPath, { recursive: true })
    }
    writeFileSync(path.join(outDirPath, 'router.js'), result.code)
}
