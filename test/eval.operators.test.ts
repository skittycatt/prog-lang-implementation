import { describe, expect, test } from '@jest/globals'
import * as L from '../src/lang'
import * as R from '../src/runtime'

const int1: L.Num = L.num(L.tynat, 4)
const int2: L.Num = L.num(L.tynat, 13)
const int3: L.Num = L.num(L.tynat, 1)
const float1: L.Num = L.num(L.tyfloat, 0.34)
const float2: L.Num = L.num(L.tyfloat, 222.22)
const float3: L.Num = L.num(L.tyfloat, 1.0)
const string1: L.SString = L.sstring('hello, world!')
const string2: L.SString = L.sstring('world..hello.')
const lam1: L.SLambda = L.slambda('test', L.tystr, L.evar('test'))
const lam2: L.SLambda = L.slambda('x', L.tystr, L.evar('x'))
const var1: L.Var = L.evar('c')
const var2: L.Var = L.evar('z')

const testEnv: L.Env = 
new Map([
])
testEnv.set('c', L.num(L.tynat, 7))
testEnv.set('z', L.bool(false))
describe('base cases', () => {
    test('num', () => {
        expect(R.evaluate(int1, testEnv)).toStrictEqual(int1)
        expect(R.evaluate(int2, testEnv)).toStrictEqual(int2)
        expect(R.evaluate(float1, testEnv)).toStrictEqual(float1)
        expect(R.evaluate(float3, testEnv)).toStrictEqual(float3)
    })
    test('string', () => {
        expect(R.evaluate(string1, testEnv)).toStrictEqual(string1)
        expect(R.evaluate(string2, testEnv)).toStrictEqual(string2)
    })
    test('bool', () => {
        expect(R.evaluate(L.bool(true), testEnv)).toStrictEqual(L.bool(true))
        expect(R.evaluate(L.bool(false), testEnv)).toStrictEqual(L.bool(false))
    })
    test('var', () => {
        expect(R.evaluate(var1, testEnv)).toStrictEqual(L.num(L.tynat, 7))
        expect(R.evaluate(var2, testEnv)).toStrictEqual(L.bool(false))
    })
    test('lambda', () => {
        expect(R.evaluate(lam1, testEnv)).toStrictEqual(lam1)
        expect(R.evaluate(lam2, testEnv)).toStrictEqual(lam2)
    })
})

describe('!e', () => {
    test('!bool', () => {
        expect(R.evaluate(L.not(L.bool(true)), testEnv)).toStrictEqual(L.bool(false))
        expect(R.evaluate(L.not(L.bool(false)), testEnv)).toStrictEqual(L.bool(true))
    })
    test('!number', () => {
        expect(function() {R.evaluate(L.not(int2), testEnv)}).toThrow(TypeError)
        expect(function() {R.evaluate(L.not(float1), testEnv)}).toThrow(TypeError)
    })
    test('!lambda', () => {
        expect(function() {R.evaluate(L.not(lam1), testEnv)}).toThrow(TypeError)
    })
    test('!string', () => {
        expect(function() {R.evaluate(L.not(string1), testEnv)}).toThrow(TypeError)
    })
    test('!var', () => {
        expect(function() {R.evaluate(L.not(var1), testEnv)}).toThrow(TypeError)
    })
})

describe('(+ e1 e2)', () => {
    test('integer + integer', () => {
        expect(R.evaluate(L.plus(int1, int2), testEnv)).toStrictEqual(L.num(L.tynat, 17))
    })
    test('float + float', () => {
        expect(R.evaluate(L.plus(float1, float2), testEnv))
            .toStrictEqual(L.num(L.tyfloat, 222.56))
    })
    test('integer + float', () => {
        expect(R.evaluate(L.plus(int1, float2), testEnv))
            .toStrictEqual(L.num(L.tyfloat, 226.22))
    })
    test('non-number + integer', () => {
        expect(function() {R.evaluate(L.plus(string1, int1), testEnv)}).toThrow(TypeError)
        expect(function() {R.evaluate(L.plus(L.bool(true), int2), testEnv)}).toThrow(TypeError)
        expect(function() {R.evaluate(L.plus(float1, lam1), testEnv)}).toThrow(TypeError)
    })
    test('non-number + non-number', () => {
        expect(function() {R.evaluate(L.plus(string1, L.bool(false)), testEnv)}).toThrow(TypeError)
        expect(function() {R.evaluate(L.plus(L.bool(true), var1), testEnv)}).toThrow(TypeError)
        expect(function() {R.evaluate(L.plus(lam1, string1), testEnv)}).toThrow(TypeError)
    })
})

