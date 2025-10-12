import { print } from 'esrap'
import { parse } from './parser/index.js'
import { analyse } from './analyse/index.js'
import { transform } from './transform/index.js'
import { transform as transformStatic } from './transform/static/index.js'

export function compile(source, context) {
    const ast = parse(source)
    const analysis = analyse(ast)

    const result = analysis.isStatic
        ? transformStatic(ast, analysis, context)
        : transform(ast, analysis, context)

    return {
        ...context,
        ...print(result)
    }
}
