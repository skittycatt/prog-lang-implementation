import { describe, expect, test } from '@jest/globals'
import * as L from '../src/lang'
import * as P from '../src/translator'
import * as S from '../src/sexp'
import * as T from '../src/typechecker'
import * as R from '../src/runtime'
import * as I from '../src/interpreter'

// runs evaluation on a single expression
function run_exp(src: string): L.Value {
  const testEnv = R.makeInitialEnv()
  let testStore = R.initialStore()
  return I.evaluate(testEnv, testStore, P.translateExp(S.parse1(src)))
}

// runs evaluation on a Program (a set of Statements)
function run_prog(src: string): string[] {
  const testEnv = R.makeInitialEnv()
  let testStore = R.initialStore()
  const testProg = P.translateProg(S.parse(src))
  return I.execute(testEnv, testStore, testProg)
}

describe('Lexer & Parser', () => {
  test('numbers', () => {
    expect(S.parse1('5')).toStrictEqual({ tag: 'atom', value: '5' })
    expect(S.parse1('17.4')).toStrictEqual({ tag: 'atom', value: '17.4' })
  })
  test('boolean', () => {
    expect(S.parse1('true')).toStrictEqual({ tag: 'atom', value: 'true' })
    expect(S.parse1('false')).toStrictEqual({ tag: 'atom', value: 'false' })
  })
  test('variables', () => {
    expect(S.parse1('x')).toStrictEqual({ tag: 'atom', value: 'x' })
  })
  test('lambda', () => {
    expect(S.parse1('(lambda x Num (+ x 8))'))
      .toStrictEqual({ tag: 'slist', exps: [{ tag: 'atom', value: 'lambda' }, { tag: 'atom', value: 'x' }, { tag: 'atom', value: 'Num' },
                      { tag: 'slist', exps: [{ tag: 'atom', value: '+' }, { tag: 'atom', value: 'x' }, { tag: 'atom', value: '8' }]}]})
  })
  test('new pointer', () => {
    expect(S.parse1('(new Num)')).toStrictEqual({ tag: 'slist', exps: [{ tag: 'atom', value: 'new' }, { tag: 'atom', value: 'Num' }] })
    expect(S.parse1('(new Bool)')).toStrictEqual({ tag: 'slist', exps: [{ tag: 'atom', value: 'new' }, { tag: 'atom', value: 'Bool' }]})
  })
  test('deref pointer', () => {
    expect(S.parse1('(deref x)')).toStrictEqual({ tag: 'slist', exps: [{ tag: 'atom', value: 'deref' }, { tag: 'atom', value: 'x' }]})
  })
  test('statements', () => {
    expect(S.parse('(define x 1) (print x) (assign x 3)'))
      .toStrictEqual([{ tag: 'slist', exps: [{ tag: 'atom', value: 'define' }, { tag: 'atom', value: 'x' }, { tag: 'atom', value: '1' }]},
                      { tag: 'slist', exps: [{ tag: 'atom', value: 'print' }, { tag: 'atom', value: 'x' }]},
                      { tag: 'slist', exps: [{ tag: 'atom', value: 'assign' }, { tag: 'atom', value: 'x' }, { tag: 'atom', value: '3'}]}])
  })
})

describe('Translator', () => {
  test('numbers', () => {
    expect(P.translateExp(S.parse1('3'))).toStrictEqual(L.num(3))
    expect(P.translateExp(S.parse1('6.5'))).toStrictEqual(L.num(6.5))
    expect(P.translateExp(S.parse1('0'))).toStrictEqual(L.num(0))
  })
  test('booleans', () => {
    expect(P.translateExp(S.parse1('true'))).toStrictEqual(L.bool(true))
    expect(P.translateExp(S.parse1('false'))).toStrictEqual(L.bool(false))
  })
  test('variables', () => {
    expect(P.translateExp(S.parse1('x'))).toStrictEqual(L.evar('x'))
  })
  test('lambda', () => {
    expect(P.translateExp(S.parse1('(lambda x Bool x)'))).toStrictEqual(L.lam('x', L.tybool, L.evar('x')))
  })
  test('new pointer', () => {
    expect(P.translateExp(S.parse1('(new Num)'))).toStrictEqual(L.neww(L.keyword('Num'), 1))
    expect(P.translateExp(S.parse1('(new Bool)'))).toStrictEqual(L.neww(L.keyword('Bool'), 1))
  })
  test('deref pointer', () => {
    expect(P.translateExp(S.parse1('(deref x)'))).toStrictEqual(L.deref(L.evar('x')))
  })
  test('statements', () => {
    expect(P.translateProg(S.parse('(define x 1) (print x) (assign x 3)')))
      .toStrictEqual([L.sdefine('x', L.num(1)), L.sprint(L.evar('x')), L.sassign(L.evar('x'), L.num(3))])
  })
})