describe('(= e1 e2)', () => {
    test('equivalence of self', () => {
        expect(R.evaluate(L.eq(int1, int1), testEnv)).toStrictEqual(L.bool(true))
        expect(R.evaluate(L.eq(float3, float3), testEnv)).toStrictEqual(L.bool(true))
        expect(R.evaluate(L.eq(lam2, lam2), testEnv)).toStrictEqual(L.bool(true))
        expect(R.evaluate(L.eq(string2, string2), testEnv)).toStrictEqual(L.bool(true))
        expect(R.evaluate(L.eq(L.bool(true), L.bool(true)), testEnv)).toStrictEqual(L.bool(true))
        expect(R.evaluate(L.eq(var1, var1), testEnv)).toStrictEqual(L.bool(true))
    })
    test('equivalence of like objects', () => {
        expect(R.evaluate(L.eq(int1, int3), testEnv)).toStrictEqual(L.bool(false))
        expect(R.evaluate(L.eq(float1, float3), testEnv)).toStrictEqual(L.bool(false))
        expect(R.evaluate(L.eq(lam1, lam2), testEnv)).toStrictEqual(L.bool(false))
        expect(R.evaluate(L.eq(string1, string2), testEnv)).toStrictEqual(L.bool(false))
        expect(R.evaluate(L.eq(L.bool(true), L.bool(false)), testEnv)).toStrictEqual(L.bool(false))
        expect(R.evaluate(L.eq(var1, var2), testEnv)).toStrictEqual(L.bool(false))
    })
    test('equivalence of different objects', () => {
        expect(R.evaluate(L.eq(int3, float3), testEnv)).toStrictEqual(L.bool(true))
        expect(R.evaluate(L.eq(int2, L.bool(true)), testEnv)).toStrictEqual(L.bool(false))
        expect(R.evaluate(L.eq(lam1, string2), testEnv)).toStrictEqual(L.bool(false))
        expect(R.evaluate(L.eq(float2, lam2), testEnv)).toStrictEqual(L.bool(false))
    })
})

describe('(and e1 e2)', () => {
    test('bool && bool', () => {
        expect(R.evaluate(L.and(L.bool(true), L.bool(false)), testEnv)).toStrictEqual(L.bool(false))
        expect(R.evaluate(L.and(L.bool(false), L.bool(false)), testEnv)).toStrictEqual(L.bool(false))
        expect(R.evaluate(L.and(L.bool(true), L.bool(true)), testEnv)).toStrictEqual(L.bool(true))
    })
    test('bool && non-bool', () => {
        expect(function() {R.evaluate(L.and(L.bool(true), int1), testEnv)}).toThrow(TypeError)
        expect(function() {R.evaluate(L.and(L.bool(false), float1), testEnv)}).toThrow(TypeError)
        expect(function() {R.evaluate(L.and(L.bool(true), lam1), testEnv)}).toThrow(TypeError)
        expect(function() {R.evaluate(L.and(L.bool(false), string1), testEnv)}).toThrow(TypeError)
        expect(function() {R.evaluate(L.and(L.bool(true), var1), testEnv)}).toThrow(TypeError)
    })
    test('non-bool && non-bool', () => {
        expect(function() {R.evaluate(L.and(int2, lam2), testEnv)}).toThrow(TypeError)
        expect(function() {R.evaluate(L.and(float1, string2), testEnv)}).toThrow(TypeError)
        expect(function() {R.evaluate(L.and(L.bool(true), int1), testEnv)}).toThrow(TypeError)
    })
})

