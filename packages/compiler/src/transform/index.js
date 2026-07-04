import { walk } from 'zimmerframe'
import * as b from '../builders.js'
import { Program } from './visitors/Program.js'
import { Identifier } from './visitors/Identifier.js'
import { ExpressionTag } from './visitors/ExpressionTag.js'
import { Template } from './visitors/Template.js'
import { MethodDefinition } from './visitors/MethodDefinition.js'
import { Element } from './visitors/Element.js'
import { Text } from './visitors/Text.js'
import { Fragment } from './visitors/Fragment.js'
import { Style } from './visitors/Style.js'
import { Attribute } from './visitors/Attribute.js'
import { ClassBody } from './visitors/ClassBody.js'
import { ImportDeclaration } from './visitors/ImportDeclaration.js'
import { CssTree, Selector } from './visitors/Selector.js'
import { CallExpression } from './visitors/CallExpression.js'
import { IfBlock } from './visitors/IfBlock.js'
import { EachBlock } from './visitors/EachBlock.js'
import { CustomElement } from './visitors/CustomElement.js'
import { AssignmentExpression } from './visitors/AssignmentExpression.js'
import { PropertyDefinition } from './visitors/PropertyDefinition.js'
import { PrivateIdentifier } from './visitors/PrivateIdentifier.js'
import { TypeSelector } from './visitors/TypeSelector.js'

const templateVisitors = {
    Template,
    Identifier,
    ExpressionTag,
    Element,
    CustomElement,
    Text,
    Fragment,
    Style,
    Attribute,
    CallExpression,
    IfBlock,
    EachBlock,
    Selector,
    TypeSelector,
    ...CssTree
}

const scriptVisitors = {
    Program,
    MethodDefinition,
    ClassBody,
    ImportDeclaration,
    CallExpression,
    AssignmentExpression,
    PropertyDefinition,
    PrivateIdentifier
}

export function transform(ast, analysis, context) {
    let template
    
    if (ast.template) {
        template = walk(ast.template, { analysis, context }, templateVisitors)
    }
    return walk(ast.script?.content ?? b.program(), { analysis, template, context }, scriptVisitors)
}