describe('Evaluate base case', () => {
  test('numbers', () => {
    expect(run_exp('385')).toStrictEqual(L.num(385))
    expect(run_exp('0')).toStrictEqual(L.num(0))
  })
  test('booleans', () => {
    expect(run_exp('true')).toStrictEqual(L.bool(true))
    expect(run_exp('false')).toStrictEqual(L.bool(false))
  })
  test('variables', () => {
    expect(run_prog('(define x 3) (print x)')).toStrictEqual(['3'])
  })
  test('lambda', () => {
    expect(run_exp('(lambda x Num x)')).toStrictEqual(L.closure('x', L.evar('x'), R.makeInitialEnv()))
  })
  test('new pointer', () => { 
    expect(run_exp('(new Num)')).toStrictEqual(L.pointer(0, [0, 0]))
    expect(run_exp('(new Bool)')).toStrictEqual(L.pointer(0, [0, 0]))
  })
  // deref has to be tested with a pointer defined in scope
  test('deref pointer', () => { 
    expect(run_prog('(define x (new Num)) (print (deref x))')).toStrictEqual(["0"])
  })
})

describe('Primitives', () => {
  test('arith with two numbers', () => {
    expect(run_exp('(+ 6 1)')).toStrictEqual(L.num(7))
    expect(run_exp('(/ 6.0 2)')).toStrictEqual(L.num(3.0)) // test for floats
    expect(run_exp('(* 14 0)')).toStrictEqual(L.num(0))
    expect(run_exp('(- 10 2)')).toStrictEqual(L.num(8))
  })
  test('throw error for non-numbers', () => {
    expect(function() {run_exp('(+ true 9)')}).toThrowError
    expect(function() {run_exp('(- (new Num) 9)')}).toThrowError
    expect(function() {run_exp('(* 2.1 false)')}).toThrowError
    expect(function() {run_exp('(/ 19 x)')}).toThrowError
  })
})

const prog1 = `
(define x (new Num 2))
(print x)
(define y (new Num))
(print y)
`
const prog2 = `
(define a (new Num))
(define b (new Num))
(print (deref b))
`
const prog3 = `
(define x (new Num))
(assign x 3)
(print (deref x))
`
const prog4 = `
(define x (new Num))
(assign x 3)
(print (deref x))
(assign x 50)
(print (deref x))
`
const prog5 = `
(define x (new Num))
(assign x 8)
(define y (new Bool))
(print (deref (pointer_arith + x 1)))
`
const prog6 = `
(define x (new Num))
(define y (new Bool))
(assign (pointer_arith - y 1) 5)
(print (deref x))
`
const prog7 = `
(define x (new Num))
(assign (pointer_arith + x 3) 10)
`
const prog8 = `
(define x (new Num))
(print (deref (pointer_arith - x 30)))
`
const prog9 = `
(define x (new Num))
(assign x true)
`
const prog10 = `
(define x (new Num 5))
(assign (pointer_arith + x 2) 10)
(print (deref (pointer_arith + x 2)))
`

describe('Pointers', () => {
  test('returns index', () => {
    expect(run_prog(prog1)).toStrictEqual(["index: 0 low-bound: 0 up-bound: 1", "index: 2 low-bound: 2 up-bound: 2"])
  })
  test('returns value stored', () => {
    expect(run_prog(prog2)).toStrictEqual(["0"])
  })
  test('assign pointer value', () => {
    expect(run_prog(prog3)).toStrictEqual(["3"])
  })
  test('reassign pointer value', () => {
    expect(run_prog(prog4)).toStrictEqual(["3", "50"])
  })
})

// Pointers are easy to use incorrectly, so I tested many of the potential errors
// to ensure that they throw an error and don't let through a silent mistake
describe('Pointer_Arith', () => {
  test('access index out of bounds error', () => {
    expect(function() {run_prog(prog5)}).toThrowError
  })
  test('change value out of bounds error', () => {
    expect(function() {run_prog(prog6)}).toThrowError
  })
  test('undefined value at index error', () => {
    expect(function() {run_prog(prog7)}).toThrowError
  })
  test('out of bounds error', () => {
    expect(function() {run_prog(prog8)}).toThrowError
  })
  test('assign bool on num index error', () => {
    expect(function() {run_prog(prog9)}).toThrowError
  })
  test('assign new value within bounds', () => {
    expect(run_prog(prog10)).toStrictEqual(['10'])
  })
})

