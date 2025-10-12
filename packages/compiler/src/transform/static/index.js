import { walk } from 'zimmerframe'
import { Element } from './visitors/Element.js'
import { Text } from './visitors/Text.js'
import { Program } from './visitors/Program.js'
import { Template } from './visitors/Template.js'
import { ExpressionTag } from './visitors/ExpressionTag.js'
import { SlotElement } from './visitors/SlotElement.js'
import { Attribute } from './visitors/Attribute.js'
import { Style } from './visitors/Style.js'
import { Script } from './visitors/Script.js'
import { CssTree, Selector } from '../visitors/Selector.js'
import { CallExpression } from '../visitors/CallExpression.js'
import { IfBlock } from './visitors/IfBlock.js'
import { EachBlock } from './visitors/EachBlock.js'

const templateVisitors = {
    Attribute,
    Element,
    SlotElement,
    Text,
    ExpressionTag,
    Template,
    Style,
    Script,
    CallExpression,
    IfBlock,
    EachBlock,
    // common visitors
    Selector,
    ...CssTree
}

const scriptVisitors = {
    Program
}

export function transform(ast, analysis, context) {
    const template = walk(ast.template, { analysis, context }, templateVisitors)
    return walk(ast.script.content, { analysis, template, context }, scriptVisitors)
}