describe('(or e1 e2)', () => {
    test('bool || bool', () => {
        expect(R.evaluate(L.or(L.bool(true), L.bool(false)), testEnv)).toStrictEqual(L.bool(true))
        expect(R.evaluate(L.or(L.bool(true), L.bool(true)), testEnv)).toStrictEqual(L.bool(true))
        expect(R.evaluate(L.or(L.bool(false), L.bool(false)), testEnv)).toStrictEqual(L.bool(false))
    })
    test('bool || non-bool', () => {
        expect(function() {R.evaluate(L.or(L.bool(false), lam1), testEnv)}).toThrow(TypeError)
        expect(function() {R.evaluate(L.or(L.bool(true), string1), testEnv)}).toThrow(TypeError)
        expect(function() {R.evaluate(L.or(L.bool(false), int1), testEnv)}).toThrow(TypeError)
        expect(function() {R.evaluate(L.or(L.bool(true), float1), testEnv)}).toThrow(TypeError)
        expect(function() {R.evaluate(L.or(L.bool(false), var1), testEnv)}).toThrow(TypeError)
    })
    test('non-bool || non-bool', () => {
        expect(function() {R.evaluate(L.or(var1, int2), testEnv)}).toThrow(TypeError)
        expect(function() {R.evaluate(L.or(float2, lam2), testEnv)}).toThrow(TypeError)
        expect(function() {R.evaluate(L.or(string1, lam1), testEnv)}).toThrow(TypeError)
    })
})
describe('(if e1 e2 e3)', () => {
    test('e1 = true returns e2', () => {
        expect(R.evaluate(L.ife(L.bool(true), int2, int3), testEnv)).toStrictEqual(int2)
        expect(R.evaluate(L.ife(L.bool(true), float1, float2), testEnv)).toStrictEqual(float1)
        expect(R.evaluate(L.ife(L.bool(true), var2, int1), testEnv)).toStrictEqual(L.bool(false))
    })
    test('e1 = false returns e3', () => {
        expect(R.evaluate(L.ife(L.bool(false), lam1, lam2), testEnv)).toStrictEqual(lam2)
        expect(R.evaluate(L.ife(L.bool(false), string1, string2), testEnv)).toStrictEqual(string2)
        expect(R.evaluate(L.ife(L.bool(false), var2, int1), testEnv)).toStrictEqual(int1)
    })
    test('non-bool guard throws error', () => {
        expect(function() {R.evaluate(L.ife(lam1, int1, int2), testEnv)}).toThrow(TypeError)
        expect(function() {R.evaluate(L.ife(float3, int1, int2), testEnv)}).toThrow(TypeError)
        expect(function() {R.evaluate(L.ife(string2, int1, int2), testEnv)}).toThrow(TypeError)
        expect(function() {R.evaluate(L.ife(int2, int1, int2), testEnv)}).toThrow(TypeError)
        expect(function() {R.evaluate(L.ife(var1, int1, int2), testEnv)}).toThrow(TypeError)
    })
})
const lam3: L.SLambda = L.slambda('y', L.tynat, L.plus(L.evar('y'), int3))
const lam4: L.SLambda = L.slambda('a', L.tybool, L.and(L.evar('a'), L.bool(true)))
describe('(-> e1 e2)', () => {
    test('e1 = lambda returns evaluate(e2)', () => {
        expect(R.evaluate(L.app(lam3, int1), testEnv)).toStrictEqual(L.num(L.tynat, 5))
        expect(R.evaluate(L.app(lam3, int2), testEnv)).toStrictEqual(L.num(L.tynat, 14))
        expect(R.evaluate(L.app(lam4, L.bool(true)), testEnv)).toStrictEqual(L.bool(true))
        expect(R.evaluate(L.app(lam4, L.bool(false)), testEnv)).toStrictEqual(L.bool(false))
    })
    test('e1 != lambda throws error', () => {
        expect(function() {R.evaluate(L.app(int2, int1), testEnv)}).toThrow(TypeError)
        expect(function() {R.evaluate(L.app(float2, int1), testEnv)}).toThrow(TypeError)
        expect(function() {R.evaluate(L.app(string1, int1), testEnv)}).toThrow(TypeError)
        expect(function() {R.evaluate(L.app(var2, int1), testEnv)}).toThrow(TypeError)
        expect(function() {R.evaluate(L.app(L.bool(true), int1), testEnv)}).toThrow(TypeError)
    })
})