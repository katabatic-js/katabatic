import { walk } from 'zimmerframe'
import { CallExpression } from './visitors/CallExpression.js'
import { ClassDeclaration } from './visitors/ClassDeclaration.js'
import { Template } from './visitors/Template.js'
import { Element } from './visitors/Element.js'
import { CssTree, Selector } from './visitors/Selector.js'
import { Attribute } from './visitors/Attribute.js'
import { IfBlock } from './visitors/IfBlock.js'
import { ClassBody } from './visitors/ClassBody.js'
import { Program } from './visitors/Program.js'
import { ExpressionTag } from './visitors/ExpressionTag.js'
import { EachBlock } from './visitors/EachBlock.js'
import { AssignmentExpression } from './visitors/AssignmentExpression.js'
import { MethodDefinition } from './visitors/MethodDefinition.js'
import { PropertyDefinition } from './visitors/PropertyDefinition.js'
import { ImportDeclaration } from './visitors/ImportDeclaration.js'
import { CustomElement } from './visitors/CustomElement.js'

const visitors = {
    Program,
    ImportDeclaration,
    CallExpression,
    ClassDeclaration,
    ClassBody,
    AssignmentExpression,
    MethodDefinition,
    PropertyDefinition,
    Template,
    Element,
    CustomElement,
    Attribute,
    ExpressionTag,
    IfBlock,
    EachBlock,
    Selector,
    ...CssTree
}

export function analyse(ast) {
    const state = {
        isStatic: false
    }

    walk(ast, state, visitors)

    return state
}
