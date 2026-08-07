import { describe, expect, it } from 'vitest'
import { parse } from '../../src/parser'

describe('parse()', () => {
    describe('with template containing comments', () => {
        it('should return an AST succesfully', () => {
            const ast = parse(`<template><div><!-- comment --></div></template>`)
            expect(ast).not.toBeNull()
        })
    })
    describe('with template containing &', () => {
        it('should return an AST succesfully', () => {
            const ast = parse(`<template><div>&</div></template>`)
            expect(ast).not.toBeNull()
        })
    })
})
