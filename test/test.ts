import { describe, expect, test } from '@jest/globals'
import * as L from '../src/lang'
import * as P from '../src/translator'
import * as S from '../src/sexp'
import * as T from '../src/typechecker'


const nat1: L.Exp = L.num(L.tynat, 5)
const sexp1: S.Sexp = {tag: 'atom', value: '5'}

const nat2: L.Exp = L.num(L.tynat, 17)
const sexp2: S.Sexp = {tag: 'atom', value: '17'}

const float1: L.Exp = L.num(L.tyfloat, 20.1)
const sexp3: S.Sexp = {tag: 'atom', value: '20.1'}

const float2: L.Exp = L.num(L.tyfloat, 0.75)
const sexp4: S.Sexp = {tag: 'atom', value: '0.75'}

const sexp5: S.Sexp = {tag: 'slist', exps: [{tag: 'atom', value: 'define'}, 
                                            {tag: 'atom', value: 'x'},
                                            {tag: 'atom', value: '1'}]}

const sexp6: S.Sexp = {tag: 'slist', exps: [{tag: 'atom', value: 'print'},
                                            {tag: 'atom', value: 'x'}]}



describe('Lexer & Parser', () => {
  test('integer', () => {
    expect(S.parse1('5')).toStrictEqual({tag: 'atom', value: '5'})
    expect(S.parse1('17')).toStrictEqual({tag: 'atom', value: '17'})
  })
  test('float', () => {
    expect(S.parse1('20.1')).toStrictEqual({tag: 'atom', value: '20.1'})
    expect(S.parse1('0.75')).toStrictEqual({tag: 'atom', value: '0.75'})
  })
  test('boolean', () => {
    expect(S.parse1('true')).toStrictEqual({tag: 'atom', value: 'true'})
    expect(S.parse1('false')).toStrictEqual({tag: 'atom', value: 'false'})
  })
  test('statements', () => {
    expect(S.parse('(define x 1) (print x)'))
      .toStrictEqual([sexp5, sexp6])
  })
})

describe('Translator', () => {
  test('integers', () => {
    expect(P.translateExp(sexp1)).toStrictEqual(nat1)
    expect(P.translateExp(sexp2)).toStrictEqual(nat2)
  })
  test('floats', () => {
    expect(P.translateExp(sexp3)).toStrictEqual(float1)
    expect(P.translateExp(sexp4)).toStrictEqual(float2)
  })
  test('booleans', () => {
    expect(P.translateExp({tag: 'atom', value: 'true'})).toStrictEqual(L.bool(true))
    expect(P.translateExp({tag: 'atom', value: 'false'})).toStrictEqual(L.bool(false))
  })
  test('statements', () => {
    expect(P.translateStmt(sexp5)).toStrictEqual(L.sdefine('x', L.num(L.tynat, 1)))
    expect(P.translateProg([sexp5, sexp6])).toStrictEqual([L.sdefine('x', L.num(L.tynat, 1)),
                                                           L.sprint(L.evar('x'))])
  })
})
